#!/usr/bin/env node

var async = require('async')
var debug, appName, version;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('install');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);

    appName = Matrix.pkgs[0];
    version = Matrix.pkgs[1];

    if (!Matrix.pkgs.length || showTheHelp) return displayHelp();
  },
  Matrix.validate.userAsync,
  // user register does fb init for login, bad if we do that 2x
  function (cb) { Matrix.firebaseInit(cb); },
  function (cb) {
    // group flow
    if (!_.isUndefined(Matrix.config.group)) {
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

function install(deviceId, options, cb) {
  var deviceName = Matrix.helpers.lookupDeviceName(deviceId);

  Matrix.helpers.trackEvent('app-install', { aid: appName, did: deviceId });
  
  // TODO lookup policy from config file, pass to function
  console.log('____ | ' + t('matrix.install.installing') + ' ', appName, ' ==> '.yellow, deviceId)

  Matrix.helpers.installApp(deviceId, options, function(err) {
    if (err) return cb(err);
    
    return cb(null);
  });
}

function searchApp(cb) {
  Matrix.loader.start();
  
  //Search the app to install
  Matrix.firebase.app.search(appName, function(result) {
    Matrix.loader.stop();
    //Validate if found the app
    if (_.isUndefined(result)) {
      debug(result) 
      return cb(new Error(t('matrix.install.app_x_not_found', { app: appName.yellow })));
    }

    var versionId;
    //Validate if the version exist and get the version Id
    if (version) {
      versionId = _.findKey(result.versions, function(appVersion, versionId) {
        if (appVersion.version === version) return true;
      });
      //If the version doesn't exist show the error and end the process
      if (_.isUndefined(versionId)) {
        return cb(new Error(t('matrix.install.app_version_x_not_found', { version: version })));
      }
    } else {
      //If in the command doesn't set the version use a current version of app
      versionId = result.meta.currentVersion;
    }

    debug('VERSION: '.blue, versionId, 'APP: '.blue, appName);

    var options = {
      policy: result.versions[versionId].policy,
      name: appName,
      id: result.id,
      versionId: versionId
    }

    return cb(null, options);
  });
}

function displayHelp() {
  console.log('\n> matrix install ¬\n');
  console.log('\t    matrix install app <app> -', t('matrix.install.help_app', { app: '<app>' }).grey)
  console.log('\t    matrix install sensor <sensor> -', t('matrix.install.help_sensor', { sensor: '<sensor>' }).grey)
  console.log('\n')
  return process.exit(1);
}