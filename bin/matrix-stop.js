#!/usr/bin/env node

const commandTimeoutSeconds = 30;
var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('stop');
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
    console.log('\n> matrix stop <app> - ' + t('matrix.help_stop').grey + '\n');
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
    console.log(t('matrix.stop.stopping_app') + ': ', app, did.identifier);
    Matrix.loader.start();

    //Get the app id for name
    Matrix.firebase.app.getIDForName(did.identifier, app, function (err, appId) {
      if (err) {
        Matrix.loader.stop();
        console.log(t('matrix.stop.app_undefined').red);
        return Matrix.endIt(1, 0);
      }
      debug('appId>', appId);
      //Get the current status of app
      Matrix.firebase.app.getStatus(did.identifier, appId, function (status) {
        debug('Get current status: ' + Matrix.config.user.id + '>' + did.identifier + '>' + appId + '>' + status);
        Matrix.loader.stop();

        if (_.isUndefined(app)) {

          console.log('\n> matrix stop ¬\n');
          console.log('\t    matrix stop <app> -', t('matrix.stop.help', { app: '<app>' }).grey)
          Matrix.endIt();

          //If the status of the app is different of active doesn't execute de stop command
        } else if (status !== 'active') {
          console.log(t('matrix.stop.stop_app_status_error') + ':', app);
          Matrix.endIt();
        } else {
          console.log(t('matrix.stop.stopping_app') + ': ', app);
          var commandTimeout;
          
          Matrix.loader.start();
          
          //this is for node-sdk so the payload has each device token for time
          Matrix.config.device = did;
          Matrix.api.setConfig(Matrix.config);

          //Watch the app status and verify if the behavior it's right
          Matrix.firebase.app.watchStatus(did.identifier, appId, function (status) {
            //stop command status behavior(active -> inactive)
            if (status === 'inactive') {
              Matrix.loader.stop();
              clearTimeout(commandTimeout);
              console.log(t('matrix.stop.stop_app_successfully') + ':', app);
              Matrix.endIt();
            }
          });

          //Send the stop command
          Matrix.api.app.stop(app, did, function (err) {
            if (err) {
              Matrix.loader.stop();
              console.log(t('matrix.stop.stop_app_error') + ':', app, ' (' + err.message.red + ')');
              Matrix.endIt();
            }

            //add timeout to start command
            commandTimeout = setTimeout(function () {
              Matrix.loader.stop();
              console.log(t('matrix.stop.stop_timeout'));
              Matrix.endIt();
            }, commandTimeoutSeconds * 1000);

          });
        }
      });
    });
  });
  
});
