#!/usr/bin/env node

var async = require('async');
var debug;
var userGroups;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('use');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  function(cb) { 
    Matrix.firebaseInit(cb); 
  },
  function (cb) {
    Matrix.helpers.getUserGroups((err, groups) => {
      if (err) return cb(err);
      userGroups = groups;
      return cb(null);
    });
  }
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
  var isGroup = Object.keys(userGroups).includes(target);

  if (isGroup) {
    console.log('Using Group: '.grey + target);
  }
  else if (_.isEmpty(targetDeviceId)) {
    // not a name, must be a key?
    if (_.has(Matrix.config.deviceMap, target)) {
      targetDeviceId = target;
    } 
    else {
      console.log(target.red, t('matrix.use.invalid_nameid'))
      process.exit(1);
    }
  }

  if (!_.isUndefined(Matrix.config.device)) {
    delete Matrix.config.device;
  }
  if (!_.isUndefined(Matrix.config.group)) {
    delete Matrix.config.group;
  }


  if (isGroup) { 
    // clean group in config
    // during register the devices will be stored there
    Matrix.config.group = {
      name: target,
      devices: []
    }

    const deviceIds = userGroups[target];
    
    Matrix.loader.start();
    Matrix.helpers.registerDevicesAsync(deviceIds, (err) => {
      Matrix.loader.stop();
      if (err) {
        console.error(err.message);
        return process.exit(1);
      }

      Matrix.helpers.syncSaveConfig();
      console.log('Group devices: '.grey);
      if (_.isEmpty(deviceIds)) console.log('Empty Group'.red);
      deviceIds.forEach(did => 
        console.log('Name: '.grey + Matrix.helpers.lookupDeviceName(did) + ' ID: '.grey + did)
      );
      deviceIds.forEach(did => Matrix.helpers.trackEvent('device-use', { did: did } ));
      return process.exit();
    });
  } 
  else {
    // clean device in config
    Matrix.config.device = {};

    const deviceName = Matrix.helpers.lookupDeviceName(targetDeviceId);

    Matrix.loader.start();  
    Matrix.helpers.registerDeviceAsync(targetDeviceId, (err) => {
      Matrix.loader.stop();
      if (err) {
        console.error(err.message);
        return process.exit(1);
      }

      Matrix.helpers.syncSaveConfig();
      console.log('Now using device:'.grey, deviceName, 'ID:'.grey, targetDeviceId);
      Matrix.helpers.trackEvent('device-use', { did: targetDeviceId } );
      return process.exit();
    }); 
  }
});

function displayHelp() {
  console.log('\n> matrix use ¬ \n');
  console.log('\t                 matrix use <deviceid> -', t('matrix.use.command_help').grey)
  console.log('\t                 matrix use <groupName> -', t('matrix.use.command_help_group').grey)
  console.log('\n')
}