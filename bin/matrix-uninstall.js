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

  console.log('____ | ' + t('matrix.uninstall.uninstalling') + ' ', target.green, ' ==> '.yellow, Matrix.config.device.identifier);
  Matrix.startLoader();
  Matrix.firebaseInit(function () {
    var options = {
      name: target,
      deviceId: Matrix.config.device.identifier
    };

    //If the device has the app    
    Matrix.helpers.lookupAppId(target, function (err, appId) {
      Matrix.stopLoader();
      if (err) {
        console.log('Error: '.red, err.message);
        process.exit();
      }
      if (!appId) { 
        console.log("\nApp not installed in device... ")
        process.exit(1);
      } else {

        console.log("\nApp found in device... ")
        var progress;
        Matrix.startLoader();
        Matrix.firebase.app.uninstall(Matrix.config.user.token, Matrix.config.device.identifier, appId, {
          error: function (err) {
            Matrix.stopLoader();
            if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
              console.error('\nUninstall Error'.red, err.details.error);
            } else {
              console.error('\nUninstall Error'.red, err);
            }
            process.exit(1);
          },
          finished: function () {
            Matrix.stopLoader();
            console.log('Uninstall sent to device...'.green);
            process.exit(0);
          },
          start: _.once(function () {
            Matrix.stopLoader();
            console.log('Uninstall request created');
            Matrix.startLoader();
          }),
          progress: function (msg) {
            if (_.isUndefined(msg)) msg = ''; else msg = ' ' + msg + ' ';
            if (!progress) {
              progress = true;
              Matrix.stopLoader();
              process.stdout.write('Uninstall Progress:' + msg) 
            } else {                      
              process.stdout.write('.' + msg);
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