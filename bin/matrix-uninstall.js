#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('uninstall');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  console.log(1);
  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }
  console.log(2);
  var target = Matrix.pkgs[0];
  console.log(3);
  Matrix.validate.user(); //Make sure the user has logged in
  Matrix.validate.device(); //Make sure the user has logged in
  console.log(4);
  console.log('____ | ' + t('matrix.uninstall.uninstalling') + ' ', target, ' ==> '.yellow, Matrix.config.device.identifier);
  Matrix.firebaseInit(function () {
    var options = {
      name: target,
      deviceId: Matrix.config.device.identifier
    };
    console.log(5);
    Matrix.firebase.app.inDevice(options, function(appList){
      debug('RESULTS OF LISTING: ', appList);
      process.exit(1);
    });

    /*Matrix.firebase.user.watchForNewApps(Matrix.config.device.identifier, function (app) {
      debug('new app>', app)
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

    /*
    console.log("\nUninstalling to device... ")
    Matrix.firebase.app.uninstall(Matrix.config.user.token, Matrix.config.device.identifier, appId, {
      error: function (err) {
        console.error('Uninstall Error'.red, err);
        process.exit(1);
      },
      finished: function () {
        console.log('Uninstall request formed...'.green);
        process.exit(0);
      },
      start: _.once(function () {
        console.log('Uninstall request created');
      }),
      progress: function (msg) {
        console.log('Uninstall in progress:', msg);
      }
    });
    */
  });

  function displayHelp() {
    console.log('\n> matrix uninstall ¬\n');
    console.log('\t    matrix uninstall <app> -', t('matrix.uninstall.help_app', { app: '<app>' }).grey)
    console.log('\n')
    process.exit(1);
  }
});