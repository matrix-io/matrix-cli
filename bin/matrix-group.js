#!/usr/bin/env node

var async = require('async')
var debug;
var deviceIds;

// group subcomand (create, list, clear, add, remove)
var target, groupName;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('group');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  function (cb) {
    if (!Matrix.pkgs.length || showTheHelp) { Matrix.loader.stop(); return displayHelp(); }
    else {
      target = Matrix.pkgs[0];
      groupName = Matrix.pkgs[1];
      deviceIds = Matrix.pkgs.slice(1);
      cb();
    }
  },
  Matrix.validate.userAsync,
  function (cb) { Matrix.firebaseInit(cb); },
  createGroup,
  listGroup,
  clearGroup,
  Matrix.validate.checkGroupAsync,
  addDevices,
  removeDevices,
], function(err) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  console.log('Unknown parameter'.yellow + ' ' + target);
  displayHelp();
});

function createGroup(cb) {
  if (target.match(/create/)) {

    if (_.isUndefined(groupName)) {
      console.error('No group name provided.');
      displayHelp();
      process.exit(1);
    }
    Matrix.firebase.user.getUserGroups((err, groups) => {
      if (groups != null && Object.keys(groups).find((key) => key === groupName)) {
        console.log(groupName + ' Group already exists.')
        process.exit(1);
      }
      Matrix.firebase.user.setGroup(groupName, [false], () => {
        console.log(groupName+' Group created');
        process.exit(1);
      });
    });
  }
  else {
    cb();
  }
}

function listGroup(cb) {
  if (target.match(/list/)) {

    if (_.isUndefined(groupName)) {
      console.error('No group name provided.');
      displayHelp();
      process.exit(1);
    }

    Matrix.firebase.user.getUserGroups((err, groups) => {
      if (groups == null || !Object.keys(groups).find((key) => key === groupName)) {
        console.log('No such group ' + groupName);
        process.exit(1);
      }

      Matrix.firebase.user.getDevicesFromGroup(groupName ,(err, devices) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
  
        if (devices == null || _.isEmpty(devices) || devices[0] === false) {
          console.log('Empty Group.');
          process.exit(1);
        }
  
        console.log('Devices in group', groupName, ':');
        devices.forEach(deviceId => {
          if(deviceId)
            console.log(deviceId + ' ' + Matrix.helpers.lookupDeviceName(deviceId));
        });
        process.exit(1);
      });
    });
  }
  else {
    cb();
  }
}

function clearGroup(cb) {
  if (target.match(/clear/)) {
    
    if (_.isUndefined(groupName)) {
      console.error('No group name provided.');
      displayHelp();
      process.exit(1);
    }

    Matrix.firebase.user.removeGroup(groupName, () => {
      console.log(groupName+ ' Group Removed.');
      process.exit(1);
    });
  }
  else {
    cb();
  }
}

function addDevices(cb) {
  if (target.match(/add/)) {

    deviceIds = deviceIds.map(deviceId => {
      var targetDeviceId = _.findKey(Matrix.config.deviceMap, { name: deviceId });

      if (_.isEmpty(targetDeviceId)) {
        if (_.has(Matrix.config.deviceMap, deviceId)) {
          return deviceId;
        }
        else {
          console.log(deviceId.red, t('matrix.use.invalid_nameid'))
          process.exit(1);
        }
      }
      else return targetDeviceId;
    })
    .filter((deviceId, index, arr) => {
      // remove duplicates
      return arr.indexOf(deviceId) == index;
    });

    Matrix.firebase.user.getDevicesFromGroup(Matrix.config.groupName, (err, oldDevicesIds) => {

      if (oldDevicesIds && !_.isEmpty(oldDevicesIds)) {
        oldDevicesIds = oldDevicesIds.filter(id => id);
        deviceIds = deviceIds.concat(oldDevicesIds);

        // remove duplicates
        deviceIds = deviceIds.filter((id, index, arr) => arr.indexOf(id) == index);
        // remove not ids
        deviceIds = deviceIds.filter((id, index, arr) => id);
      }

      Matrix.firebase.user.setGroup(Matrix.config.groupName, deviceIds, (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        
        if (oldDevicesIds && !_.isEmpty(oldDevicesIds)) {
          console.log( (deviceIds.length - oldDevicesIds.length) + ' device(s) added to group ' + Matrix.config.groupName);
        } else {
          console.log( deviceIds.length + ' device(s) added to group ' + Matrix.config.groupName);
        }

        registerDevices(deviceIds);
      });
    });

  } else {
    cb();
  }
}

