var fs = require('fs');
var Table = require('cli-table');
var moment = require('moment');
var _ = require('lodash');
var installTimer;
var debug = debugLog('helpers');
var installTimeoutSeconds = 30; //seconds to get a install response from device

function saveConfig(cb) {
  fs.writeFile(__dirname + '/../store.json', JSON.stringify(Matrix.config), function (err) {
    if (err) console.error(t('matrix.helpers.config_save_error') + ': ', err);
    debug('Config Saved ==>', Matrix.config);
    if (_.isFunction(cb)) {
      cb();
    }
  });
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });

  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });

  wr.on("close", function(ex) {
    done();
  });
  
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

function updateFile(content, path, cb) {
  if (!_.isUndefined(content) && !_.isEmpty(content)) {
    //Backup current file
    copyFile(path, path + '.bk', function (err) {
      if (!err) { 
        fs.writeFile(path, JSON.stringify(content, null, 2), function (err) {
          if (err) {
            //TODO restore package.json?
            console.error('Unable to update package file!');
            process.exit();
          }
          debug('Package file updated ==>', content);
          if (_.isFunction(cb)) {
            cb();
          }
        });
      } else {
        throw 'Unable to backup package.json';
      }
    }); 
  } else {
    throw 'Invalid package.json content provided';
  }
}

function isDeviceOnline(deviceId, cb) {
  Matrix.firebase.device.getRuntime(function (err, runtime) {
    if (err) return cb(err);
    cb(null, runtime.online);
  })
}

