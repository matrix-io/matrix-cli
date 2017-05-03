#!/usr/bin/env node

var debug;
var async = require('async');

async.series([
  require('./matrix-init'),
  function(cb) {
    Matrix.loader.start();
    debug = debugLog('remove');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  function(cb) {
    Matrix.firebaseInit(cb)
  }
], function(err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  if (showTheHelp) return displayHelp();

  var progress, target;
  if (Matrix.pkgs.length < 1) { // No id specified
    Matrix.validate.device(); // Require a selected device
    target = Matrix.config.device.identifier;
  } else if (Matrix.pkgs.length > 1) { //Id specified
    target = Matrix.pkgs.join(' ');
  } else if (Matrix.pkgs.length === 1) { //Id specified
    target = Matrix.pkgs[0];
  } else {
    return displayHelp();
  }

  var targetValue = _.findKey(Matrix.config.deviceMap, { name: target });

  if (_.isEmpty(targetValue)) { // not a name, must be a key?
    if (_.has(Matrix.config.deviceMap, target)) {
      targetValue = target;
    } else { //Doesn't exist
      Matrix.loader.stop();
      console.log('Device ' + target.yellow + ' doesn\'t exist');
      return process.exit(2);
    }
  }

  Matrix.firebase.device.lookup(targetValue, function(error, device) { //Check if device exists in firebase
    if (error) { //Device doesn't exist in Firebase
      delete Matrix.config.deviceMap[targetValue]; //Remove from local cache
      Matrix.helpers.saveConfig(function() {
        Matrix.loader.stop();
        console.log('Device ' + targetValue.yellow + ' was already removed');
        return process.exit(3);
      });
    } else { // Device exists

      Matrix.loader.stop();
      var deleteDevice = false;
      var Rx = require('rx');
      var prompts = new Rx.Subject(); // need to inject results of answers into questions for decision trees
      require('inquirer').prompt(prompts).ui.process.subscribe(function(ans) {

        //Confirm
        if (ans.name === 'confirm') {
          if (ans.answer === true) deleteDevice = true;
          prompts.onCompleted();
        }

      }, function(e) { console.error(e) }, function() {

        if (!deleteDevice) {
          process.exit(0);
        } else { //Proceed to delete
          //Create a timeout in case workers don't respond'
          var deleteTimeoutSeconds = 20;
          var deleteTimeout = setTimeout(function() { //If deleteTimeoutSeconds is passed, fail
            Matrix.loader.stop();
            console.log('Unable to delete device right now, please try again later');
            process.exit(3)
          }, deleteTimeoutSeconds * 1000);

          Matrix.helpers.trackEvent('device-remove', { did: targetValue });

          Matrix.firebase.device.delete(targetValue, { //Send removal task to Firebase queue
            error: function(err) {
              Matrix.loader.stop();
              clearTimeout(deleteTimeout); //Remove timeout
              if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) { //Report error
                console.error('\n' + t('matrix.remove.error').red + ': ', err.details.error);
              } else {
                console.error('\n' + t('matrix.remove.error').red + ': ', err);
              }
              process.exit(1); //Stop exectuion
            },
            finished: function() {
              clearTimeout(deleteTimeout); //Remove timeout
              Matrix.loader.stop();
              delete Matrix.config.deviceMap[targetValue]; //Remove from local cache
              Matrix.helpers.saveConfig(function() {
                Matrix.loader.stop();
                console.log('\n' + t('matrix.remove.finish').green + '...'.green);
                process.exit(0); //Stop exectuion
              });
            },
            start: function() {
              _.once(function() {
                Matrix.loader.stop();
                console.log(t('matrix.remove.start') + '...')
                Matrix.loader.start();
              })
            },
            progress: function(msg) {
              if (_.isUndefined(msg)) msg = '';
              else msg = ' ' + msg + ' ';
              if (!progress) {
                progress = true;
                Matrix.loader.stop();
                process.stdout.write(t('matrix.remove.progress') + msg); //Report progress
              } else {
                process.stdout.write('.' + msg);
              }
            }
          });
        }
      });

      prompts.onNext({
        type: 'confirm',
        name: 'confirm',
        message: 'This removes the device ' + targetValue.yellow + ' (' + device.meta.name.yellow + ') and all the data associated with it, are you sure?'.white,
        default: false //Default to NO
      });

    }
  });

  function displayHelp() {
    Matrix.loader.stop();
    console.log('\n> matrix remove ¬\n');;
    console.log('\t    matrix remove -', t('matrix.remove.help_selected').grey);
    console.log('\t    matrix remove <id> -', t('matrix.remove.help_id', { id: '<id>' }).grey);
    console.log('\n');
    process.exit(1);
  }
});