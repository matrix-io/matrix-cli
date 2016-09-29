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
    Matrix.startLoader();
    if (err) {
      Matrix.stopLoader();
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
    Matrix.config.client = {}

    /** authenticate client and user **/
    debug('Client', Matrix.options);
    Matrix.api.auth.client(Matrix.options, function (err, out) {
      if (err) throw err;
      debug('User', Matrix.config.user, out);
      Matrix.api.auth.user(Matrix.config.user, function (err, state) {
        if (err) {
          Matrix.stopLoader();
          console.error('Matrix CLI :'.grey, t('matrix.login.user_auth_error').yellow + ':'.yellow, err.message.red);
          process.exit(1);
        }
        debug('User Login OK', state);
        Matrix.config.user.token = state.access_token;
        Matrix.config.user.id = state.id;

        /** token stores, delete extra stuff **/
        // delete Matrix.config.user.username;
        delete Matrix.config.user.password;

        // download apps and devices belonging to user
        // from `users` in firebase
        Matrix.firebaseInit( function(){

          Matrix.firebase.user.getAllApps(function (err, resp) {
            debug('Device List>', resp);

            // save for later
            Matrix.config.appMap = resp;
            Matrix.helpers.saveConfig(function(){
              /** save the creds if it's good **/
              Matrix.stopLoader();
              console.log(t('matrix.login.login_success').green, ':'.grey, result.username);
              process.exit();
            })
          });
        });
      });
    });
  });
});
