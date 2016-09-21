  var fs = require('fs');
var Table = require('cli-table');
var moment = require('moment');
var _ = require('lodash');

var debug = debugLog('helpers');


function saveConfig(cb) {
  fs.writeFile(__dirname + '/../store.json', JSON.stringify(Matrix.config), function(err) {
    if (err) console.error(t('matrix.helpers.config_save_error') + ': ', err);
    debug('Config Saved ==>', Matrix.config);
    if (_.isFunction(cb)) {
      cb();
    }
  });
}

function isDeviceOnline(deviceId, cb){
  Matrix.firebase.device.getRuntime(function(err, runtime){
    if ( err ) return cb(err);
    cb(null, runtime.online );
  })
}

// this will only work on a single device
function lookupAppId(name, cb){
  if (Matrix.config.hasOwnProperty('appMap') === true && Matrix.config.appMap.hasOwnProperty(Matrix.config.device.identifier)) {
    debug('Local app lookup: ');
    var device = Matrix.config.appMap[Matrix.config.device.identifier];
    if (device.hasOwnProperty('apps')) {
      debug('Apps in device: ', device.apps);
      results = _.findKey(device.apps, { name: name });
    }
    var results = device.hasOwnProperty('apps') ? _.findKey(device.apps, { name: name }) : undefined;
    if (!_.isUndefined(results)) {
      debug('App found: ', results);
      return cb(null, results);
    } else {
      debug('Remote app lookup: ');
      return Matrix.firebase.app.getIDForName(name, cb);
    }

  } else {
    // if no, firebase
    debug('Remote app lookup: ');
    return Matrix.firebase.app.getIDForName(name, cb);
  }
}


var ttyWidth = process.stdout.columns;
var ttyExtra = ttyWidth - 80 - 10;


function removeConfig(cb) {
  fs.unlink(__dirname + '/../store.json', function(err) {
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
  //
  // try {
  //   fs.statSync(__dirname + '/../tmp');
  // } catch(e){
  //   console.log(t('matrix.helpers.adding'), '/tmp'.green);
  //   fs.mkdirSync(__dirname + '/../tmp');
  // }

  try {
    fs.statSync(__dirname + '/../store.json');
  } catch (e) {
    // no file yet
    fs.writeFileSync(__dirname + '/../store.json', JSON.stringify({
      user: {},
      device: {},
      client: {}
    }));
  }

  try {
    config = JSON.parse(fs.readFileSync(__dirname + '/../store.json'));
  } catch (e) {
    console.error(t('matrix.helpers.config_error'), e)
    return {
      user: {},
      device: {}
    };
  }
  try {
    fs.statSync(__dirname + '/../store.json');
  } catch (e) {
    // no file yet
    fs.writeFileSync(__dirname + '/../store.json', JSON.stringify({
      user: {},
      device: {},
      client: {}
    }));
  }

  try {
    config = JSON.parse(fs.readFileSync(__dirname + '/../store.json'));
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

  _.forEach(el, function (item, i) {
    table.push([i, item]);
  });
  return table.toString();
}

function displayApps(apps) {
  if ( _.isEmpty(apps)) return;
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: ['Name'.underline, 'v'.underline, 'Description'.underline],
    colWidths: [27, 7, 46 + ttyExtra]
  });

  _.forEach(apps, function (item) {
    table.push([item.name, item.version || '', item.description || ''])
  });

  try {
    debug('apps list'.red);
    JSON.stringify(table);
  } catch (err) {
    console.log('err', err)
  } finally {
    return table.toString()
  }
}


/**
 * displayDevices - Returns a string with an ascii table. Suitable for displaying.
 * Takes Matrix.config.deviceMap object
 *
 * @param  {} devices
 * @param  [$id]      devices[$id]              Collection grouped by key
 * @param  {string}   devices[$id].name         Device Name
 * @param  {boolean}  devices[$id].online       Is Online?
 * @param  {int}      devices[$id].lastSeen     Timestamp
 * @param  {array}    devices[$id].defaultApps  Starts these apps automatically
 * @return {string}   table
 */

function displayDevices(devices) {
    if ( _.isEmpty(devices)) return;

  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.devices.device_id').underline, t('matrix.helpers.devices.name').underline,
    t('matrix.helpers.devices.ok').underline, t('matrix.helpers.devices.last_online').underline],
    colWidths: [40, 25 + ttyExtra, 4, 15]
  });

  //transform


  _.forEach(devices, function (device, deviceId) {
    var status = device.online;
    if (status) {
      status = 'ok'.green;
    } else {
      status = 'no'.red;
    }

    var time = moment.unix(device.lastSeen, "YYYYMMDD").fromNow();

    if ( device.lastSeen === 0 ){
      time = '-';
    }
    
    table.push([ deviceId, device.name || '', status, time] );
  });

  try {
    console.log('devices list'.red);
    JSON.stringify(table);
  } catch (err) {
    console.log('err', err)
  } finally {
    return table.toString()
  }
}

function displayGroups(el) {
  var items = JSON.parse(el);
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.groups.name').underline, t('matrix.helpers.groups.devices').underline, t('matrix.helpers.groups.group_id').underline],
    colWidths: [40, 12, 28]
  });

  _.forEach(items.results, function (item, i) {
    table.push([item.name, _.size(item.device), item.id]);
  });

  return table.toString();
}

