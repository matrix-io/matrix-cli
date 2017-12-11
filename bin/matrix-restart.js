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

   //did for get appId just one time 
  var deviceIdentifier = Matrix.config.device.identifier;
  if(Matrix.config.device.identifier == null) {
    Matrix.config.device.identifier = Matrix.config.devices;
    deviceIdentifier = Matrix.config.device.identifier[0];
    async.map(Matrix.config.device.identifier, function(data){
      Matrix.helpers.trackEvent('app-restart', {aid: app, did: data.identifier});
    });
  } else {
    //Make sure the user has logged in
    Matrix.helpers.trackEvent('app-restart', { aid: app, did: Matrix.config.device.identifier });
  }

  Matrix.api.device.setId(Matrix.config.device.identifier);
    

  Matrix.firebase.app.getIDForName(deviceIdentifier.identifier, app, function(err, appId) {
    if (err) {
      Matrix.loader.stop();
      console.error(err.message);
      return Matrix.endIt(1, 0);
    }

    debug('appId>', appId);
    // Get the current status of app
    async.map(Matrix.config.device.identifier, function(did){
      Matrix.firebase.app.getStatus(did.identifier, appId, function(status) {
        debug("Get current status: " + Matrix.config.user.id + '>' + did.identifier + '>' + appId + '>' + status);

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
          console.log(t('matrix.restart.restarting_app') + ': ', app, did.identifier);
          Matrix.loader.start();
          // Keep track of previous app status
          var wasInactive;

          // Watch the app status and verify if the behavior it's right
          Matrix.firebase.app.watchStatus(did.identifier, appId, function(status) {
            
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
});

