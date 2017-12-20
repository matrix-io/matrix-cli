#!/usr/bin/env node

var async = require('async')
var debug;
var deviceIds;

// group subcomand (create, read, clear, add, remove)
var target;
var groupName;
var commands = ['create', 'read', 'clear', 'add', 'remove'];

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
  function (cb) {
    if (!commands.includes(target)) {
      return cb(new Error('Unknown parameter'.yellow + ' ' + target));
    }
    return cb(null);
  },
  Matrix.validate.userAsync,
  function (cb) { Matrix.firebaseInit(cb); },
  createGroup,
  readGroup,
  clearGroup,
  Matrix.validate.groupAsync,
  addDevices,
  removeDevices,
], function(err) {
  Matrix.loader.stop();
  console.log(err.message);
  displayHelp();
});

// create new group
function createGroup(cb) {
  if (target.match(/create/)) {

    if (_.isUndefined(groupName)) {
      console.error('No group name provided.');
      displayHelp();
      return process.exit(1);
    }

    async.waterfall([
      Matrix.helpers.getUserGroups,
      (groups, done) => {
        let err;
        if (Object.keys(groups).find((key) => key === groupName)) {
          err = new Error(groupName + ' Group already exists.')
          return done(err);
        }
        return done(null);
      },
      (done) => {
        Matrix.loader.stop();
        // write group to firebase
        // [false] to make sure firebase creates an empty array
        Matrix.firebase.user.setGroup(groupName, [false], () => {
          debug('group set >', groupName);
          console.log(groupName+' Group created'.grey);
          return done(null); 
        });
      }
    ], (err) => {
      if (err) {
        debug('create group >', err);
        console.error(err.message.red);
        return process.exit(1);
      }
      return process.exit();
    });
  }
  else {
    cb();
  }
}

// read devices from a group
function readGroup(cb) {
  if (target.match(/read/)) {

    if (_.isUndefined(groupName)) {
      if (!_.isUndefined(Matrix.config.group.name)) {
        groupName = Matrix.config.group.name;
      }
      else {
        console.error('No group name provided.');
        displayHelp();
        return process.exit(1);
      }
    }

    async.waterfall([
      Matrix.helpers.getUserGroups,
      // check if group exists
      (groups, done) => {
        let err;
        if (!Object.keys(groups).find((key) => key === groupName)) {
          err = new Error('No group named ' + groupName);
          return done(err);
        }
        return done(null);
      },
      (done) => Matrix.helpers.getDevicesFromGroup(groupName, done),
      (devices, done) => {
        Matrix.loader.stop();
        if (_.isEmpty(devices)) {
          console.log('Empty Group.'.red);
          return done(null);
        }

        debug('list group devices >', devices);
        console.log('\nDevices in group '.grey + groupName + ':'.grey);
        devices.forEach(did => {
          if (did) console.log('ID: '.grey + did + ' Name: '.grey + Matrix.helpers.lookupDeviceName(did));
        });
        return done(null);
      }
    ], (err) => {
      if (err) {
        debug('list group >', err);
        console.error(err.message.red);
        return process.exit(1);
      }
      return process.exit();
    });
  }
  else {
    cb();
  }
}

// remove a group 
function clearGroup(cb) {
  if (target.match(/clear/)) {
    
    if (_.isUndefined(groupName)) {
      if (!_.isUndefined(Matrix.config.group.name)) {
        groupName = Matrix.config.group.name;
      }
      else {
        console.error('No group name provided.');
        displayHelp();
        return process.exit(1);
      }
    }

    Matrix.firebase.user.removeGroup(groupName, () => {
      Matrix.loader.stop();
      console.log(groupName+ ' Group Removed.'.grey);
      return process.exit(1);
    });
  }
  else {
    cb();
  }
}

