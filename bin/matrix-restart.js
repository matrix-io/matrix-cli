#!/usr/bin/env node

var commandTimeoutSeconds = 30;

var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function(cb) {
    debug = debugLog('restart');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  Matrix.validate.deviceAsync,
  function(cb) {
    Matrix.firebaseInit(cb)
  }
], function(err) {
  var app = Matrix.pkgs[0];

  if (_.isUndefined(app) || !_.isString(app)) {
    console.log('\n> matrix restart <app> - ' + t('matrix.help_restart').grey + '\n');
    process.exit(1);
  }

  Matrix.helpers.trackEvent('app-restart', { aid: app, did: Matrix.config.device.identifier });


  //Get the app id for name
  Matrix.firebase.app.getIDForName(app, function(err, appId) {
    if (err) {
      console.error(err);
      return process.exit(1);
    }
    debug('appId>', appId);
    //Get the current status of app
    Matrix.firebase.app.getStatus(appId, function(status) {
      debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
      if (_.isUndefined(app)) {
        console.log('\n> matrix restart ¬\n');
        console.log('\t    matrix restart <app> -', t('matrix.restart.help', { app: '<app>' }).grey)
        endIt();
        //If the status of the app is different of active doesn't execute de restart command
      } else if (status !== 'active') {
        console.log(t('matrix.restart.restart_app_status_error') + ':', app);
        endIt();
      } else {
        console.log(t('matrix.restart.restarting_app') + ': ', app);
        var commandTimeout;
        Matrix.loader.start();

        //Watch the app status and verify if the behavior it's right
        Matrix.firebase.app.watchStatus(appId, function(status) {
          //restart command status behavior(active -> inactive -> active)
          Matrix.loader.stop();
          if (status === 'active') {
            clearTimeout(commandTimeout);
            console.log(t('matrix.restart.restart_app_successfully') + ':', app);
            endIt();
          } else if (status === 'inactive') {
            console.log(t('matrix.stop.stop_app_successfully') + ':', app);
          }
        });

        //Send the restart command
        Matrix.api.app.restart(app, function(err, res) {
          Matrix.loader.stop();
          if (err) {
            console.log(t('matrix.restart.restart_app_error') + ':', app, ' (' + err.message.red + ')');
            endIt();
          }

          //add timeout to restart command
          commandTimeout = setTimeout(function() {
            console.log(t('matrix.restart.restart_timeout'));
            endIt();
          }, commandTimeoutSeconds * 1000);

        });
      }
    });
  });

});

function endIt() {
  setTimeout(function() {
    process.nextTick(function() {
      process.exit(0);
    })
  }, 1000)
}