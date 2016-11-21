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

        /** token stores, delete extra stuff **/
        // delete Matrix.config.user.username;
        delete Matrix.config.user.password;

        if(Matrix.config.keepDevice && _.has(Matrix.config.keepDevice, Matrix.config.user.id)){
          var deviceName = Matrix.config.keepDevice[Matrix.config.user.id].name;
          Matrix.api.device.register( Matrix.config.keepDevice[Matrix.config.user.id].identifier, function(err, state) {
            if (err) return console.log(err);
            if (state.status === "OK") {
              // Save the device token
              Matrix.config.device = {}
              Matrix.config.device.identifier = Matrix.config.keepDevice[Matrix.config.user.id].identifier;
              Matrix.config.device.token = state.results.device_token;
            }

            delete Matrix.config.keepDevice[Matrix.config.user.id];
            if(Object.keys(Matrix.config.keepDevice).length === 0){
              Matrix.config = _.omit(Matrix.config, ['keepDevice']);
            }
            Matrix.helpers.saveConfig(function(){
              if( Matrix.config.device){
                console.log('Now using device:'.grey, deviceName, 'ID:'.grey, Matrix.config.device.identifier);
              }
            });
          });
        }

        // download apps and devices belonging to user
        // from `users` in firebase
        Matrix.firebaseInit( function(){
          Matrix.helpers.refreshDeviceMap(function(){
            /** save the creds if it's good **/
            Matrix.loader.stop();
            console.log(t('matrix.login.login_success').green, ':'.grey, result.username);
            process.exit();
          });
        });
      });
    });
  });
});
