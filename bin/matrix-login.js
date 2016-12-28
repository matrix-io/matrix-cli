#!/usr/bin/env node

require('./matrix-init');
var prompt = require('prompt');
var debug = debugLog('login');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  var schema = {
    properties: {
      username: {
        required: true,
        pattern: /\S+@\S+\.\S+/
      },
      password: {
        hidden: true
      }
    }
  };

  var oldTrack;
  // if user has not answered tracking question before
  if ( !_.has(Matrix.config,'user.trackOk') ){
    schema.properties.trackOk = {
      description: "Share usage information? (Y/n)",
      default: 'y',
      pattern: /y|n|yes|no|Y|N/,
      message: "Please answer y or n."
    };
  } else {
    oldTrack = Matrix.config.user.trackOk;
  }

  if (!_.isEmpty(Matrix.config.user)) {
    console.log(t('matrix.already_login').yellow, ' ', Matrix.config.user.username);
  }
  prompt.delimiter = '';
  prompt.message = 'Login -- ';
  prompt.start();
  prompt.get(schema, function (err, result) {
    Matrix.loader.start();
    if (err) {
      Matrix.loader.stop();
      if (err.toString().indexOf('canceled') > 0) {
        console.log('');
        process.exit();
      } else {
        console.log("Error: ", err);
        process.exit();
      }
    }

    /** set the creds **/
    Matrix.config.user = {
      username: result.username,
      password: result.password
    };

    Matrix.config.user.jwt_token = true;

    // configure monitoring
    if ( _.has(result, 'trackOk')){
      result.trackOk = ( result.trackOk[0].toLowerCase() === 'y' ) ? true : false;
    }

    /** set the client to empty **/
    Matrix.config.client = {};

    /** authenticate client and user **/
    debug('Client', Matrix.options);
    Matrix.api.auth.client(Matrix.options, function (err, out) {
      if (err) {
        Matrix.loader.stop();
        debug('Client auth error: ', err);
        console.log('Matrix CLI :'.grey, t('matrix.login.user_auth_error').yellow + ':'.yellow, err.message.red);
        process.exit(1);
      }
      debug('User', Matrix.config.user, out);
      Matrix.api.auth.user(Matrix.config.user, function (err, state) {
        if (err) {
          Matrix.loader.stop();
          debug('User auth error: ', err);
          console.log('Matrix CLI :'.grey, t('matrix.login.user_auth_error').yellow + ':'.yellow, err.message.red);
          process.exit(1);
        }
        debug('User Login OK', state);
        Matrix.config.user.token = state.access_token;
        Matrix.config.user.id = state.id;
        // true / false not y/n
        Matrix.config.user.trackOk = result.trackOk || oldTrack;

        if (result.trackOk === true){
          process.env.TRACKOK = true;
          //TODO Event is not tracked if the token expired, maybe add another event for successful login?
          Matrix.helpers.trackEvent('user-login');
        }

        /** token stores, delete extra stuff **/
        // delete Matrix.config.user.username;
        delete Matrix.config.user.password;

        // download apps and devices belonging to user
        // from `users` in firebase
        Matrix.firebaseInit( function(){

          if ( Matrix.config.user.trackOk ){
            Matrix.firebase.user.allowTracking();
          } else {
            Matrix.firebase.user.denyTracking();
          }

          Matrix.helpers.refreshDeviceMap(function(){
            /** save the creds if it's good **/
            Matrix.loader.stop();
            console.log(t('matrix.login.login_success').green, ':'.grey, result.username);

            //Verify if the user has a device to be used
            if (Matrix.config.keepDevice && _.has(Matrix.config.keepDevice, Matrix.config.user.id)){
              //Get the device name
              var deviceName = Matrix.config.keepDevice[Matrix.config.user.id].name;
              //Get the device token
              Matrix.api.device.register( Matrix.config.keepDevice[Matrix.config.user.id].identifier, function(err, state) {
                if (err) return console.log(err);
                //Verify if the devices status is OK.
                if (state.status === "OK") {
                  //Save the device token And Put the device into use
                  Matrix.config.device = {}
                  Matrix.config.device.identifier = Matrix.config.keepDevice[Matrix.config.user.id].identifier;
                  Matrix.config.device.token = state.results.device_token;
                }
                //Clear the object for keep device after session expired
                delete Matrix.config.keepDevice[Matrix.config.user.id];
                if(Object.keys(Matrix.config.keepDevice).length === 0){
                  Matrix.config = _.omit(Matrix.config, ['keepDevice']);
                }
                //Save config
                Matrix.helpers.saveConfig(function(){
                  if( Matrix.config.device){
                    console.log('Using device:'.grey, deviceName, 'ID:'.grey, Matrix.config.device.identifier);
                  }
                  process.exit();
                });
              });
            } else {
              process.exit();
            }
          });
        });
      });
    });
  });
});
