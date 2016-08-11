var fs = require('fs');
var Table = require('cli-table');
var moment = require('moment');
var _ = require('lodash');

var debug = debugLog('helpers');


function saveConfig(cb) {
  // debug('Save Config', Matrix.config, __dirname + '/../tmp/store.json');
  fs.writeFile(__dirname + '/../tmp/store.json', JSON.stringify(Matrix.config), function(err) {
    if (err) console.error(t('matrix.helpers.config_save_error') + ': ', err);
    debug('Config Saved ==>', Matrix.config);
    if (_.isFunction(cb)) {
      cb();
    }
  });
}


var ttyWidth = process.stdout.columns;
var ttyExtra = ttyWidth - 80 - 10;


function removeConfig(cb) {
  fs.unlink(__dirname + '/../tmp/store.json', function(err) {
    if (err) console.error(err);
    cb();
  })
}

function lookupDeviceName(id) {
  var device = _.find(Matrix.config.deviceMap, {
    id: id
  });
  return (_.has(device, 'name')) ? device.name : undefined;
}

function getConfig() {
  var config;
  // See if we have existing creds on file

  try {
    fs.statSync(__dirname + '/../tmp');
  } catch(e){
    console.log(t('matrix.helpers.adding'), '/tmp'.green);
    fs.mkdirSync(__dirname + '/../tmp');
  }

  try {
    fs.statSync(__dirname + '/../tmp/store.json');
  } catch (e) {
    // no file yet
    fs.writeFileSync(__dirname + '/../tmp/store.json', JSON.stringify({
      user: {},
      device: {},
      client: {}
    }));
  }

  try {
    config = JSON.parse(fs.readFileSync(__dirname + '/../tmp/store.json'));
  } catch (e) {
    console.error(t('matrix.helpers.config_error'), e)
    return {
      user: {},
      device: {}
    };
  }

  if (_.keys(config.user).length > 0) {
    Matrix.api.user.setToken(config.user.token);
  }

  if (_.keys(config.device).indexOf('token') > -1) {
    Matrix.api.device.setToken(config.device.token);
  }

  return config;
}

function displayKeyValue(el) {
  var table = new Table({
    head: ['Key', 'Value'],
    colWidths: [30, 30]
  });

  _.forEach(el, function(item, i) {
    table.push([i, item]);
  });
  return table.toString();
}

function displayApps(apps) {
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: ['Name'.underline, 'v'.underline, 'Description'.underline],
    colWidths: [27, 7, 46 + ttyExtra]
  });

  _.forEach(apps, function(item) {
    table.push([item.name, item.version, item.description || ''])
  });

  return table.toString();
}

function displayDevices(el) {
  var items = JSON.parse(el);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.devices.device_id').underline, t('matrix.helpers.devices.name').underline, t('matrix.helpers.devices.ok').underline, t('matrix.helpers.devices.last_online').underline],
    colWidths: [40, 25 + ttyExtra, 4, 15]
  });

  //transform


  _.forEach(items.results, function(item, i) {
    var status = item.statusConnection;
    if (status === 'online') {
      status = 'ok'.green;
    } else {
      status = 'no'.red;
    }
    table.push([item.deviceId, item.name || '', status, moment(item.lastHeartbeat, "YYYYMMDD").fromNow()]);
  });

  debug(table);

  return table.toString();
}

function displayGroups(el) {
  var items = JSON.parse(el);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.groups.name').underline, t('matrix.helpers.groups.devices').underline, t('matrix.helpers.groups.group_id').underline],
    colWidths: [40, 12, 28]
  });

  _.forEach(items.results, function(item, i) {
    table.push([item.name, _.size(item.device), item.id]);
  });

  return table.toString();
}

function displaySearch(raw, needle) {
  var results = JSON.parse(raw);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.search.installs').underline, t('matrix.helpers.search.name').underline, t('matrix.helpers.search.description'), t('matrix.helpers.search.latest').underline],
    colWidths: [5, 20, 42 + ttyExtra, 9]
  });

  _.each(results.results, function(app) {
    debug(app);

    if (app.name.indexOf(needle) > -1) {
      var i = app.name.indexOf(needle);
      app.name = app.name.substr(0, i) + needle.green + app.name.substr(i+needle.length, app.name.length);
    }

    _.defaults(app, {
      numInstalls: 0,
      currVers: '',
      desc: ''
    })

    table.push([app.numInstalls, app.name, app.desc, app.currVers.grey, ]);
  })

  return table.toString();

}

function displayDeviceApps(raw) {
  var results = JSON.parse(raw);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [ t('matrix.helpers.device_apps.device').underline, t('matrix.helpers.device_apps.app_name').underline, t('matrix.helpers.device_apps.description').underline ],
    colWidths: [30, 20, 26 + ttyExtra ]
  });

  _.each(results.results, function(device) {
    if (device.installedApps.length > 0) {

      if (device.installedApps.length === 1) {

        var app = device.installedApps[0];
        table.push([device.deviceId, app.name, app.desc || '']);

      } else {

        table.push([device.deviceId, '', '']);
        _.each(device.installedApps, function(app, i) {

          table.push([
            // silly arrow
            (i === 0) ?
            _.repeat(' ', Math.min(26, device.deviceId.length)) + '↳'.grey
            : '',
            app.name, app.desc || ''
          ]);

        })
      }
    }
  })

  return table.toString();
}

function packageApp(name) {
  // zip up folder
}

module.exports = {
  displayDeviceApps: displayDeviceApps,
  displaySearch: displaySearch,
  saveConfig: saveConfig,
  getConfig: getConfig,
  displayDevices: displayDevices,
  displayGroups: displayGroups,
  displayKeyValue: displayKeyValue,
  displayApps: displayApps,
  packageApp: packageApp,
  lookupDeviceName: lookupDeviceName,
  removeConfig: removeConfig,
};
