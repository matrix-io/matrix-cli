#!/usr/bin/env node

require('./matrix-init');
var prompt = require('prompt');
var debug = debugLog('register');
var request = require('request');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var schema = {
    properties: {
      username: {
        required: true,
        pattern: /\S+@\S+\.\S+/,
        message: 'Username must be a valid email',
        description: 'Username: '
      },
      password: {
        required: true,
        pattern: /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{6,}/,
        message: 'Password must be at least 6 characters long and should contain a lower case letter and a number',
        hidden: true,
        description: 'Password: '
      },
      confirmPassword: {
        hidden: true,
        description: 'Confirm Password: '
      }
    }
  };

  prompt.delimiter = '';
  prompt.message = 'Registration -- ';
  prompt.start();
  prompt.get(schema, function (err, result) {
    if (err) {
      if (err.toString().indexOf('canceled') > 0) {
        console.log('');
        process.exit();
      } else { 
        console.log("Error: ", err);
        process.exit();
      }
    }
    if (result.password != result.confirmPassword) {
      return console.error("Passwords didn't match");
    }

    /** set the creds **/
    Matrix.config.user = {
      username: result.username,
      password: result.password
    };
    
    Matrix.config.user.jwt_token = true;

    Matrix.config.client = {};
    debug('Client', Matrix.options);
    
    /*request.post(params, function(error, response, body) {
    };*/


    Matrix.api.register.user(result.username, result.password, Matrix.options.clientId, function (err, out) {
      /*500 server died
      400 bad request
        user exists
        missing parameter
      401*/ 
      if (err){
        if(err.hasOwnProperty('status_code')){
            if(err.status_code == 500){
              console.log('Server unavailable, please try again later');
            } else if (err.status_code == 400){
              console.log('Unable to create user ' + result.username + ', user already exists');
            } else {
              console.log('Unknown error (' + err.status_code + '): ', err);
            }
        } else {
          console.error("Unknown error: ", err);
        }
      } else {
        debug('User', Matrix.config.user, out);
        console.log('User ' + result.username + ' successfully created');
      }
      process.exit();
    });


    //process.exit();
  });
});
