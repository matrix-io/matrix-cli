#!/usr/bin/env node

require('./matrix-init');
var prompt = require('prompt');
var debug = debugLog('login');
var firebaseAppFlow = _.has(process.env, 'MATRIX_WORKER'); //Use new firebase flow if MATRIX_WORKER env var is found

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {


  var schema = {
    properties: {
      username: {
        required: true
      },
      password: {
        hidden: true
      }
    }
  };

  prompt.delimiter = '';
  prompt.message = 'matrix login -- ';
  prompt.start();
  prompt.get(schema, function(err, result) {
    if (err) throw err;

    /** set the creds **/
    Matrix.config.user = {
      username: result.username,
      password: result.password
    };

    if (firebaseAppFlow) {
      Matrix.config.user.jwt_token = true;
    }

    /** set the client to empty **/
    Matrix.config.client = {}

    /** authenticate client and user **/
    debug('Client', Matrix.options);
    Matrix.api.auth.client(Matrix.options, function(err, out) {
      if (err) throw err;
      debug('User', Matrix.config.user, out);
      Matrix.api.auth.user(Matrix.config.user, function (err, state) {
        if(err) return console.error('Matrix CLI :'.grey, t('matrix.login.user_auth_error').yellow + ':'.yellow, err.message.red );

        debug('User Login OK', state);
        Matrix.config.user.token = state.access_token;
        Matrix.config.user.id = state.id;

        /** token stores, delete extra stuff **/
        // delete Matrix.config.user.username;
        delete Matrix.config.user.password;
        Matrix.helpers.saveConfig(function() {
          console.log(t('matrix.login.login_success').green, ':'.grey, result.username);
          process.exit();
        });


        // set user token
      });
    });
    /** save the creds if it's good **/

  });
});
