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
      if (!_.isNull(groups) &&  Object.keys(groups).find((key) => key === groupName)) {
        console.log(groupName + ' Group already exists.')
        process.exit(1);
      }
      Matrix.firebase.user.setGroup(groupName, () => {
        console.log(groupName +' Group created');
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
      if (!_.isNull(groups) &&  !Object.keys(groups).find((key) => key === groupName)) {
        console.log('No such group ' + groupName);
        process.exit(1);
      }

      Matrix.firebase.user.getDevicesFromGroup(groupName ,(err, devices) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
  
        if (devices == null || _.isEmpty(devices)) {
          console.log('Empty Group.');
          process.exit(1);
        }
  
        console.log('Devices in group', groupName, ':');
        devices.forEach(deviceId => {
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
      var lengthAdded = deviceIds.length;
      deviceIds = deviceIds.concat(oldDevicesIds);

      Matrix.firebase.user.setGroup(Matrix.config.groupName, deviceIds, (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
  
        console.log(lengthAdded + ' device(s) added to group ' + Matrix.config.groupName);
        process.exit(1);
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
      var oldLength = oldDevicesIds.length;

      deviceIds = oldDevicesIds.filter(oldDeviceId => {
        return !deviceIds.includes(oldDeviceId);
      });

      Matrix.firebase.user.setGroup(Matrix.config.groupName, deviceIds, (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }

        console.log( (oldLength - deviceIds.length) + ' device(s) removed from group ' + Matrix.config.groupName);
        process.exit(1);
      });
    });
  }
  else {
    cb();
  }
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