#!/usr/bin/env node

var debug, target;
var async = require('async')

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('list');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  function (cb) {
    if (!Matrix.pkgs.length || showTheHelp) { Matrix.loader.stop(); return displayHelp(); }
    else {
      target = Matrix.pkgs[0];
      cb();
    }
  },
  Matrix.validate.userAsync,
  function (cb) { Matrix.firebaseInit(cb); },
  listAll,
  listDevices,
  listGroups,
  function(cb) {
    // group flow
    if (!_.isEmpty(Matrix.config.group)) {
      async.series([
        Matrix.validate.groupAsync,
        listGroupApps
      ], function(err) {
        if (err) return cb(err);
        return cb(null);
      }); 
    } 
    // single device flow
    else {
      async.series([
        Matrix.validate.deviceAsync,
        listApps
      ], function(err) {
        if (err) return cb(err);
        return cb(null);
      });
    }
  },
  // user register does fb init for login, bad if we do that 2x
], function (err) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  console.log('Unknown parameter'.yellow + ' ' + target);
  displayHelp();
});


function displayHelp() {
  console.log('\n> matrix list ¬\n');
  console.log('\t    matrix list devices -', t('matrix.list.help_devices').grey)
  console.log('\t     matrix list groups -', t('matrix.list.help_groups').grey)
  console.log('\t       matrix list apps -', t('matrix.list.help_apps').grey)
  console.log('\t        matrix list all -', t('matrix.list.help_all').grey)
  console.log('\n')
  process.exit(1);
}

function listDevices(cb) {
  if (target.match(/device/)) {

    Matrix.firebase.device.list(function(devices) {
      debug('Device list found: ', devices)

      var deviceMap = {};
      Matrix.loader.stop();
      async.eachOf(devices, function(userDevice, deviceId, cb) {
        Matrix.firebase.device.lookup(deviceId, function(err, device) {
          debug(device)
          if (err) {
            if (err.code == 'PERMISSION_DENIED') {
              console.error('Permission denied, skipping device: ', deviceId);
              return cb();
            } else {
              return cb(err)
            }
          } else {
            if (!_.isEmpty(device)) {
              //TODO temporary defaults until device creation includes this
              if (!device.hasOwnProperty('runtime')) device.runtime = { online: false, lastConnectionEvent: 0 };
              if (!device.hasOwnProperty('config')) device.config = { init: [] };
              deviceMap[deviceId] = {
                name: device.meta.name,
                online: device.runtime.online,
                description: device.meta.description,
                lastSeen: device.runtime.lastConnectionEvent,
                defaultApps: device.config.init
              }
            }
            cb();
          }
        })
      }, function(err) {
        if (err) {
          console.error(err.red);
          process.exit(1);
        }
        console.log(Matrix.helpers.displayDevices(deviceMap));
        Matrix.config.deviceMap = deviceMap;
        Matrix.helpers.saveConfig(function() {
          process.exit();
        });
      })
    });
  } else { cb(); }
}

function listApps(cb) {
  if (target.match(/app/)) {
    Matrix.firebase.app.list(function(err, apps) {
      Matrix.loader.stop();
      if (err) {
        console.error('- ', t('matrix.list.app_list_error') + ':', err);
        process.exit(1);
      }
      if (_.isUndefined(apps) || _.isNull(apps)) apps = {};

      //Retrieve status for each app
      async.forEach(Object.keys(apps), function(appId, done) {
        Matrix.firebase.app.getStatus(appId, function(status) {
          if (_.isUndefined(status)) status = "inactive"; //Set default status to inactive
          debug("Status Watch: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
          apps[appId].status = status;
          done();
        });
      }, function(err) {
        //Once the status or each app has been collected, print table
        console.log(Matrix.helpers.displayApps(apps));
        process.exit();
      });
    });
  } else { cb(); }
}

function listGroupApps (cb) {
  if (target.match(/app/)) {
    async.map(Matrix.config.group.devices, (device, done) => {
      const did = device.identifier;
      Matrix.firebase.app.list(did, (err, apps) => {
        if (err) return done(err);

        if (_.isUndefined(apps) || _.isNull(apps)) apps = {};

        //Retrieve status for each app
        async.forEach(Object.keys(apps), function(appId, callback) {
          Matrix.firebase.app.getStatus(did, appId, function(status) {
            if (_.isUndefined(status)) status = "inactive"; //Set default status to inactive
            debug("Status Watch: " + Matrix.config.user.id + '>' + did + '>' + appId + '>' + status);
            apps[appId].status = status;
            return callback();
          });
        }, function(err) {
          if (err) return done(err);
          else return done(null, apps);
        });
      });
    }, (err, res) => {
      Matrix.loader.stop();
      if (err) {
        console.error('- ', t('matrix.list.app_list_error') + ':', err);
        return process.exit(1);
      }
      const cnt = Matrix.config.group.devices.length;
      // unique apps
      let apps = res.reduce((acc, appsObj) => {
        Object.keys(appsObj).forEach(appId => {
          if (_.isUndefined(acc[appId])) {
            acc[appId] = appsObj[appId];
          }
        });
        return acc;
      }, {});
      let ids = res.map(appsObj => Object.keys(appsObj));
      ids = _.flatten(ids);
      ids = _.countBy(ids, _.identity); // count appIds
      apps = _.filter(apps, (value, key) => ids[key] === cnt);
      // Print only apps installed in all devices of the group
      console.log('Apps installed in all group devices'.grey);
      console.log(Matrix.helpers.displayApps(apps));
      return process.exit();

    });
  } else { cb(); }
}

function listAll(cb) {
  if (target.match(/all/)) {
    Matrix.firebase.user.getAllApps(function(err, resp) {
      Matrix.loader.stop();
      if (_.isEmpty(resp)) {
        console.error(t('matrix.list.no_results'));
        process.exit(1);
      }
      debug('Device List>', resp);
      console.log(Matrix.helpers.displayDeviceApps(resp));

      // save for later
      Matrix.config.deviceMap = resp;
      Matrix.helpers.saveConfig(function() {
        process.exit();
      })
    });
  } else { cb(); }
}

function listGroups(cb) {
  if (target.match(/group/)) {
    Matrix.helpers.getUserGroups(function(err, groups) {
      Matrix.loader.stop();
      if (_.isEmpty(groups)) {
        console.error(t('matrix.list.no_results'));
        return process.exit(1);
      }

      debug('Groups List>', groups);

      console.log('\n'+Matrix.helpers.displayGroups(groups));
      return process.exit();
    });
  } else { cb(); }
}
