var fs = require('fs');
var Table = require('cli-table2');
var moment = require('moment');
var _ = require('lodash');
var installTimer;
var JSHINT = require('jshint').JSHINT;
var debug = debugLog('helpers');
var request = require('request');
var installTimeoutSeconds = 30; //seconds to get a install response from device
var uploadEndpoint = 'v2/app/resources/uploadurl';
var appDetectFile = 'config.yaml';
var prompt = require('prompt');


var configFile = require('os').homedir() + '/.matrix/store.json';

function trackEvent(eventName, extras, cb) {

  debug('Track Event'.yellow, eventName, extras);

  // other form
  if (arguments.length === 2 && _.isFunction(extras)) { cb = extras; }

  // don't track if not ok
  if (!process.env.hasOwnProperty('TRACKOK')) {
    debug('No Tracking Allowed');
    if (_.isFunction(cb)) cb();
    return;
  }

  if (!_.has(Matrix.config, 'user.token') || !_.has(Matrix.config, 'user.id')) {
    return console.error('Tracking Error: No User Info')
  }


  var o = {
    e: eventName,
    uid: Matrix.config.user.id,
    t: Matrix.config.user.token
  };

  if (!_.isUndefined(extras) && !_.isFunction(extras)) {
    _.extend(o, extras)
  }

  request.post({
    url: 'http://keen-proxy.admobilize.com',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(o)
  }, function(e, r) {
    if (e) { debug('Telemetry Error:', e) }
    var created = false;
    try {
      JSON.parse(r.body).created
    } catch (err) {
      debug('Error parsing server response: ', r.body, '\n Error: \n', err);
    }
    if (created !== true) {
      debug('Telemetry Failure'.red)
    } else {
      debug('Telemetry OK'.green)
    }

    if (_.isFunction(cb)) { cb(); }
  });
}

function saveConfig(cb) {
  fs.writeFile(configFile, JSON.stringify(Matrix.config), function(err) {
    if (err) console.error(t('matrix.helpers.config_save_error') + ': ', err);
    // debug('Config Saved ==>', Matrix.config);
    if (_.isFunction(cb)) {
      cb();
    }
  });
}

