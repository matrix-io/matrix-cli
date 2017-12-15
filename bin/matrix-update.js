#!/usr/bin/env node

var async = require('async');
var debug;

var appName;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('update');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);

    if (!Matrix.pkgs.length || showTheHelp) return displayHelp();

    appName = Matrix.pkgs[0];
  },
  Matrix.validate.userAsync,
  function(cb) { Matrix.firebaseInit(cb); },
  function(cb) {
    // group flow
    if(!_.isUndefined(Matrix.config.group)) {
      async.waterfall([
        Matrix.validate.groupAsync,
        searchApp,
        (installOptions, done) => {
          async.each(Matrix.config.group.devices, (device, callback) => {
            install(device.identifier, installOptions, callback);
          }, (err) => {
            if (err) return done(err);
            else return done(null);
          });
        }
      ], (err) => {
        if (err) return cb(err);
        else return cb(null);
      });
    }
    // single device flow
    else {
      async.waterfall([
        Matrix.validate.deviceAsync,
        searchApp,
        (installOptions, done) => {
          install(Matrix.config.device.identifier, installOptions, done);
        }
      ], (err) => {
        if (err) return cb(err);
        else return cb(null);
      });
    }
  },
], function (err) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  return process.exit();
});

function searchApp(cb) {
  Matrix.firebase.app.search(appName, function(result) {
    var appId = result.id;

    debug(result)
    
    if (_.isUndefined(result)) {
      console.log(t('matrix.update.app_undefined', { app: appName.yellow }));
      return process.exit(1);
    } 

    var versionId = result.meta.currentVersion;

    debug('VERSION: '.blue, versionId, 'APP: '.blue, appId);
    
    var options = {
      policy: result.versions[versionId].policy,
      name: appName,
      id: appId,
      versionId: versionId
    }

    return cb(null, options);
  }); 
}

function install(deviceId, options, cb) {
  const deviceName = Matrix.helpers.lookupDeviceName(deviceId);

  console.log('____ | ' + t('matrix.update.upgrading_to') + ':' + t('matrix.update.latest_version') + ' ', appName, ' ==> '.yellow, deviceId);

  Matrix.helpers.installApp(deviceId, options, function(err) {
    if (err) return cb(err);

    console.log(deviceName.green+': '+t('matrix.update.app_update_successfully').green);
    return cb(null);
  }); 
}

function displayHelp() {
  console.log('\n> matrix update ¬ \n');
  console.log('\t                 matrix update -', t('matrix.update.help_update').grey)
  console.log('\t           matrix update <app> -', t('matrix.update.help_update_app').grey)
  console.log('\t matrix update <app> <version> -', t('matrix.update.help_update_app_version').grey)
  console.log('\n')
  return process.exit(1);
}