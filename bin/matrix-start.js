#!/usr/bin/env node

const commandTimeoutSeconds = 30;
var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('start');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  function (cb) {
    Matrix.firebaseInit(cb)
  },
  function(cb) {
    // group flow
    if (!_.isEmpty(Matrix.config.group)) {
      async.series([
        Matrix.validate.groupAsync
      ], function(err) {
        if (err) return cb(err);
        return cb(null);
      }); 
    } 
    // single device flow
    else {
      async.series([
        Matrix.validate.deviceAsync
      ], function(err) {
        if (err) return cb(err);
        return cb(null);
      });
    }
  },
], function (err) {

  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  var app = Matrix.pkgs[0];
  if (_.isUndefined(app) || !_.isString(app)) {
    Matrix.loader.stop();
    console.log('\n> matrix start <app> - ' + t('matrix.help_start').grey + '\n');
    process.exit(1);
  }

  if (!_.isUndefined(Matrix.config.group)) {
    Matrix.config.device = {};
    Matrix.config.device.identifier = Matrix.config.group.devices;
    async.map(Matrix.config.group.devices, function(data){
      Matrix.helpers.trackEvent('app-start', { aid: app, did: data.identifier });
    });
  } else {
    Matrix.helpers.trackEvent('app-start', { aid: app, did: Matrix.config.device.identifier });
  }


  async.map(Matrix.config.device.identifier, function(did) {
    Matrix.api.device.setId(did.identifier);
    Matrix.loader.stop();
    console.log(t('matrix.start.starting_app') + ': ', app, did.identifier);
    Matrix.loader.start();

    //Get the app id for name
    Matrix.firebase.app.getIDForName(did.identifier, app, function(err, appId) {
      if (err) {
        Matrix.loader.stop();
        console.error(t('matrix.start.app_undefined').red);
        return Matrix.endIt(1, 0);
      }
      debug('appId>', appId);
      //Get the current status of app
      Matrix.firebase.app.getStatus(did.identifier, appId, function(status) {
        debug('Get current status: ' + Matrix.config.user.id + '>' + did.identifier + '>' + appId + '>' + status);
        Matrix.loader.stop();

        if (_.isUndefined(app)) {
          console.log('\n> matrix start ¬\n');
          console.log('\t    matrix start <app> -', t('matrix.start.help', { app: '<app>' }).grey)
          Matrix.endIt();

          //If the status of the app is different of active or error doesn't execute de start command
        } else if (status === 'active' || status === 'pending') {
          console.log(t('matrix.start.start_app_status_error') + ':', app, status.green);
          Matrix.endIt();
        } else {
          console.log(t('matrix.start.starting_app') + ': ', app);
          var commandTimeout;

          Matrix.loader.start();
          
          //this is for node-sdk so the payload has each device token for time
          Matrix.config.device = did;
          Matrix.api.setConfig(Matrix.config);


          //Watch the app status and verify if the behavior it's right
          Matrix.firebase.app.watchStatus(did.identifier, appId, function(status) {
            //stop command status behavior(inactive or error -> active)
            if (status === 'active') {
              Matrix.loader.stop();
              clearTimeout(commandTimeout);
              console.log(t('matrix.start.start_app_successfully') + ': ', app);
              Matrix.endIt();

            } else if (status === 'error') {
              Matrix.loader.stop();
              clearTimeout(commandTimeout);
              console.error('The application failed to start, please update it and try again. \nIf it keeps failing you may want to contact the developer.'.yellow);
              Matrix.endIt();
            }
          });

          //Send the start command
          Matrix.api.app.start(app, did, function(err, res) {
            if (err) {
              Matrix.loader.stop();
              console.log(t('matrix.start.start_app_error') + ':', app, ' (' + err.message.red + ')');
              Matrix.endIt();
            }

            //add timeout to start command
            commandTimeout = setTimeout(function () {
              Matrix.loader.stop();
              console.log(t('matrix.start.start_timeout'));
              Matrix.endIt();
            }, commandTimeoutSeconds * 1000);

          });
        } //else
      });
    });
  });

});