function removeDevices(cb) {
  if (target.match(/remove/)) {

    deviceIds = deviceIds.map(deviceId => {
      var targetDeviceId = _.findKey(Matrix.config.deviceMap, { name: deviceId });

      if (_.isEmpty(targetDeviceId)) {
        if (_.has(Matrix.config.deviceMap, deviceId)) {
          return deviceId;
        }
        else {
          console.log(deviceId.red, t('matrix.use.invalid_nameid'))
          process.exit(1);
        }
      }
      else return targetDeviceId;
    })
    .filter((deviceId, index, arr) => {
      // remove duplicates
      return arr.indexOf(deviceId) == index;
    });

    Matrix.firebase.user.getDevicesFromGroup(Matrix.config.groupName, (err, oldDevicesIds) => {

      if (oldDevicesIds && !_.isEmpty(oldDevicesIds)) {
        var oldLength = oldDevicesIds.length;

        deviceIds = oldDevicesIds.filter(oldDeviceId => {
          return !deviceIds.includes(oldDeviceId);
        });
      }
      else {
        deviceIds = [false]
      }

      if (_.isEmpty(deviceIds)) {
        deviceIds = [false];
      }

      Matrix.firebase.user.setGroup(Matrix.config.groupName, deviceIds, (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }

        if (oldDevicesIds && !_.isEmpty(oldDevicesIds)) {
          if (deviceIds.length == 1 && deviceIds[0] === false)
            console.log( oldLength + ' device(s) removed from group ' + Matrix.config.groupName);
          else          
            console.log( (oldLength - deviceIds.length) + ' device(s) removed from group ' + Matrix.config.groupName);
        } else {
          console.log( 0 + ' device(s) removed from group ' + Matrix.config.groupName);
        }

        registerDevices(deviceIds);
      });
    });
  }
  else {
    cb();
  }
}

function registerDevices(deviceIds) {
  Matrix.config.devices = []
  
  //Create the object for keep device after session expired
  if (!Matrix.config.keepDevice) Matrix.config.keepDevice = {};
  
  //Create key for the current user into the object for keep device after session expired
  if (!_.has(Matrix.config.keepDevice, Matrix.config.user.id)) {
    Matrix.config.keepDevice[Matrix.config.user.id] = [];
  }

  async.each(deviceIds, (targetDeviceId, cb) => {
    if (!targetDeviceId || targetDeviceId == null) return cb(null);
    // still API dependent, TODO: depreciate to firebase
    Matrix.api.device.register(targetDeviceId, function(err, state) {
      if (err) {
        Matrix.loader.stop();
        console.error(err.message);
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
}

function displayHelp() {
  console.log('\n> matrix group ¬\n');
  console.log('\tmatrix group create <groupName> -', t('matrix.group.help_create').grey)
  console.log('\tmatrix group list <groupName> -', t('matrix.group.help_list').grey)
  console.log('\tmatrix group clear <groupName> -', t('matrix.group.help_clear').grey)
  console.log('\tmatrix group add [<deviceId>...] -', t('matrix.group.help_add').grey)
  console.log('\tmatrix group remove [<deviceId>...] -', t('matrix.group.help_remove').grey)
  console.log('\n')
  process.exit(1);
}