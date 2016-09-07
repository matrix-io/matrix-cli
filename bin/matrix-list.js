#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('list');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var target = Matrix.pkgs[0];

  if (target.match(/all/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.firebaseInit(function () {
      Matrix.firebase.user.getAllApps(function (resp) {
        if (_.isEmpty(resp)) return console.error(t('matrix.list.no_results'));
        debug('Device List>', resp);
        console.log(Matrix.helpers.displayDeviceApps(resp));

        // save for later
        Matrix.config.appMap = resp;
        Matrix.helpers.saveConfig(function(){
          process.exit();
        })
      });
    });
  } else if (target.match(/app/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.validate.device(); //Make sure the user has selected a device
    Matrix.firebaseInit(function () {
      Matrix.firebase.app.list(function (err, data) {
        if (err) return console.error('- ', t('matrix.list.app_list_error') + ':', err);
        if (_.isUndefined(data)) data = {};
        console.log(Matrix.helpers.displayApps(data));
        process.exit();
      });
    });
  } else if (target.match(/device/)) {
    Matrix.validate.user(); //Make sure the user has logged in

    Matrix.firebase.device.list(function (devices) {
      var deviceIds = _.keys(devices);

      var deviceMap = {};
      async.each(devices, function( userDevice, deviceId, cb ){
        Matrix.firebase.device.lookup( deviceId, function(device){
          if ( _.isEmpty(device) ) return cb('No Device Found in `devices`. Server Error.');
          deviceMap[deviceId] = {
            name: device.meta.name,
            online: device.runtime.online,
            lastSeen: device.runtime.lastConnectionEvent,
            defaultApps : device.config.init
          }
          cb();
        })
      }, function(err){
        if (err) return console.error(err.red);


      })


        console.log(Matrix.helpers.displayDevices(body));
        // save device map to config
        Matrix.config.deviceMap = _.map(JSON.parse(body).results, function (d) {
          return { name: d.name, id: d.deviceId }
        });
        Matrix.helpers.saveConfig(function () {
          process.exit();
        });
      });
  } else if (target.match(/group/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    /** do nothing if not device **/
    Matrix.api.group.list(function (body) {
      //print group
      console.log(Matrix.helpers.displayGroups(body));
      process.exit();
    });
  } else {
    console.log('Unknown parameter'.yellow + ' ' + target);
    displayHelp();
  }

function displayHelp() {
  console.log('\n> matrix list ¬\n');
  console.log('\t    matrix list devices -', t('matrix.list.help_devices').grey)
  console.log('\t     matrix list groups -', t('matrix.list.help_groups').grey)
  console.log('\t       matrix list apps -', t('matrix.list.help_apps').grey)
  console.log('\t        matrix list all -', t('matrix.list.help_all').grey)
  console.log('\n')
  process.exit(1);
}

 // TODO: support config <app>
});
