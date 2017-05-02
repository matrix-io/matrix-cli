#!/usr/bin/env node

var prompt = require('prompt');
var async = require('async');

var debug;

async.series([
  require('./matrix-init'),
  function(cb) {
    debug = debugLog('login');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
], function(err) {
  if (err) return console.error(err);


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
  if (!_.has(Matrix.config, 'user.trackOk')) {
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
    if (Matrix.validate.token() === false) {
      console.log("The token has expired. Last session started :".yellow, ' ', Matrix.config.user.username);
    } else {
      console.log(t('matrix.already_login').yellow, ' ', Matrix.config.user.username);
    }
  }
  prompt.delimiter = '';
  prompt.message = 'Login -- ';
  prompt.start();
  prompt.get(schema, function(err, result) {
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
    if (!_.has(result, 'trackOk')) result.trackOk = oldTrack;
    Matrix.helpers.login(result, function(err) {
      process.exit();
    });
  });
});