#!/usr/bin/env node

var debug;

var async = require('async');

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('uninstall');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  Matrix.validate.deviceAsync,
  function(cb) {
    Matrix.firebaseInit(cb)
  }
], function (err) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  if (!Matrix.pkgs.length || showTheHelp) return displayHelp();
  var target = Matrix.pkgs[0];

  console.log('____ | ' + t('matrix.uninstall.uninstalling') + ' ', target.green, ' ==> '.yellow, Matrix.config.device.identifier);
  Matrix.loader.start();

  //If the device has the app
  Matrix.helpers.lookupAppId(target, function(err, appId) {
    Matrix.loader.stop();
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
      Matrix.loader.start();

      Matrix.helpers.trackEvent('app-uninstall', { aid: target, did: Matrix.config.device.identifier });

      Matrix.firebase.app.uninstall(Matrix.config.user.token, Matrix.config.device.identifier, appId, {
        error: function(err) {
          Matrix.loader.stop();
          if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
            console.error('\nUninstall Error'.red, err.details.error);
          } else {
            console.error('\nUninstall Error'.red, err);
          }
          process.exit(1);
        },
        finished: function() {
          Matrix.loader.stop();
          console.log('Uninstall sent to device...'.green);
          process.exit(0);
        },
        start: _.once(function() {
          Matrix.loader.stop();
          console.log('Uninstall request created');
          Matrix.loader.start();
        }),
        progress: function(msg) {
          if (_.isUndefined(msg)) msg = '';
          else msg = ' ' + msg + ' ';
          if (!progress) {
            progress = true;
            Matrix.loader.stop();
            process.stdout.write('Uninstall Progress:' + msg)
          } else {
            process.stdout.write('.' + msg);
          }
        }
      });
    }


  });

  function displayHelp() {
    console.log('\n> matrix uninstall ¬\n');
    console.log('\t    matrix uninstall <app> -', t('matrix.uninstall.help_app', { app: '<app>' }).grey)
    console.log('\n')
    process.exit(1);
  }
});