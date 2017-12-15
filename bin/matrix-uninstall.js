#!/usr/bin/env node

var debug;

var async = require('async');

var target;
var progressTimeoutSeconds = 30;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('uninstall');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);

    if (!Matrix.pkgs.length || showTheHelp) return displayHelp();
    
    target = Matrix.pkgs[0];
  },
  Matrix.validate.userAsync,
  function(cb) { Matrix.firebaseInit(cb); },
  function(cb) {
    // group flow
    if (!_.isUndefined(Matrix.config.group)) {
      async.waterfall([
        Matrix.validate.groupAsync,
        (done) => {
          async.each(Matrix.config.group.devices, (device, callback) => {
            const did = device.identifier;
            // try to get appId for each device to know which ones have it
            getAppId(did, (err, appId) => {
              if (err) {
                console.log(err.message);
                return callback(null);
              }
              uninstall(did, appId, callback);
            });
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
        (done) => {
          const did = Matrix.config.device.identifier;
          getAppId(did, (err, appId) => {
            if (err) return cb(err);
            uninstall(did, appId, done);
          });
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

function getAppId(deviceId, cb) {
  const deviceName = Matrix.helpers.lookupDeviceName(deviceId);

  //If the device has the app
  Matrix.helpers.lookupAppId(deviceId, target, function(err, appId) {
    Matrix.loader.stop();
    if (err) return cb(new Error(deviceName.green+': '+err.message));
    if (!appId) {
      return cb(new Error("\n"+deviceName.green+': '+"App not installed in device"));
    }
    return cb(null, appId);
  });  
}

function uninstall(deviceId, appId, cb) {
  const deviceName = Matrix.helpers.lookupDeviceName(deviceId);
  let progressTimeout, didTimeout;
  didTimeout = false;

  console.log("\n"+deviceName.green+': '+"App found in device... ")
  var progress;

  Matrix.helpers.trackEvent('app-uninstall', { aid: target, did: deviceId });

  console.log('\n'+'____ | ' + t('matrix.uninstall.uninstalling') + ' ', target.green, ' ==> '.yellow, deviceId);

  Matrix.firebase.app.uninstall(Matrix.config.user.token, deviceId, appId, {
    error: function(err) {
      Matrix.loader.stop();
      if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
        console.error('\n'+deviceName.green+': '+'Uninstall Error'.red, err.details.error);
      } else {
        console.error('\n'+deviceName.green+': '+'Uninstall Error'.red, err);
      }
      return cb(null);
    },
    finished: function() {
      clearTimeout(progressTimeout);
      console.log('\n'+deviceName.green+': '+'Uninstall sent to device...'.green);
      if (!didTimeout)
        return cb(null);
    },
    start: _.once(function() {
      console.log('\n'+deviceName.green+': '+'Uninstall request created');
    }),
    progress: function(msg) {
      if (_.isUndefined(msg)) msg = '';
      else msg = ' ' + msg + ' ';
      if (!progress) {
        progress = true;
        Matrix.loader.stop();
        console.log('\n'+deviceName.green+': '+'Uninstall in Progress ');
        progressTimeout = setTimeout(() => {
          console.log('\n'+deviceName.green+': '+'Uninstall timed out. Try again later.')
          didTimeout = true;
          return cb(null);
        }, progressTimeoutSeconds*1000);
      }
    }
  }); 
}

function displayHelp() {
  console.log('\n> matrix uninstall ¬\n');
  console.log('\t    matrix uninstall <app> -', t('matrix.uninstall.help_app', { app: '<app>' }).grey)
  console.log('\n')
  return process.exit(1);
}