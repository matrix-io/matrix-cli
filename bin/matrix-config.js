#!/usr/bin/env node

var async = require('async');
var debug;

var options, target, key, value;

//TODO matrix config won't exit
async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('config');

    options = {};
    target = Matrix.pkgs[0]; // app name
    key = Matrix.pkgs[1]; //target
    value = Matrix.pkgs[2]; // in case they don't use =

    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  function(cb) { Matrix.firebaseInit(cb); },
  // normalize and check parameters
  function(cb) {
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
      return process.exit();
    }

    return cb(null);
  },
  function(cb) {
    // group flow
    if (!_.isUndefined(Matrix.config.group)) {
      async.series([
        Matrix.validate.groupAsync,
        function(done) {
          async.each(Matrix.config.group.devices, (device, callback) => {
            doConfig(device.identifier, callback);
          }, (err) => {
            if (err) return done(err);
            else return done(null);
          });
        }
      ], function(err) {
        if (err) return cb(err);
        else return cb(null);
      });
    }
    // single device flow
    else {
      async.series([
        Matrix.validate.deviceAsync,
        function(done) { doConfig(Matrix.config.device.identifier, done); }
      ], function(err) {
        if (err) return cb(err);
        else return cb(null);
      });
    }
  },
  // user register does fb init for login, bad if we do that 2x
], function(err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }
  return process.exit();
});

function doConfig(deviceId, cb) {
  
  if (_.isUndefined(target)) {
    // get form

    Matrix.firebase.device.getConfig(deviceId, (err, data) => {
      return handleResponse(err, deviceId, data, cb);
    });

    // matrix config base
  } else if (_.isUndefined(key)) {

    Matrix.firebase.app.getIDForName(deviceId, target, function(err, appId) {
      if (err) return cb(err);
      debug('appId>', appId);
      Matrix.firebase.app.getConfig(deviceId, appId, (err, data) => {
        return handleResponse(err, deviceId, data, cb);
      });
    })

  } else if (_.isUndefined(value)) {
    // get deep
    //
    key = '/' + key.replace(/\./g, '/');
    debug('Firebase: '.blue, target)
    Matrix.firebase.app.getIDForName(deviceId, target, function(err, appId) {
      if (err) return cb(err);
      debug('appId>', appId);
      Matrix.firebase.app.getConfigKey(deviceId, appId, key, (err, data) => {
        return handleResponse(err, deviceId, data, cb);
      });
    })

    // matrix config base keywords=test,keyword
  } else {

    debug('>>>', target, value);

    Matrix.firebase.app.getIDForName(deviceId, target, function(err, appId) {
      if (err) return cb(err);
      debug('appId>', appId);
      console.log('\n'+'Device:', Matrix.helpers.lookupDeviceName(deviceId), '\nApplication:', target, '\nconfig value:', key, '\nupdate:', value)
      Matrix.firebase.app.setConfigKey(deviceId, appId, key, value, function() {
        Matrix.helpers.trackEvent('app-config-change', { aid: target, did: deviceId });
        return cb(null);
      });
    });
  }
}

function handleResponse(err, deviceId, app, cb) {
  console.log('\n'+t('matrix.config.device_config') + ' ', Matrix.helpers.lookupDeviceName(deviceId),'('+deviceId+')');
  if (err) return console.error(t('matrix.helpers.config_error'), err);
  if (_.isNull(app)) { console.error(t('matrix.helpers.config_error'), app) }
  console.log(require('util').inspect(app, { depth: 3, colors: true }));
  cb(null);
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