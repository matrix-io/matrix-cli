#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('list');
var async = require('async')

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  Matrix.validate.user(); //Make sure the user has logged in
  console.log('User validated');
  var target = Matrix.pkgs[0];
  Matrix.loader.start();
  Matrix.firebaseInit(function () {

    if (target.match(/all/)) {
      Matrix.firebase.user.getAllApps(function (err, resp) {
        if (_.isEmpty(resp)) return console.error(t('matrix.list.no_results'));
        debug('Device List>', resp);
        Matrix.loader.stop();
        console.log(Matrix.helpers.displayDeviceApps(resp));

        // save for later
        Matrix.config.deviceMap = resp;
        Matrix.helpers.saveConfig(function () {
          process.exit();
        })
      });
    } else if (target.match(/app/)) {
      Matrix.validate.device(); //Make sure the user has selected a device
      Matrix.firebase.app.list(function (err, apps) {
        Matrix.loader.stop();
        if (err) return console.error('- ', t('matrix.list.app_list_error') + ':', err);
        if (_.isUndefined(apps) || _.isNull(apps)) apps = {};

        //Retrieve status for each app
        async.forEach(Object.keys(apps), function (appId, done) {
          Matrix.firebase.app.getStatus(appId, function (status) {
            if (!_.isUndefined(status)) status = "inactive"; //Set default status to inactive
            debug("Status Watch: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
            apps[appId].status = status;
            done();
          });
        }, function (err) {
          //Once the status or each app has been collected, print table
          console.log(Matrix.helpers.displayApps(apps));
          process.exit();
        });
      });
    } else if (target.match(/device/)) {

      Matrix.firebase.device.list(function (devices) {
        debug('Device list found: ', devices)
        var deviceIds = _.keys(devices);

        var deviceMap = {};
        Matrix.loader.stop();
        async.eachOf(devices, function (userDevice, deviceId, cb) {
          Matrix.firebase.device.lookup(deviceId, function (err, device) {
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
        }, function (err) {
          if (err) return console.error(err.red);
          console.log(Matrix.helpers.displayDevices(deviceMap));
          Matrix.config.deviceMap = deviceMap;
          Matrix.helpers.saveConfig(function () {
            process.exit();
          });
        })
      });
    } else if (target.match(/group/)) {
      Matrix.loader.stop();
      console.warn('groups not in yet')
      /** do nothing if not device **/
      Matrix.api.group.list(function (body) {
        //print group
        console.log(Matrix.helpers.displayGroups(body));
        process.exit();
      });
    } else {
      Matrix.loader.stop();
      console.log('Unknown parameter'.yellow + ' ' + target);
      displayHelp();
    }

  });

  function displayHelp() {
    console.log('\n> matrix list ¬\n');
    console.log('\t    matrix list devices -', t('matrix.list.help_devices').grey)
    // console.log('\t     matrix list groups -', t('matrix.list.help_groups').grey)
    console.log('\t       matrix list apps -', t('matrix.list.help_apps').grey)
    console.log('\t        matrix list all -', t('matrix.list.help_all').grey)
    console.log('\n')
    process.exit(1);
  }

  // TODO: support config <app>
});