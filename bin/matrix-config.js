#!/usr/bin/env node

var async = require('async');
var debug;

//TODO matrix config won't exit
async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('config');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  Matrix.validate.deviceAsync,
  // user register does fb init for login, bad if we do that 2x
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

  var options = {};
  var target = Matrix.pkgs[0]; // app name
  var key = Matrix.pkgs[1]; //target
  var value = Matrix.pkgs[2]; // in case they don't use =

  // split on = if exists
  if (!_.isUndefined(key) && key.indexOf('=') > -1) {
    value = key.split('=')[1];
    key = key.split('=')[0];
  }

  // normalize a.b.c for firebase a/b/c
  if (!_.isUndefined(key)) {
    key = key.replace(/\./g, '/');
  }

  //split up commas
  if (!_.isUndefined(value) && value.indexOf(',') > -1) {
    // is an array
    value = value.split(',');
  }

  //support multiword
  if (!_.isUndefined(value) && Matrix.pkgs.length > 3) {
    value += ' ' + _.tail(_.tail(Matrix.pkgs)).join(' ');
  }

  Matrix.loader.stop();
  console.log('App Path:'.blue, _.compact([target, key, value]).join('/').grey)

  if (Matrix.pkgs.indexOf('--watch') > -1 || Matrix.pkgs.indexOf('-w') > -1) {
    options.watch = true;
  }

  if (Matrix.pkgs.indexOf('--help') > -1 || Matrix.pkgs.indexOf('-h') > -1) {
    showHelp();
  } else if (_.isUndefined(target)) {
    // get form

    console.log(t('matrix.config.device_config') + ' ', Matrix.config.device.identifier);
    Matrix.firebase.device.getConfig(handleResponse);

    // matrix config base
  } else if (_.isUndefined(key)) {

    Matrix.firebase.app.getIDForName(target, function(err, appId) {
      if (err) return console.error(err);
      debug('appId>', appId);
      Matrix.firebase.app.getConfig(appId, handleResponse);
    })

  } else if (_.isUndefined(value)) {
    // get deep
    //
    key = '/' + key.replace(/\./g, '/');
    debug('Firebase: '.blue, target)
    Matrix.firebase.app.getIDForName(target, function(err, appId) {
      if (err) return console.error(err);
      debug('appId>', appId);
      Matrix.firebase.app.getConfigKey(appId, key, handleResponse);
    })

    // matrix config base keywords=test,keyword
  } else {

    debug('>>>', target, value);

    Matrix.firebase.app.getIDForName(target, function(err, appId) {
      if (err) return console.error(err);
      debug('appId>', appId);
      console.log('Application', target, '\nconfig value:', key, '\nupdate:', value)
      Matrix.firebase.app.setConfigKey(appId, key, value, function() {
        Matrix.helpers.trackEvent('app-config-change', { aid: target, did: Matrix.config.device.identifier }, process.exit);
      });
    })

  }


  function handleResponse(err, app) {
    if (err) return console.error(t('matrix.helpers.config_error'), err);
    if (_.isNull(app)) { console.error(t('matrix.helpers.config_error'), app) }
    console.log(require('util').inspect(app, { depth: 3, colors: true }));
    process.exit();
  }


  function showHelp() {

    console.log('\n> matrix config ¬\n');
    console.log('\t         matrix config -', t('matrix.config.help').grey)
    console.log('\tmatrix config <appName> -', t('matrix.config.help_app').grey)
    console.log('\tmatrix config <appName> <key> -', t('matrix.config.help_app_key').grey)
    console.log('\tmatrix config <appName> <key> <value> -', t('matrix.config.help_app_key_value').grey)
    console.log('\n')
    process.exit(1);
  }
});