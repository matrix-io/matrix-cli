#!/usr/bin/env node 

var commandTimeoutSeconds = 30;
var async = require('async');

async.series([
  require('./matrix-init'),
  function(cb) {
    Matrix.loader.start();

    debug = debugLog('restart');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb); 
  },
  Matrix.validate.userAsync,
  Matrix.validate.deviceAsync,
  function(cb){
    Matrix.firebaseInit(cb)
  }
], function cb(err) {

  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  var app = Matrix.pkgs[0];
  if (_.isUndefined(app) || !_.isString(app)) {
    console.log('\n> matrix restart <app> - ' + t('matrix.help_restart').grey + '\n');
    process.exit(1);
  }

  //check if device.identifier exists
  if (Matrix.config.device.identifier == null) Matrix.config.device.identifier = Matrix.config.devices;

  //Make sure the user has logged in
  Matrix.helpers.trackEvent('app-restart', { aid: app, did: Matrix.config.device.identifier });

  Matrix.api.device.setId(Matrix.config.device.identifier);
    

  Matrix.firebase.app.getIDForName(app, function(err, appId) {
    if (err) {
      Matrix.loader.stop();
      console.error(err.message);
      return Matrix.endIt(1, 0);
    }

    debug('appId>', appId);
    // Get the current status of app
    Matrix.firebase.app.getStatus(appId, function(status) {
      debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);

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
        console.log('\n> matrix restart ¬\n');
        console.log('\t    matrix restart <app> -', t('matrix.restart.help', { app: '<app>' }).grey)
        Matrix.endIt();
        //If the status of the app is different of active doesn't execute de restart command
      } else if (status !== 'active') {

        console.log(t('matrix.restart.restart_app_status_error') + ':', app);
        Matrix.endIt();

      } else {
        
        var commandTimeout;

        Matrix.loader.stop();
        console.log(t('matrix.restart.restarting_app') + ': ', app, Matrix.config.device.identifier);
        Matrix.loader.start();
        // Keep track of previous app status
        var wasInactive;

        // Watch the app status and verify if the behavior it's right
        Matrix.firebase.app.watchStatus(appId, function(status) {
          
          // Restart command status behavior(active -> inactive -> active)
          if (status === 'active' && wasInactive == true) {
            
            clearTimeout(commandTimeout);
            Matrix.loader.stop();
            console.log(t('matrix.restart.restart_app_successfully') + ':', app);
            wasInactive = false;
            Matrix.endIt();

          } else if (status === 'inactive') {

            Matrix.loader.stop();
            console.log(t('matrix.stop.stop_app_successfully') + ':', app);
            wasInactive = true;
            Matrix.loader.start();
          }   

        });

        //Send the restart command
        Matrix.api.app.restart(app, function(err, res) {

          if (err) {
            Matrix.loader.stop();
            console.log(t('matrix.restart.restart_app_error') + ':', app, ' (' + err.message.red + ')');
            Matrix.endIt();
          }

          //add timeout to restart command
          commandTimeout = setTimeout(function() {
            console.log(t('matrix.restart.restart_timeout'));
            Matrix.endIt();
          }, commandTimeoutSeconds * 1000);

        });
      } 
    });
  });
});

