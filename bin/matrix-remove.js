#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('install');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  Matrix.loader.start();
  if (showTheHelp) {
    return displayHelp();
  }
  
  var deviceId, progress;
  if (Matrix.pkgs.length < 1) {
    Matrix.validate.device();
    deviceId = Matrix.config.device.identifier;
  } else if (Matrix.pkgs.length === 1) {
    deviceId = Matrix.pkgs[0];
  } else {
    return displayHelp();
  }
  
  Matrix.validate.user();

  Matrix.firebaseInit(function () {
    Matrix.firebase.device.lookup(deviceId, function (error, device) { //Check if device exists
      if (error) { //If it doesn't
        Matrix.loader.stop();
        console.log('Device ' + deviceId.yellow + ' doesn\'t exist');
        return process.exit(2);
      } else { //If it exists
        //Create a timeout in case workers don't respond'
        var deleteTimeoutSeconds = 20; 
        var deleteTimeout = setTimeout(function () {
          //If deleteTimeoutSeconds is passed, fail
          Matrix.loader.stop();
          console.log('Unable to delete device right now, please try again later');
          process.exit(3)
        }, deleteTimeoutSeconds * 1000);

        //Send removal task to Firebase queue
        Matrix.firebase.device.delete(deviceId, {
          error: function (err) { //If anything fails
            Matrix.loader.stop();
            clearTimeout(deleteTimeout); //Remove timeout
            //Report error
            if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
              console.error('\n' + t('matrix.remove.error').red + ': ', err.details.error);
            } else {
              console.error('\n' + t('matrix.remove.error').red + ': ', err);
            }
            process.exit(1);
          },
          finished: function () {
            clearTimeout(deleteTimeout); //Remove timeout
            Matrix.loader.stop();
            console.log('\n' + t('matrix.remove.finish').green + '...'.green);
            process.exit(0);
          },
          start: function () {
            _.once(function () {
              Matrix.loader.stop();
              console.log(t('matrix.remove.start') + '...')
              Matrix.loader.start();
            })
          },
          progress: function (msg) {
            if (_.isUndefined(msg)) msg = ''; else msg = ' ' + msg + ' ';
            if (!progress) {
              progress = true;
              Matrix.loader.stop();
              process.stdout.write(t('matrix.remove.progress') + ':' + msg); //Report progress
            } else {
              process.stdout.write('.' + msg);
            }
          }
        });
      }
    });
  });

  //Confirm removal

  //Create worker request


  function displayHelp() {
    Matrix.loader.stop();
    console.log('\n> matrix remove ¬\n');;
    console.log('\t    matrix remove -', t('matrix.remove.help_selected', { app: '<app>' }).grey);
    console.log('\t    matrix remove <id> -', t('matrix.remove.help_deviceId', { id: '<id>' }).grey);
    console.log('\n');
    process.exit(1);
  }
});
