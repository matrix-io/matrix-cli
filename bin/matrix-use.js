#!/usr/bin/env node

var async = require('async');
var debug;
var target;
var deviceIds = [];
var isGroup = false;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('use');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  function (cb) { Matrix.firebaseInit(cb); },
  function (cb) {
    target = Matrix.pkgs.join(' ');

    Matrix.firebase.user.getUserGroups(function(err, groups) {
      if (err) {
        console.error(err.message);
        debug('Error:', err);
        return process.exit(1);
      }

      if (!_.isEmpty(groups) && Object.keys(groups).find(key => key === target)) {
        isGroup = true;

        if (groups[target] instanceof Array) {
          groups[target].forEach(device => {
            if (device != null && device)
              deviceIds.push(device);
          });
        }
      }

      return cb(null);
    });
  }
], function (err, arr) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  if (!Matrix.pkgs.length || showTheHelp) return displayHelp();

  var targetDeviceId = _.findKey(Matrix.config.deviceMap, { name: target });
  Matrix.config.device.identifier = targetDeviceId;

  delete Matrix.config.groupName;

  if (_.isEmpty(targetDeviceId)) {
    // not a name, must be a key?
    if (_.has(Matrix.config.deviceMap, target)) {
      deviceIds.push(target);
    } else if (!isGroup) {
      console.log(target.red, t('matrix.use.invalid_nameid_groupname'))
      process.exit(1);
    } else {
      console.log('Using group ' + target);
      Matrix.config.groupName = target;
      delete Matrix.config.device.identifier;
    }
  }
  else {
    deviceIds.push(targetDeviceId);
  }

  Matrix.loader.start();  

  Matrix.config.devices = []

  //Create the object for keep device after session expired
  if (!Matrix.config.keepDevice) Matrix.config.keepDevice = {};
  
  //Create key for the current user into the object for keep device after session expired
  if (!_.has(Matrix.config.keepDevice, Matrix.config.user.id)) {
    Matrix.config.keepDevice[Matrix.config.user.id] = [];
  }

  async.each(deviceIds, (targetDeviceId, cb) => {
    if (targetDeviceId == null) return cb(null);
    // still API dependent, TODO: depreciate to firebase
    Matrix.api.device.register(targetDeviceId, function(err, state) {
      if (err) {
        Matrix.loader.stop();
        console.error(err.error);
        debug('Error:', err);
        return process.exit(1);
      }

      if (state.status === 'OK') {
        target = Matrix.helpers.lookupDeviceName(targetDeviceId);
  
        // Save the device token
        Matrix.config.devices.push({ 
          identifier: targetDeviceId,
          token: state.results.device_token 
        });
  
        console.log('Using device:'.grey, target, 'ID:'.grey, targetDeviceId);
        
        //Put the data into the object for keep device after session expired
        Matrix.config.keepDevice[Matrix.config.user.id].push({
          identifier: targetDeviceId,
          name: target
        });
        
        return cb(null);
      } else {
        debug('Matrix Use Error Object:', state);
        if (state.error === 'access_token not valid.') {
          console.log(t('matrix.use.not_authorized').red, '\n', t('matrix.use.invalid_token'), '. ', t('matrix.use.try').grey, 'matrix login')
        } else {
          console.error('Error', state.status_code.red, state.error);
        }
        process.exit(1);
      }
  
    });
  }, (err) => {
    Matrix.loader.stop();
    if (deviceIds.length === 0)
      console.log('Empty Group. Add devices with matrix add <deviceId> ');
    else {
      deviceIds.forEach(device => {
        Matrix.helpers.trackEvent('device-use', { did: device });
      });
    }
    console.log('Done.'.green);
    // Save config
    Matrix.helpers.saveConfig((err) => {
      process.exit(1);
    });
  });
  
});

function displayHelp() {
  console.log('\n> matrix use ¬ \n');
  console.log('\t                 matrix use <deviceid> -', t('matrix.use.command_help').grey)
  console.log('\t                 matrix use <groupName> -', t('matrix.use.command_help_group').grey)
  console.log('\n')
}