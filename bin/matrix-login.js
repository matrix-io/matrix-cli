#!/usr/bin/env node

var prompt = require('prompt');
var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('login');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
], function(err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  var schema = {
    properties: {
      username: {
        required: true,
        pattern: /\S+@\S+.\S+/
      },
      password: {
        hidden: true
      }
    }
  };

  var user = {};

  if (!_.isEmpty(Matrix.config.user)) {
    Matrix.loader.stop();
    if (Matrix.validate.token() === false) {
      console.log('The token has expired. Last session started:'.yellow, Matrix.config.user.username);
    } else {
      console.log(t('matrix.already_login').yellow + ':', Matrix.config.user.username);
    }
  }

  prompt.delimiter = '';
  prompt.message = 'Login -- ';

  async.waterfall([
    function(callback){
      prompt.start();
      prompt.get(schema, function (err, result) {
        user.username = result.username;
        user.password = result.password;

        if (err) {
          Matrix.loader.stop();
          if (err.toString().indexOf('canceled') > 0) callback('')
          else callback('Error: ', err);
        }
        callback(null, user);
      });
    }, function(user, callback) {
      var oldTrack;
      var schemaTrack = { properties: { } };
      //if user has not answered tracking question before
      if (!_.has(Matrix.config, 'trackOk')) {
         schemaTrack.properties.trackOk = {
           description: "Share usage information? (Y/n)",
           default: 'y',
           pattern: /y|n|yes|no|Y|N/,
           message: "Please answer y or n."
         };
       } else if(_.isUndefined(Matrix.config.trackOk[user.username])) {
         schemaTrack.properties.trackOk = {
           description: "Share usage information? (Y/n)",
           default: 'y',
           pattern: /y|n|yes|no|Y|N/,
           message: "Please answer y or n."
         };
        } else {
          oldTrack = Matrix.config.trackOk[user.username];
        }
      callback(null, user, schemaTrack, oldTrack);
    }, function(user, schemaTrack, oldTrack, callback) {
      prompt.start();
      prompt.get(schemaTrack, function (err, result) {
        Matrix.loader.start();
        if (err) {
          Matrix.loader.stop();
          if (err.toString().indexOf('canceled') > 0) callback('')
          else callback('Error: ', err);
        }
        user.trackOk = _.has(result, 'trackOk') ? result.trackOk : oldTrack;
        Matrix.helpers.login(user, function(err) {
          if (err) callback(err);
          callback(null);
        });
      });
    }
  ], function(err){
    if (err) console.log(err);
    process.exit();
  });
});