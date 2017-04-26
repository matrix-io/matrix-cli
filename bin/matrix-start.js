#!/usr/bin/env node
require('./matrix-init');

var debug = debugLog('sdk');
var commandTimeoutSeconds = 30;
Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var app = Matrix.pkgs[0];

  Matrix.validate.user();
  Matrix.validate.device();

  Matrix.helpers.trackEvent('app-start', { aid: app, did: Matrix.config.device.identifier });

  Matrix.api.device.setId(Matrix.config.device.identifier);
  console.log(t('matrix.start.starting_app') + ': ', app, Matrix.config.device.identifier);

  Matrix.firebaseInit(function() {
    //Get the app id for name
    Matrix.firebase.app.getIDForName(app, function(err, appId) {
      if (err) return console.error(err);
      debug('appId>', appId);
      //Get the current status of app
      Matrix.firebase.app.getStatus(appId, function(status) {
        debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);

        if (_.isUndefined(app)) {
          console.log('\n> matrix start ¬\n');
          console.log('\t    matrix start <app> -', t('matrix.start.help', { app: '<app>' }).grey)
          endIt();
          //If the status of the app is different of active or error doesn't execute de start command
        } else if (status === 'active' || status === 'pending') {
          console.log(t('matrix.start.start_app_status_error') + ':', app, status.green);
          endIt();
        } else {
          var commandTimeout;
          //
          // if (options.all) {
          //   //FIXME: hacky
          //   app = 'all-applications'
          // }

          Matrix.loader.start();

          //Watch the app status and verify if the behavior it's right
          Matrix.firebase.app.watchStatus(appId, function(status) {
            //stop command status behavior(inactive or error -> active)
            if (status === 'active') {
              clearTimeout(commandTimeout);
              Matrix.loader.stop();
              console.log(t('matrix.start.start_app_successfully') + ': ', app);
              endIt();
            } else if (status === 'error') {
              clearTimeout(commandTimeout);
              Matrix.loader.stop();
              console.error('The application failed to start, please update it and try again. \nIf it keeps failing you may want to contact the developer.'.yellow);
              endIt();
            }

          });
          //Send the start command
          Matrix.api.app.start(app, Matrix.config.device.identifier, function(err, res) {
            if (err) {
              Matrix.loader.stop();
              console.log(t('matrix.start.start_app_error') + ':', app, ' (' + err.message.red + ')');
              endIt();
            }

            //add timeout to start command
            commandTimeout = setTimeout(function() {
              console.log(t('matrix.start.start_timeout'));
              endIt();

            }, commandTimeoutSeconds * 1000);

          });
        }//else
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