function checkConfigWrite() {
  fs.openSync(configFile, 'w', function(err) {
    if (err) {
      console.error('Config File Not Writable');
      throw new Error(err);
    }
    debug('Config file:'.grey, 'ok'.green)
  })
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

function changeName(content, path, cb) {

  if (!_.isUndefined(content) && !_.isEmpty(content)) {

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
    throw 'Invalid package.json is  undefined';
  }
}


function updateFile(content, path, cb) {
  if (!_.isUndefined(content) && !_.isEmpty(content)) {
    //Backup current file
    copyFile(path, path + '.bk', function(err) {
      if (!err) {
        fs.writeFile(path, JSON.stringify(content, null, 2), function(err) {
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
      debug('Package file updated ==>', content);
      if (_.isFunction(cb)) {
        cb();
      }
    });
    } else {
      throw 'Unable to backup package.json';
  }

}

function isDeviceOnline(deviceId, cb) {
  Matrix.firebase.device.getRuntime(function(err, runtime) {
    if (err) return cb(err);
    cb(null, runtime.online);
  })
}

// this will only work on a single device
function lookupAppId(name, cb) {
  if (Matrix.config.hasOwnProperty('deviceMap') === true && Matrix.config.deviceMap.hasOwnProperty(Matrix.config.device.identifier)) {
    debug('Local app lookup: ');
    var device = Matrix.config.deviceMap[Matrix.config.device.identifier];
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
  debug('Removing User Information from Config')
  Matrix.config = {};
  Matrix.helpers.saveConfig(cb);
}

function lookupDeviceName(id) {
  if (_.has(Matrix.config.deviceMap, id)) {
    return Matrix.config.deviceMap[id].name;
  } else {
    return 'no device name'
  }
}

function refreshDeviceMap(cb) {
  Matrix.firebase.user.getAllApps(function(err, resp) {
    // debug('deviceMap>', resp);

    // save for later
    Matrix.config.deviceMap = resp;

    Matrix.helpers.saveConfig(cb);
  })
}

function getConfig() {
  var config;

  // check directory
  try {
    fs.statSync(require('os').homedir() + '/.matrix');
  } catch (e) {
    console.log('Creating ~/.matrix directory for configuration file.');
    fs.mkdirSync(require('os').homedir() + '/.matrix')
  }

  // check the file
  try {
    fs.statSync(configFile)
  } catch (e) {
    console.log('Configuration file does not exist yet. Initializing....')
    fs.writeFileSync(configFile, JSON.stringify({
      user: {},
      device: {},
      client: {},
      locale: 'en',
      // NOTE: This sets default environment!
      environment: 'rc'
    }));
  }


  // does it JSON - read config file
  try {
    config = JSON.parse(fs.readFileSync(configFile));
  } catch (e) {
    debug(t('matrix.helpers.config_parse_error'), e)
    fs.writeFileSync(configFile, '{}');
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

  _.forEach(el, function(item, i) {
    table.push([i, item]);
  });
  return table.toString();
}

function displayApps(apps) {
  if (_.isEmpty(apps)) return t('matrix.list.no_results').red;
  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: ['Name'.underline, 'v'.underline, 'Description'.underline, 'Status'.underline],
    colWidths: [27, 7, 36 + ttyExtra, 10]
  });

  _.forEach(apps, function(item) {
    table.push([item.name, item.version || '', item.description || '', item.status || ''])
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
 * @param  {boolean}  devices[$id].description  Description of device
 * @param  {int}      devices[$id].lastSeen     Timestamp
 * @param  {array}    devices[$id].defaultApps  Starts these apps automatically
 * @return {string}   table
 */

function displayDevices(devices) {
  if (_.isEmpty(devices)) return t('matrix.list.no_results').red;

  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.devices.device_id').underline, t('matrix.helpers.devices.name').underline,
      t('matrix.helpers.devices.description').underline, t('matrix.helpers.devices.ok').underline, t('matrix.helpers.devices.last_online').underline
    ],
    colWidths: [20, 20, 25 + ttyExtra, 4, 15]
  });

  //transform


  _.forEach(devices, function(device, deviceId) {

    var currentDevice = Matrix.validate.isCurrentDevice(deviceId);

    //Set values
    var deviceToShow = {
      id: deviceId,
      name: device.name || '',
      description: device.description || '',
      status: device.online ? 'ok' : 'no',
      time: device.lastSeentime === 0 ? '-' : moment.unix(device.lastSeen, "YYYYMMDD").fromNow()
    };

    //Color
    if (currentDevice) {
      deviceToShow.id = deviceToShow.id.green;
      deviceToShow.name = deviceToShow.name.green;
      deviceToShow.description = deviceToShow.description.green;
      deviceToShow.status = device.online ? deviceToShow.status.cyan : deviceToShow.status.yellow;
      deviceToShow.time = deviceToShow.time.green;
    } else {
      deviceToShow.status = device.online ? deviceToShow.status.green : deviceToShow.status.red;
    }

    table.push([deviceToShow.id, deviceToShow.name, deviceToShow.description, deviceToShow.status, deviceToShow.time]);

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

  _.forEach(items.results, function(item, i) {
    table.push([item.name, _.size(item.device), item.id]);
  });

  return table.toString();
}

function displaySearch(raw, needle) {

  var table = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [t('matrix.helpers.search.name').underline, t('matrix.helpers.search.short_name').underline, t('matrix.helpers.search.latest').underline, t('matrix.helpers.search.description').underline],
    colWidths: [26, 26, 14, 20 + ttyExtra]
  });

  _.each(_.values(raw), function(app) {
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

    table.push([app.name, app.shortName || '', version, app.description ||  '']);
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

  _.each(deviceapps, function(device, deviceId) {
    if (_.keys(device.apps).length > 0) {

      if (_.keys(device.apps).length === 1) {

        var appId = _.keys(device.apps)[0];
        var app = device.apps[appId];
        table.push([deviceId, app.name]);

      } else {

        table.push([deviceId, '']);
        _.each(device.apps, function(app, appId, i) {

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
  _.each(policy, function(value, key) {
    if (_.isEmpty(value) || _.isUndefined(value)) {
      delete policy[key];
    }
  });
  return policy;
}

function patchVersion(version) {
  if (!_.isUndefined(version) && typeof version == 'string') {
    var versionArray = version.split('.');
    if (versionArray.length == 3) {
      return versionArray[0] + '.' + versionArray[1] + '.' + (parseInt(versionArray[2]) + 1);
    } else {
      throw 'Invalid version format (' + version + ')';
    }
  } else {
    throw 'Invalid version parameter (' + version + ')';
  }
}

function allowAllPolicy(policy) {
  var results = {};
  _.each(policy, function(item, cat) {
    results[cat] = {};
    _.each(item, function(value, key) {
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
  if (_.isUndefined(policy)) {
    cb(null, {});
  } else {
    Matrix.loader.stop(); 
    console.log(require('util').inspect(policy, { depth: null, colors: true })); //Print the policy to accept
    console.log('==== ^^^^ GRANT ACCESS ???? ^^^^ ===='.blue);
    require('inquirer').prompt(prompts).ui.process.subscribe(function(ans) {

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
        _.each(ans.answer, function(answer) {
          confirmed[ans.name][answer] = true;
        })
      }
    }, function(e) { console.error(e) }, function() {
      return cb(null, confirmed);
    });

    function stepThroughConfig() {
      debug('Config to step trough: ', JSON.stringify(policy));
      _.forIn(policy, function(v, k) {
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
            _.each(v, function(optionValue, optionKey) {
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
      when: function(answers) {
        return answers.quick === false
      }
    });
  }
}

function installSetup(appId, versionId, policy, callback) {

  debug("\nInstalling to device... ")

  var progress;
  Matrix.loader.start();
  Matrix.firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, appId, versionId, policy, {
    error: function(err) {
      Matrix.loader.stop();
      if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
        console.error('\n' + t('matrix.install.app_install_error').red + ': ', err.details.error);
      } else {
        console.error('\n' + t('matrix.install.app_install_error').red + ': ', err);
      }
      process.exit(1);
    },
    finished: function() {
      debug('install finished');
      // Watch for the app on the user record
      Matrix.firebase.deviceapps.watchForNewApp(appId, function(app) {
        debug('new app>', app)
        if (_.has(app, 'runtime.status') && app.runtime.status != 'pending') {
          var error;
          Matrix.loader.stop();
          var status = app.runtime.status;
          debug('status>', status)
          clearTimeout(installTimer);
          if (status === 'error') {
            error = new Error(t('matrix.install.app_install_error'), ' ', app);
          } else if (status === 'inactive') {
            //good
          } else if (status === 'active') {
            error = new Error('App running already, not good.');
          } else {
            error = new Error('Unknown status ' + status);
          }
          callback(error);
        }
      });
      Matrix.loader.stop();
      console.log('\n' + t('matrix.install.waiting_for_device_install').green + '...'.green);
      Matrix.loader.start();
      installTimer = setTimeout(function() {
        Matrix.loader.stop();
        console.log(t('matrix.install.device_install_timeout').yellow);
        process.exit(1);
      }, installTimeoutSeconds * 1000);
    },
    start: function() {
      debug('start install')
      _.once(function() {
        Matrix.loader.stop();
        console.log(t('matrix.install.start') + '...')
        Matrix.loader.start();
      })
    },
    progress: function(msg) {
      if (_.isUndefined(msg)) msg = '';
      else msg = ' ' + msg + ' ';
      if (!progress) {
        progress = true;
        Matrix.loader.stop();
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
    checkPolicy(details.policy, details.name, function(err, policy) {
      console.warn('\n⇒ ' + t('matrix.install.installing_x_with_policy', { app: details.name.yellow }) + ':');
      debug(policy);
      _.each(policy, function(v, k) {
        console.log('\n', k + ':')
        _.each(v, function(val, key) {
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

function login(userOptions, cb) {
  /** set the creds **/
  Matrix.config.user = {
    username: userOptions.username,
    password: userOptions.password
  };

  Matrix.config.user.jwt_token = true;

  // configure monitoring 
  if (_.has(userOptions, 'trackOk')) {
    if (_.isBoolean(userOptions.trackOk)) userOptions.trackOk = userOptions.trackOk;
    else userOptions.trackOk = (userOptions.trackOk.toLowerCase() === 'y') ? true : false;
  }

  /** set the client to empty **/
  Matrix.config.client = {};

  /** authenticate client and user **/
  debug('Client', Matrix.options);
  Matrix.api.auth.client(Matrix.options, function(err, out) {
    if (err) {
      Matrix.loader.stop();
      debug('Client auth error: ', err);
      console.log('Matrix CLI :'.grey, t('matrix.login.user_auth_error').yellow + ':'.yellow, err.message.red);
      callback(err);
    }
    debug('User', Matrix.config.user, out);
    Matrix.api.auth.user(Matrix.config.user, function(err, state) {
      if (err) {
        Matrix.loader.stop();
        debug('User auth error: ', err);
        console.log('Matrix CLI :'.grey, t('matrix.login.user_auth_error').yellow + ':'.yellow, err.message.red);
        callback(err);
      }
      debug('User Login OK', state);
      Matrix.config.user.token = state.access_token;
      Matrix.config.user.id = state.id;
      Matrix.config.user.trackOk = userOptions.trackOk;

      if (userOptions.trackOk === true) {
        process.env.TRACKOK = true;
        //TODO Event is not tracked if the token expired, maybe add another event for successful login?
        Matrix.helpers.trackEvent('user-login');
      }

      /** token stores, delete extra stuff **/
      // delete Matrix.config.user.username;
      delete Matrix.config.user.password;

      // download apps and devices belonging to user
      // from `users` in firebase
      Matrix.firebaseInit(function() {

        if (Matrix.config.user.trackOk) {
          Matrix.firebase.user.allowTracking();
        } else {
          Matrix.firebase.user.denyTracking();
        }

        Matrix.helpers.refreshDeviceMap(function() {
          /** save the creds if it's good **/
          Matrix.loader.stop();
          console.log(t('matrix.login.login_success').green, ':'.grey, userOptions.username);

          //Verify if the user has a device to be used
          if (Matrix.config.keepDevice && _.has(Matrix.config.keepDevice, Matrix.config.user.id)) {
            //Get the device name
            var deviceName = Matrix.config.keepDevice[Matrix.config.user.id].name;
            //Get the device token
            Matrix.api.device.register(Matrix.config.keepDevice[Matrix.config.user.id].identifier, function(err, state) {
              if (err) return console.log(err);
              //Verify if the devices status is OK.
              if (state.status === "OK") {
                //Save the device token And Put the device into use
                Matrix.config.device = {}
                Matrix.config.device.identifier = Matrix.config.keepDevice[Matrix.config.user.id].identifier;
                Matrix.config.device.token = state.results.device_token;
              }
              //Clear the object for keep device after session expired
              delete Matrix.config.keepDevice[Matrix.config.user.id];
              if (Object.keys(Matrix.config.keepDevice).length === 0) {
                Matrix.config = _.omit(Matrix.config, ['keepDevice']);
              }
              //Save config
              Matrix.helpers.saveConfig(function() {
                if (Matrix.config.device) {
                  console.log('Using device:'.grey, deviceName, 'ID:'.grey, Matrix.config.device.identifier);
                }
                cb();
              });
            });
          } else {
            cb();
          }
        });
      });
    });
  });
}

function logout(cb) {

  var keysToRemove = ['client', 'user', 'device', 'deviceMap'];
  Matrix.config = _.omit(Matrix.config, keysToRemove);
  saveConfig(function() {
    if (_.isFunction(cb)) {
      cb();
    }
  });
}

function checkAppFolder(path, cb) {
  var readmeFileName = 'README.MD';
  var err;
  var results = {};
  debug("Checking app folder...");
  //Make sure config file exists
  if (!fs.existsSync(path + '/' + appDetectFile)) {
    Matrix.loader.stop();
    console.error(t('matrix.deploy.app_not_found', { detect_file: appDetectFile, pwd: path }));
    process.exit(1);
  }

  var files = fs.readdirSync(path);
  _.each(files, function(f) {
    if (f == readmeFileName) results.readme = true;
    //var s = fs.statSync(path + f);
    debug('Processed %s!', f);
  });

  cb(err, results);
}

function checkAppCode(path, cb) {
  debug("Checking app code...");
  var appFile = fs.readFileSync(path + '/app.js').toString();

  // run JSHINT on the application
  JSHINT(appFile);
  if (JSHINT.errors.length > 0) {
    Matrix.loader.stop();
    console.log(t('matrix.deploy.cancel_deploy').red)
    _.each(JSHINT.errors, function(e) {
      if (_.isNull(e)) {
        return;
      }
      var a = [];
      if (e.hasOwnProperty('evidence')) {
        a[e.character - 1] = '^';
        // regular error
      }
      e.evidence = e.evidence || '';
      console.log('\n' + '(error)'.red, e.raw, '[app.js]', e.line + ':' + e.character, '\n' + e.evidence.grey, '\n' + a.join(' ').grey);
    });
    cb(new Error('JSHINT found ' + JSHINT.errors.length + ' errors!'));
  } else {
    cb();
  }
}

/**
 * @description Retrieve the resumable upload url from the API
 * @param fileName Filename to use for the download (Sent as version to the API)
 * @param appName Upload URL
 * @param type Specify the Content-Type that will be set (zip, text)
 * @param cb Callback
 */
function getUploadUrl(fileName, appName, type, cb) {

  debug("Retreiving upload url");
  var url = Matrix.config.environment.api + '/' + uploadEndpoint +
    '?access_token=' + Matrix.config.user.token +
    '&appName=' + appName +
    '&version=' + fileName +
    '&type=' + type;

  debug('get', url);
  request.get(url, function(error, response, body) { //Get the upload URL
    var resultUrl;
    if (error) {
      Matrix.loader.stop();
      error = new Error("Error getting the upload URL: ", error);
    } else if (response.statusCode !== 200) {
      Matrix.loader.stop();
      if (response.statusCode == 401) {
        console.log('Invalid user or expired token, please login again'.yellow);

        return Matrix.helpers.logout(function() {
          process.exit();
        });
      } else {
        error = new Error("Error getting the upload URL (" + response.statusCode + ") " + response.status);
      }
    } else if (!body || body === "") {
      error = new Error("Error processing the upload URL request " + response.status);
    } else {
      if (!body.hasOwnProperty('status')) {
        body = JSON.parse(body);
      }
      if (!body.hasOwnProperty(error) && body.hasOwnProperty('status') &&
        body.status == 'OK' && body.hasOwnProperty('results') &&
        body.results.hasOwnProperty('uploadurl')) {
        resultUrl = body.results.uploadurl;
      } else {
        error = new Error(t('matrix.deploy.app_install_failed').red, body);
      }
    }
    return cb(error, resultUrl);
  });
};

/**
 * @description Method used with GCS resumable uploads
 * @param path Location of the file to upload
 * @param uploadUrl Upload URL
 * @param cb Callback
 */
function uploadPackage(path, uploadUrl, cb) {
  debug('Uploading to ', uploadUrl);
  var stream = fs.createReadStream(path).pipe(request.put(uploadUrl))
    .on('error', function(err) {
      Matrix.loader.stop();
      return cb(new Error('Error uploading file (' + path + '): \n', err));
    })
    .on('response', function(response) {
      debug('Upload response (' + response.statusCode + ')');
      if (response.statusCode == 200) {
        return cb(null);
      } else {
        return cb(new Error("Error uploading file"));
      }
    });
  stream.on('error', function(err) {
    return cb(new Error('Error reading file (' + path + '): \n', err));
  });
};

/**
 * Makes sure the config param is an array, otherwise returns an appropriate array. Defaults to ['Development']
 * Trims and forces startCase for each element
 */
function formParamArray(configObject, param) {
  var resultArray;
  if (_.has(configObject, param) && !_.isUndefined(configObject[param])) {
    if (_.isArray(configObject[param])) {
      resultArray = configObject[param];
    } else {
      resultArray = configObject[param].split(',');
    }

    for (var key in resultArray) {
      resultArray[key] = _.startCase(resultArray[key].trim()); //Trim and startCase
    }
    resultArray = resultArray.filter(function(val, key) {
      return (
        resultArray.indexOf(val) == key && //Remove duplicates
        (val === 0 || val) //Remove empty elements  
      );
    });

  } else {
    resultArray = ['Development'];
  }
  return resultArray;
}

//Gets the config, policy and forms app object
function collectAppData(name, path, cb) {
  debug("Collecting app data...");

  var configFile = fs.readFileSync(path + appDetectFile).toString();
  if (configFile.hasOwnProperty('icon')) {
    //TODO Upload icon?
  }

  var config;
  try {
    config = yaml.safeLoad(fs.readFileSync(path + appDetectFile));
  } catch (err) {
    Matrix.loader.stop();
    return cb(err);
  }
  debug('included config', config);
  Matrix.loader.stop();
  var policy = Matrix.helpers.configHelper.config.parsePolicyFromConfig(config);
  Matrix.loader.start();

  var policyObject = Matrix.helpers.allowAllPolicy(policy); //Allow all in policy
  debug('Policy:>', policyObject);

  var keywords = formParamArray(config, 'keywords');

  if (_.isUndefined(config.categories)) {
    config.categories = 'Development';
  }
  var packageContent, appDetails; 
  try {
    packageContent = require(path + '/' + 'package.json');
    debug('App package.json:' + JSON.stringify(packageContent));
    appDetails = {
      name: name,
      version: packageContent.version || '1.0.0',
      description: config.description || '',
      categories: config.categories || 'Development',
      keywords: keywords,
      shortname: config.shortname || name.toLowerCase().replace(" ", "_"),
      displayName: config.displayName || name,
      policy: policyObject,
      config: config
    }
    debug('Package.json data extracted: ', appDetails);
    cb(null, appDetails);
  } catch (err) {
    Matrix.loader.stop();
    console.error('App config error'.yellow,err);

    return cb(err);
  }
}

/**
 * @description Creates a zip file with the contents of an app folder
 * @param source Path of folder to zip
 * @param destination Path of the file to be created
 */
function zipAppFolder(source, destination, cb) {
  console.log(t('matrix.deploy.reading') + ' ', source);
  console.log(t('matrix.deploy.writing') + ' ', destination);
  Matrix.loader.start();
  var destinationZip = fs.createWriteStream(destination);
  var archiver = require('archiver');
  var zip = archiver.create('zip', {});
  var files = fs.readdirSync(source);
  debug('Zipping app in ' + source);
  destinationZip.on('open', function() {
    debug('Zip start')
  });

  destinationZip.on('error', function(err) {
    Matrix.loader.stop();
    debug('Output zip err:', err);
    cb(new Error('Error zipping the app to ' + destination));
  });

  destinationZip.on('finish', function() {
    debug('Zip finish');
    cb();
  });

  _.each(files, function(file) {
    //TODO need to properly validate filenames
    if (_.isEmpty(file) || _.isUndefined(file) || file == ':') {
      Matrix.loader.stop();
      console.warn('Skipping invalid file: '.red, file);
      Matrix.loader.start();
    } else {
      if (fs.lstatSync(source + file).isDirectory()) {
        debug('Appending folder ' + file);
        zip.directory(source + file, file, { date: new Date() });
      } else {
        debug('Appending ' + file);
        zip.append(fs.createReadStream(source + file), {
          name: file
        });
      }
    }
  });

  zip.on('error', function(err) {
    Matrix.loader.stop();
    console.error(t('matrix.deploy.error') + ':', err)
    process.exit(1);
  });

  zip.finalize();
  zip.pipe(destinationZip); // send zip to the file
}

var profile = {
  show: function(profile, callback) {
    var err;
    Matrix.loader.stop();
    if (_.isUndefined(profile)) { //If no data
      console.log(t('matrix.account.no_profile'));
      callback();
    } else {
      console.log('Name: '.yellow, profile.name);
      console.log('URL: '.yellow, profile.url);
      console.log('GitHub User: '.yellow, profile.githubUser);
      console.log('Usage statistics: '.yellow, profile.trackOk ? 'Enabled'.green : 'Disabled'.yellow);
      callback();
    }
  },
  prompt: function(currentData, callback) {
    if (_.isUndefined(callback) && _.isFunction(currentData)) {
      callback = currentData;
      currentData = {};
    }
    var nameP = {
      name: 'name',
      description: 'Name',
      required: true,
      default: currentData.name ||  ''
    };

    var urlP = {
      name: 'url',
      pattern: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      message: 'Must provide a valid url',
      description: 'URL (Optional)',
      default: currentData.url ||  ''
    }

    var repoP = {
      name: 'githubUser',
      description: 'GitHub User (Optional)',
      default: currentData.githubUser ||  ''
    }

    var trackP = {
      name: 'trackOk',
      description: "Share usage information? (Y/n)",
      default: currentData.trackOk === true ? 'y' : 'n',
      pattern: /y|n|yes|no|Y|N/,
      message: "Please answer y or n."
    }

    var toPrompt = [
      nameP, urlP, repoP, trackP
    ];

    prompt.delimiter = '';
    prompt.message = 'User -- ';

    prompt.start();
    Matrix.loader.stop();
    prompt.get(toPrompt, function(err, results) {

      if (err) {
        if (err.toString().indexOf('canceled') > 0) {
          console.log('');
          process.exit();
        } else {
          console.log("Error: ", err);
          process.exit();
        }
      }

      if (results.trackOk.toLowerCase() === 'y' || results.trackOk.toLowerCase() === 'yes') {
        results.trackOk = true;
      } else {
        results.trackOk = false;
      }

      callback(err, results);

    });
  },
  get: function(callback) {
    Matrix.firebase.user.get(function(err, userProfile) {
      callback(err, userProfile);
    });
  },
  update: function(profile, callback) {
    var updateError;
    var events = {
      error: function(err) {
        Matrix.loader.stop();
        updateError = new Error('Error updating user profile: '.red, err.message);
        callback(updateError);
      },
      finished: function() {
        Matrix.loader.stop();
        console.log('User profile updated successfully');
        callback(updateError);
      },
      start: function() {
        Matrix.loader.stop();
        console.log('User profile update requested...');
        Matrix.loader.start();
      },
      progress: function() {
        Matrix.loader.stop();
        console.log('Updating...');
        Matrix.loader.start();
      }
    };

    profile = {
      data: profile
    }

    Matrix.firebase.user.update(profile, events);
  }
}

module.exports = {
  allowAllPolicy: allowAllPolicy,
  checkAppFolder: checkAppFolder,
  checkAppCode: checkAppCode,
  checkPolicy: checkPolicy,
  collectAppData: collectAppData,
  configHelper: require('matrix-app-config-helper'),
  displayApps: displayApps,
  displayDeviceApps: displayDeviceApps,
  displayDevices: displayDevices,
  displayGroups: displayGroups,
  displayKeyValue: displayKeyValue,
  displaySearch: displaySearch,
  getConfig: getConfig,
  getUploadUrl: getUploadUrl,
  installApp: installApp,
  login: login,
  logout: logout,
  lookupAppId: lookupAppId,
  lookupDeviceName: lookupDeviceName,
  packageApp: packageApp,
  patchVersion: patchVersion,
  profile: profile,
  removeConfig: removeConfig,
  saveConfig: saveConfig,
  updateFile: updateFile,
  changeName:changeName,
  uploadPackage: uploadPackage,
  zipAppFolder: zipAppFolder,
  refreshDeviceMap: refreshDeviceMap,
  trackEvent: trackEvent
};