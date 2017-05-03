#!/usr/bin/env node

var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('use');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync
], function (err) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  if (!Matrix.pkgs.length || showTheHelp) return displayHelp();

  var target = Matrix.pkgs.join(' ');
  var targetDeviceId = _.findKey(Matrix.config.deviceMap, { name: target });
  var nameProvided = true;

  if (_.isEmpty(targetDeviceId)) {
    // not a name, must be a key?
    if (_.has(Matrix.config.deviceMap, target)) {
      targetDeviceId = target;
      nameProvided = false;
    } else {
      console.log(target.red, t('matrix.use.invalid_nameid'))
      process.exit(1);
    }
  }

  Matrix.loader.start();  
  // still API dependent, TODO: depreciate to firebase
  Matrix.api.device.register(targetDeviceId, function(err, state) {

    if (err) {
      Matrix.loader.stop();
      console.error(err.message);
      debug('Error:', err);
      return process.exit(1);
    }
    if (state.status === 'OK') {
      if (!nameProvided) target = Matrix.helpers.lookupDeviceName(target);

      // Save the device token
      Matrix.config.device = {}
      Matrix.config.device.identifier = targetDeviceId;
      Matrix.config.device.token = state.results.device_token;

      async.parallel([
        function track(cb) {
          // track
          Matrix.helpers.trackEvent('device-use', { did: targetDeviceId }, cb);
        },
        function write(cb) {
          Matrix.helpers.saveConfig(cb);
        }
      ], function () {
        Matrix.loader.stop();
        console.log('Now using device:'.grey, target, 'ID:'.grey, targetDeviceId);
        process.exit()
      })


      //Create the object for keep device after session expired
      if (!Matrix.config.keepDevice) Matrix.config.keepDevice = {};

      //Create key for the current user into the object for keep device after session expired
      if (!_.has(Matrix.config.keepDevice, Matrix.config.user.id)) {
        Matrix.config.keepDevice[Matrix.config.user.id] = {};
      }
      //Put the data into the object for keep device after session expired
      Matrix.config.keepDevice[Matrix.config.user.id].identifier = Matrix.config.device.identifier;
      Matrix.config.keepDevice[Matrix.config.user.id].name = target;
      //Save config


    } else {
      debug('Matrix Use Error Object:', state);
      if (state.error === 'access_token not valid.') {
        console.log(t('matrix.use.not_authorized').red, '\n', t('matrix.use.invalid_token'), '. ', t('matrix.use.try').grey, 'matrix login')
      } else {
        console.error('Error', state.status_code.red, state.error);
      }
    }

  });
});

function displayHelp() {
  console.log('\n> matrix use ¬ \n');
  console.log('\t                 matrix use <deviceid> -', t('matrix.use.command_help').grey)
  console.log('\n')
}