function displaySearch(raw, needle) {

  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.search.name').underline, t('matrix.helpers.search.short_name').underline, t('matrix.helpers.search.latest').underline, t('matrix.helpers.search.description').underline],
    colWidths: [26, 26, 11, 17 + ttyExtra]
  });

  _.each(_.values(raw), function (app) {
    debug(app);
    var versions = app.versions;
    app = app.meta;

    if (app.name.indexOf(needle) > -1) {
      var i = app.name.indexOf(needle);
      app.name = app.name.substr(0, i) + needle.green + app.name.substr(i + needle.length, app.name.length);
    }

    _.defaults(app, {
      name: app.name,
      desc: app.description,
      version: app.version,
      short: app.shortName
    })

    var version = '';
    version = versions[app.currentVersion].version;

    table.push([app.name, app.shortName || '', version, app.description || '']);
  })

  try {
    console.log('Search results'.red);
    return JSON.stringify(table);
  } catch (err) {
    console.log('err', err)
  } finally {
    return table.toString()
  }

}

function displayDeviceApps(deviceapps) {
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.device_apps.device').underline, t('matrix.helpers.device_apps.app_name').underline ],
    colWidths: [30, 46 + ttyExtra]
  });

  _.each(deviceapps, function (device, deviceId) {
    if ( _.keys(device.apps).length > 0) {

      if ( _.keys(device.apps).length === 1) {

        var appId = _.keys(device.apps)[0];
        var app = device.apps[appId];
        table.push([deviceId, app.name ]);

      } else {

        table.push([deviceId, '' ]);
        _.each(device.apps, function (app, appId, i) {

          table.push([
            // silly arrow
            (i === 0) ?
              _.repeat(' ', Math.min(29, deviceId.length)) + '↳'.grey : '',
            app.name
          ]);

        })
      }
    }
  })

  try {
    console.log('all'.red);
    return JSON.stringify(table);
  } catch (err) {
    console.log('err', err)
  } finally {
    return table.toString()
  }
}

function packageApp(name) {
  // zip up folder
}


function checkPolicy(policy, name, cb) {

  var Rx = require('rx')
  var defaultTruth;

  console.log(policy)
  console.log('==== ^^^^ GRANT ACCESS ???? ^^^^ ===='.blue)


  var confirmed = {};
  // need to inject results of answers into questions for decision trees
  var prompts = new Rx.Subject();

  // on every question do this
  var skip = false;
  require('inquirer').prompt(prompts).ui.process.subscribe(function (ans) {
    if (ans.name === 'quick' && ans.answer === true) {
      skip = true;
      _.each(policy, function (a, c) {
        confirmed[c] = {};
        _.each(a, function (value) {
          confirmed[c][value] = true;
        })
      })
      prompts.onCompleted();
    }

    if (ans.name === 'default' && !skip) {
      //setup default
      defaultTruth = ans.answer;
      stepThroughConfig();
    }

    if (!_.isNull(ans.name.match(/sensors|integrations|events|services/)) && _.isArray(ans.answer)) {
      //namespace object
      confirmed[ans.name] = {};
      _.each(ans.answer, function (answer) {
        confirmed[ans.name][answer] = true;
      })
    }
  }, function (e) { console.error(e) }, function () {

    cb(null, confirmed);
  });


  function stepThroughConfig() {
    console.log('config to strep trough: ', JSON.stringify(policy));
    _.forIn(policy, function (v, k) {
      console.log('>>>>>>> ' , v , ' : ' , k , ' <<<<<<<< ');
      var baseQ = {
        type: 'checkbox',
        name: k,
        message: 'Grant access to '.white + k.grey + '?'.white,
        choices: [],
        // {
        //   key: 'p',
        //   name: 'Pepperoni and cheese',
        //   value: 'PepperoniCheese'
        // },

      };
      //add choices
      if (_.isArray(v) || _.isObject(v)) {
        console.log("Multiple values: " , optionValue);
        _.each(v, function (optionValue, optionKey) {
          console.log('*>>>>>>>' + optionKey + ':' + optionValue);
          var lowerCased = optionValue.hasOwnProperty('toLowerCase') ? optionValue.toLowerCase() : optionValue;
          baseQ.choices.push({
            key: lowerCased,
            name: optionValue,
            checked: defaultTruth
          })
        })
      } else {
        console.log("Single value: " , optionValue);
        var optionValue = v;
        var lowerCased = optionValue.hasOwnProperty('toLowerCase') ? optionValue.toLowerCase() : optionValue;
        baseQ.choices.push({
          key: lowerCased,
          name: optionValue,
          checked: defaultTruth
        })
      }

      // add this question to queue
      prompts.onNext(baseQ);
    });

    prompts.onCompleted();
  }





  prompts.onNext({
    type: 'confirm',
    name: 'quick',
    message: 'OK to allow '.white + name + ' access to the above? Y/n'.white,
    default: true
  });
  prompts.onNext({
    type: 'confirm',
    name: 'default',
    message: 'Default Permission Setting? Y/n'.white,
    default: true,
    when: function (answers) {
      return answers.quick === false
    }
  });
  // prompts.onCompleted(function (ans) {console.log(ans)});

}

module.exports = {
  checkPolicy: checkPolicy,
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
  lookupAppId: lookupAppId,
  configHelper: require('matrix-app-config-helper')
};
