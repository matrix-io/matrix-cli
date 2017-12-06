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
  Matrix.validate.deviceAsync,
  function (cb) {
    Matrix.firebaseInit(cb)
  }
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

  //check if device.identifier exists
  if (Matrix.config.device.identifier == null) Matrix.config.device.identifier = Matrix.config.devices;

  Matrix.helpers.trackEvent('app-stop', { aid: app, did: Matrix.config.device.identifier });

  Matrix.api.device.setId(Matrix.config.device.identifier);
  Matrix.loader.stop();
  console.log(t('matrix.stop.stopping_app') + ': ', app, Matrix.config.device.identifier);
  Matrix.loader.start();

  //Get the app id for name
  Matrix.firebase.app.getIDForName(app, function (err, appId) {
    if (err) {
      Matrix.loader.stop();
      console.log(t('matrix.stop.app_undefined').red);
      return Matrix.endIt(1, 0);
    }
    debug('appId>', appId);
    //Get the current status of app
    Matrix.firebase.app.getStatus(appId, function (err, status) {
      debug('Get current status: ' + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
      Matrix.loader.stop();

      if (_.isArray(status)){
        //new array with the difference of status, if there's any status different from active,
        //then there's an app running, pending, with error or inactive  already
        var differenceArray = _.difference(status, 'active');
          //there's an app from one or more device(s)  not active
          if (differenceArray.lenght > 0) {
            console.log(t('matrix.stop.stop_app_status_error') + ':', app);
            Matrix.endIt();
          } else {
            //all status are active so changing array status to a single string 'active'
            status = status[0].toString();
          }
        //If the status of the app is different of active doesn't execute de stop command   
      }

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

        //Watch the app status and verify if the behavior it's right
        Matrix.firebase.app.watchStatus(appId, function (status) {
          //stop command status behavior(active -> inactive)
          if (status === 'inactive') {
            Matrix.loader.stop();
            clearTimeout(commandTimeout);
            console.log(t('matrix.stop.stop_app_successfully') + ':', app);
            Matrix.endIt();
          }
        });

        //Send the stop command
        Matrix.api.app.stop(app, Matrix.config.device.identifier, function (err) {

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