// this will only work on a single device
function lookupAppId(name, cb) {
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

// just removes user
function removeConfig(cb) {
  debug('Removing User Information from Config')
  Matrix.config.user = {};
  Matrix.helpers.saveConfig(cb);
}

function lookupDeviceName(id) {
  var device = _.find(Matrix.config.deviceMap, {
    id: id
  });
  return (_.has(device, 'name')) ? device.name : undefined;
}

function getConfig() {
  var config;

  try {
    fs.statSync(__dirname + '/../store.json');
  } catch (e) {
    // no file yet
    debug(t('matrix.helpers.config_error'), e)
    fs.writeFileSync(__dirname + '/../store.json', JSON.stringify({
      user: {},
      device: {},
      client: {},
      locale: 'en',
      // NOTE: This sets default environment!
      environment: 'rc'
    }));
  }

  // does it JSON
  try {
    config = JSON.parse(fs.readFileSync(__dirname + '/../store.json'));
  } catch (e) {
    debug(t('matrix.helpers.config_parse_error'), e)
    fs.writeFileSync(__dirname + '/../store.json', '{}');
    return {
      user: {},
      device: {},
      locale: 'en',
      // NOTE: This sets default environment!
      environment: 'rc'
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
  if (_.isEmpty(apps)) return t('matrix.list.no_results').red;
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
  if (_.isEmpty(devices)) return t('matrix.list.no_results').red;

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

    table.push([app.name, app.shortName || '', version, app.description ||  '']);
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
    head: [t('matrix.helpers.device_apps.device').underline, t('matrix.helpers.device_apps.app_name').underline],
    colWidths: [30, 46 + ttyExtra]
  });

  _.each(deviceapps, function (device, deviceId) {
    if (_.keys(device.apps).length > 0) {

      if (_.keys(device.apps).length === 1) {

        var appId = _.keys(device.apps)[0];
        var app = device.apps[appId];
        table.push([deviceId, app.name]);

      } else {

        table.push([deviceId, '']);
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

function cleanPolicy(policy) { 
  _.each(policy, function(value, key){
    if (_.isEmpty(value) || _.isUndefined(value)){
      delete policy[key];
    }
  });
  return policy;
}

function patchVersion(version) { 
  if (!_.isUndefined(version) && typeof version == 'string') {
    var versionArray = version.split('.');
    if (versionArray.length == 3) {
      return versionArray[0] + '.' + versionArray[1] + '.' + (parseInt(versionArray[2])+1);
    } else {
      throw 'Invalid version format (' + version + ')';
    }
  } else {
    throw 'Invalid version parameter (' + version + ')';
  }
}

function allowAllPolicy(policy) { 
  var results = {};
  _.each(policy, function (item, cat) {
    results[cat] = {};
    _.each(item, function (value, key) {
      results[cat][key] = true;
    })
  })
  return results;
}

function checkPolicy(policy, name, cb) {

  var Rx = require('rx')
  var defaultTruth;
  var confirmed = {};
  var prompts = new Rx.Subject(); // need to inject results of answers into questions for decision trees
  var skip = false;
  policy = cleanPolicy(policy); // Clean policy object by removing empty objects

  console.log('==== ^^^^ GRANT ACCESS ???? ^^^^ ===='.blue)
  require('inquirer').prompt(prompts).ui.process.subscribe(function (ans) {

    //allowAll
    if (ans.name === 'quick' && ans.answer === true) {
      skip = true;
      confirmed = allowAllPolicy(policy);
      prompts.onCompleted();
    }

    //pickUsingDefault    
    if (ans.name === 'default' && !skip) {  
      defaultTruth = ans.answer;
      stepThroughConfig();
    }

    //pick    
    if (!_.isNull(ans.name.match(/sensors|integrations|events|services/)) && _.isArray(ans.answer)) {
      confirmed[ans.name] = {};
      _.each(ans.answer, function (answer) {
        confirmed[ans.name][answer] = true;
      })
    }
  }, function (e) { console.error(e) }, function () {
    return cb(null, confirmed);
  });

  function stepThroughConfig() {
    debug('Config to step trough: ', JSON.stringify(policy));
    _.forIn(policy, function (v, k) {
      if (!_.isEmpty(v)) {
         var baseQ = {
          type: 'checkbox',
          name: k,
          message: 'Grant access to '.white + k.grey + '?'.white,
          choices: [],
        };

        // Add choices
        if (_.isArray(v) || _.isObject(v)) {
          debug("Multiple values: " + k + " > " + JSON.stringify(v));
          _.each(v, function (optionValue, optionKey) {
            var lowerCased = optionKey.hasOwnProperty('toLowerCase') ? optionKey.toLowerCase() : optionKey;
            debug('*>>>>>>>' + optionKey + ':' + optionValue + ' d(' + defaultTruth + ') >> lc:' + lowerCased);
            baseQ.choices.push({
              key: lowerCased,
              name: lowerCased,
              checked: defaultTruth
            })
          })
        } else {
          debug("Single value: " + k + " > " + v);
          var lowerCased = k.hasOwnProperty('toLowerCase') ? k.toLowerCase() : k;
          debug('*>>>>>>>' + k + ':' + v + ' d(' + defaultTruth + ') >> lc:' + lowerCased);
          baseQ.choices.push({
            key: lowerCased,
            name: k,
            checked: defaultTruth
          })
        }
      } else {
        console.log('No value for ' + v)
      }
      prompts.onNext(baseQ); // add this question to queue
    });

    prompts.onCompleted();
  }

  prompts.onNext({
    type: 'confirm',
    name: 'quick',
    message: 'OK to allow '.white + name + ' access to the above?'.white,
    default: true
  });
  prompts.onNext({
    type: 'confirm',
    name: 'default',
    message: 'Default Permission Setting?'.white,
    default: true,
    when: function (answers) {
      return answers.quick === false
    }
  });
  // prompts.onCompleted(function (ans) {console.log(ans)});

}

function installSetup(appId, versionId, policy, callback) {

  debug("\nInstalling to device... ")

  var progress;
  Matrix.firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, appId, versionId, policy, {
    error: function (err) {
      if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
        console.error('\n' + t('matrix.install.app_install_error').red + ': ', err.details.error);
      } else {
        console.error('\n' + t('matrix.install.app_install_error').red + ': ', err);
      }
      process.exit(1);
    },
    finished: function () {

      debug('install finished');
      // Watch for the app on the user record
      Matrix.firebase.deviceapps.watchForNewApp(appId, function (app) {
        debug('new app>', app)
          var appInfo = app;
          if ( _.has(appInfo, 'runtime.status')){
            var status = app.runtime.status;
            debug('status>', status)
            if (status === 'error') {
              console.error(t('matrix.install.app_install_error'), ' ', app);
              process.exit(1);
            } else if ( status === 'inactive' ) {
              console.log(t('matrix.install.app_install_success').green);
              process.exit(0);
            } else if ( status === 'active'){
              console.log('App running already, not good.')
              process.exit(1);
            }
          }
      });

      console.log('\n' + t('matrix.install.waiting_for_device_install').green + '...'.green);
      installTimer = setTimeout(function () {
        console.log(t('matrix.install.device_install_timeout').yellow);
        process.exit(1);
      }, installTimeoutSeconds * 1000);
    },
    start: function(){
      debug('start install')
      _.once(function () {
        console.log(t('matrix.install.start') + '...')
      })
    },
    progress: function (msg) {
      if (_.isUndefined(msg)) msg = ''; else msg = ' ' + msg + ' ';
      if (!progress) {
        progress = true;
        process.stdout.write(t('matrix.install.progress') + ':' + msg);
      } else {
        process.stdout.write('.' + msg);
      }
    }
  });
  
}

/* Details: { id - appId, versionId - versionId} */

function installApp(details, callback) {
  //TODO validate details object contents. policy, name, id, versionId

  if (details.hasOwnProperty('skipPolicyCheck') && details.skipPolicyCheck === true) {
    var policy = allowAllPolicy(details.policy);
    installSetup(details.id, details.versionId, policy, callback);
  } else {
    checkPolicy(details.policy, details.name, function (err, policy) {
      console.warn('\n⇒ ' + t('matrix.install.installing_x_with_policy', { app: details.name.yellow }) + ':');
      debug(policy);
      _.each(policy, function (v, k) {
        console.log('\n', k + ':')
        _.each(v, function (val, key) {
          // passes
          if (val) {
            console.log(' ✅  ' + key.blue);
          } else {
            console.log(' ❌  ' + key.grey);
          }
        })
      });

      installSetup(details.id, details.versionId, policy, callback);
    }); 
  }
}

function logout(cb) {

  var keysToRemove = ['client', 'user', 'device', 'appMap', 'deviceMap'];
  Matrix.config = _.omit(Matrix.config, keysToRemove);
  saveConfig(function () {
    console.log(t('matrix.logout.logout_success').green);
    cb();
  });
}

module.exports = {
  allowAllPolicy: allowAllPolicy,
  checkPolicy: checkPolicy,
  configHelper: require('matrix-app-config-helper'),
  displayApps: displayApps,
  displayDeviceApps: displayDeviceApps,
  displayDevices: displayDevices,
  displayGroups: displayGroups,
  displayKeyValue: displayKeyValue,
  displaySearch: displaySearch,
  getConfig: getConfig,
  installApp: installApp,
  logout: logout,
  lookupAppId: lookupAppId,
  lookupDeviceName: lookupDeviceName,
  packageApp: packageApp,
  patchVersion: patchVersion,
  removeConfig: removeConfig,
  saveConfig: saveConfig,
  updateFile: updateFile
};