// add device ids to a group
function addDevices(cb) {
  if (target.match(/add/)) {

    deviceIds = filterDeviceIds(deviceIds);

    async.waterfall([
      (done) => Matrix.helpers.getDevicesFromGroup(Matrix.config.group.name, done),
      (oldDeviceIds, done) => {
        // concat new ids with old and remove duplicates
        let newDeviceIdsList = deviceIds.concat(oldDeviceIds);
        newDeviceIdsList = newDeviceIdsList.filter((id, idx, arr) => arr.indexOf(id) == idx);

        Matrix.firebase.user.setGroup(Matrix.config.group.name, newDeviceIdsList, (err) => {
          Matrix.loader.stop();
          if (err) return done(err);

          debug('group add devices > ', deviceIds);
          debug('group add devices new list > ', newDeviceIdsList);
          console.log( (newDeviceIdsList.length-oldDeviceIds.length) + ' device(s) added to group ' + Matrix.config.group.name);
          return done(null, newDeviceIdsList);
        });
      },
      // register all devices (old and new ones)
      (deviceIds, done) => Matrix.helpers.registerDevicesAsync(deviceIds, done),
      (done) => Matrix.helpers.saveConfig(done)
    ], (err) => {
      if (err) {
        debug('group add device error: ', err);
        console.error(err.message.red);
        return process.exit(1);
      }
      return process.exit();
    });
  } else {
    cb();
  }
}

// remove device ids from group
function removeDevices(cb) {
  if (target.match(/remove/)) {

    deviceIds = filterDeviceIds(deviceIds);

    async.waterfall([
      (done) => Matrix.helpers.getDevicesFromGroup(Matrix.config.group.name, done),
      (oldDeviceIds, done) => {
        // remove devices in id list from old devices id list
        let newDeviceIdsList = oldDeviceIds.filter(oldid => !deviceIds.includes(oldid));

        // if new array is empty, create list with [false] to avoid firebase deletion of empty array
        let setList = _.isEmpty(newDeviceIdsList) ? [false] : newDeviceIdsList;

        Matrix.firebase.user.setGroup(Matrix.config.group.name, setList, (err) => {
          Matrix.loader.stop();
          if (err) return done(err);

          debug('group remove devices > ', deviceIds);
          debug('group remove devices new list > ', newDeviceIdsList);
          console.log( (oldDeviceIds.length-newDeviceIdsList.length) + ' device(s) removed from group ' + Matrix.config.group.name);
          return done(null, newDeviceIdsList);
        });
      },
      // register all devices (ones that are left)
      (deviceIds, done) => Matrix.helpers.registerDevicesAsync(deviceIds, done),
      (done) => Matrix.helpers.saveConfig(done)
    ], (err) => {
      if (err) {
        debug('group remove device error: ', err);
        console.error(err.message.red);
        return process.exit(1);
      }
      return process.exit();
    });
  }
  else {
    cb();
  }
}

// convert device names into ids and remove duplicates
function filterDeviceIds(dids) {
  return dids.map(deviceId => {
    var targetDeviceId = _.findKey(Matrix.config.deviceMap, { name: deviceId });

    if (_.isEmpty(targetDeviceId)) {
      if (_.has(Matrix.config.deviceMap, deviceId)) {
        return deviceId;
      }
      else {
        console.log(deviceId.red, t('matrix.use.invalid_nameid'))
        return process.exit(1);
      }
    }
    else return targetDeviceId;
  })
  .filter((deviceId, index, arr) => {
    // remove duplicates
    return arr.indexOf(deviceId) == index;
  });
}

function displayHelp() {
  console.log('\n> matrix group ¬\n');
  console.log('\tmatrix group create <groupName> -', t('matrix.group.help_create').grey)
  console.log('\tmatrix group read <groupName> -', t('matrix.group.help_read').grey)
  console.log('\tmatrix group clear <groupName> -', t('matrix.group.help_clear').grey)
  console.log('\tmatrix group add [<deviceId>...] -', t('matrix.group.help_add').grey)
  console.log('\tmatrix group remove [<deviceId>...] -', t('matrix.group.help_remove').grey)
  console.log('\n')
  process.exit(1);
}