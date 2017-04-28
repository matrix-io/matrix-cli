#!/usr/bin/env node

require('./matrix-init');
var debug;
var async = require('async')

var debug;

async.series([
  require('./matrix-init'),
  function(cb) {
    debug = debugLog('install');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  Matrix.validate.deviceAsync,
  // user register does fb init for login, bad if we do that 2x
  function(cb) {
    Matrix.firebaseInit(cb)
  }
], function(err) {
  if (err) return console.error(err);

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var cmd = Matrix.pkgs[0];


  var appName = Matrix.pkgs[0];
  var version = Matrix.pkgs[1];


  //Make sure the user has logged in
  // Matrix.validate.user();
  // Matrix.validate.device();

  // TODO lookup policy from config file, pass to function
  console.log('____ | ' + t('matrix.install.installing') + ' ', appName, ' ==> '.yellow, Matrix.config.device.identifier)

  Matrix.loader.start();
  //Search the app to install
  Matrix.firebase.app.search(appName, function(result) {
    //Validate if found the app
    if (_.isUndefined(result)) {
      debug(result) 
      Matrix.loader.stop();
      console.log(t('matrix.install.app_x_not_found', { app: appName.yellow }));
      return process.exit();
    }

    var versionId;
    //Validate if the version exist and get the version Id
    if (version) {
      versionId = _.findKey(result.versions, function(appVersion, versionId) {
        if (appVersion.version === version) {
          return true;
        }
      });
      //If the version doesn't exist show the error and end the process
      if (_.isUndefined(versionId)) {
        Matrix.loader.stop();
        console.log(t('matrix.install.app_version_x_not_found', { version: version }));
        return process.exit();
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

    Matrix.helpers.trackEvent('app-install', { aid: appName, did: Matrix.config.device.identifier });

    Matrix.helpers.installApp(options, function(err) {
      Matrix.loader.stop();
      if (err) {
        console.log(err);
        process.exit(1);
      }

      console.log(t('matrix.install.app_install_success').green);
      process.exit(0);
    });

  });


  function displayHelp() {
    console.log('\n> matrix install ¬\n');
    console.log('\t    matrix install app <app> -', t('matrix.install.help_app', { app: '<app>' }).grey)
    console.log('\t    matrix install sensor <sensor> -', t('matrix.install.help_sensor', { sensor: '<sensor>' }).grey)
    console.log('\n')
    process.exit(1);
  }
});