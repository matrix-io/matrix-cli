#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('uninstall');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var target = Matrix.pkgs[0];
  Matrix.validate.user(); //Make sure the user has logged in
  Matrix.validate.device(); //Make sure the user has logged in

  console.log('____ | ' + t('matrix.uninstall.uninstalling') + ' ', target, ' ==> '.yellow, Matrix.config.device.identifier);
  Matrix.firebaseInit(function () {
    var options = {
      name: target,
      deviceId: Matrix.config.device.identifier
    };

    //If the device has the app    
    Matrix.helpers.lookupAppId(target, function (err, appId) { 
      if (err) {
        console.log('err: ', err);
        process.exit();
      }
      if (!appId) { 
        console.log("\nApp not installed in device... ")
        process.exit(1);
      } else {

        /*Matrix.firebase.user.watchForAppRemoval(Matrix.config.device.identifier, function (app) {
          debug('removed app>', app)
          var installedAppId = _.keys(app)[0];
          Matrix.firebase.app.watchStatus(installedAppId, function (status) {
            console.log('status>', installedAppId, status)
            if (status === 'error') {
              console.error('Error installing', app);
              process.exit();
            } else if (
              status === 'inactive'
            ) {
              console.log('App install SUCCESS'.green)
              process.exit();
            } else {
              console.log('invalid status', status);
            }
          })
        });*/

        console.log("\nApp found in device... ")
        var progress;
        Matrix.firebase.app.uninstall(Matrix.config.user.token, Matrix.config.device.identifier, appId, {
          error: function (err) {
            if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
              console.error('\nUninstall Error'.red, err.details.error);
            } else {
              console.error('\nUninstall Error'.red, err);
            }
            process.exit(1);
          },
          finished: function () {
            console.log('Uninstall sent to device...'.green);
            process.exit(0);
          },
          start: _.once(function () {
            console.log('Uninstall request created');
          }),
          progress: function (msg) {
            if (!progress) {
              progress = true;
              process.stdout.write('Uninstall Progress:' + msg) 
            } else {                      
              process.stdout.write('.');
            }
          }
        });
      }

    });
    
  });

  function displayHelp() {
    console.log('\n> matrix uninstall ¬\n');
    console.log('\t    matrix uninstall <app> -', t('matrix.uninstall.help_app', { app: '<app>' }).grey)
    console.log('\n')
    process.exit(1);
  }
});