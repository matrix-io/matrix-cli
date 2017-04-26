#!/usr/bin/env node
require('./matrix-init');

var debug = debugLog('stop');
var commandTimeoutSeconds = 30;

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var app = Matrix.pkgs[0];

  Matrix.validate.user();
  Matrix.validate.device();
  Matrix.helpers.trackEvent('app-stop', { aid: app, did: Matrix.config.device.identifier });

  if (_.isUndefined(app) || !_.isString(app)) {
    console.log('\n> matrix stop <app> - ' + t('matrix.help_stop').grey + '\n');
    process.exit(1);
  }

  Matrix.firebaseInit(function() {
    //Get the app id for name
    Matrix.firebase.app.getIDForName(app, function(err, appId) {
      if (err) {
        console.error(err.message);
        return process.exit(1);
      }
      debug('appId>', appId);
      //Get the current status of app
      Matrix.firebase.app.getStatus(appId, function(status) {
        debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
        if (_.isUndefined(app)) {
          console.log('\n> matrix stop ¬\n');
          console.log('\t    matrix stop <app> -', t('matrix.stop.help', { app: '<app>' }).grey)
          endIt();

          //If the status of the app is different of active doesn't execute de stop command
        } else if (status !== 'active') {
          console.log(t('matrix.stop.stop_app_status_error') + ':', app);
          endIt();
        } else {
          console.log(t('matrix.stop.stopping_app') + ': ', app);
          var commandTimeout;
          // if (options.all) {
          //   //FIXME: hacky, passes this to server
          //   app = 'all-applications'
          // }
          Matrix.loader.start();

          //Watch the app status and verify if the behavior it's right
          Matrix.firebase.app.watchStatus(appId, function(status) {
            //stop command status behavior(active -> inactive)
            Matrix.loader.stop();
            if (status === 'inactive') {
              clearTimeout(commandTimeout);
              console.log(t('matrix.stop.stop_app_successfully') + ':', app);
              endIt();
            }
          });
          //Send the stop command
          Matrix.api.app.stop(app, Matrix.config.device.identifier, function(err) {
            Matrix.loader.stop();
            if (err) {
              console.log(t('matrix.stop.stop_app_error') + ':', app, ' (' + err.message.red + ')');
              endIt();
            }
            Matrix.loader.start();

          });
        }
      });
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
