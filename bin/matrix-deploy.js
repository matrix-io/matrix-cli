#!/usr/bin/env node

var async = require('async');
var deploymentFinished = false;
var workerTimeoutSeconds = 30;
var deviceTimeoutSeconds = 30;

var debug, fileUrl, appName, pwd;
var destinationFilePath, downloadFileName; 

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('deploy');
    fileUrl = 'https://storage.googleapis.com/' + Matrix.config.environment.appsBucket + '/apps'; // /<AppName>/<version>.zip
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);

    appName = Matrix.pkgs[0];
    pwd = process.cwd();
  },
  Matrix.validate.userAsync,
  // user register does fb init for login, bad if we do that 2x
  function (cb) { Matrix.firebaseInit(cb) },
  function (cb) {
    // group flow
    if (!_.isUndefined(Matrix.config.group)) {
      async.waterfall([
        Matrix.validate.groupAsync,
        getAppDetails,
        validateConfig,
        function (appDetails, done) {
          async.each(Matrix.config.group.devices, (device, callback) => {
            runDeploy(device.identifier, appDetails, callback);
          }, (err) => {
            if (err) return done(err);
            return done(null);
          });
        }
      ], function(err) {
        if (err) return cb(err);
        else return cb(null);
      });
    }
    // single device flow
    else {
      async.waterfall([
        Matrix.validate.deviceAsync,
        getAppDetails,
        validateConfig,
        function (appDetails, done) {
          runDeploy(Matrix.config.device.identifier, appDetails, done); 
        }
      ], function(err) {
        if (err) return cb(err);
        else return cb(null);
      });
    }
  },
], function (err) {
  Matrix.loader.stop();
  if (err) {
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  return process.exit();
});

function getAppDetails(cb) {
  if (Matrix.pkgs.indexOf('--help') > -1 || Matrix.pkgs.indexOf('-h') > -1) {
    return displayHelp();
  }

  if (_.isUndefined(appName)) {
    // infer name from current directory + strip out suffix jic
    appName = require('path').basename(pwd).replace('.matrix', '');
    // step out one level so we can target this dir
    pwd += '/';
  } else {
    pwd += '/' + appName + '/';
  }

  destinationFilePath = require('os').homedir() + '/.matrix/' + appName + '.zip';

  async.parallel({
    folder: async.apply(Matrix.helpers.checkAppFolder, pwd),
    code: async.apply(Matrix.helpers.checkAppCode, pwd),
    data: async.apply(Matrix.helpers.collectAppData, appName, pwd)
  },
  function (err, results) {
    if (!err && !_.isUndefined(results.data)) {
      var appDetails = results.data;
      debug('Using app details: ' + JSON.stringify(appDetails));

      Matrix.helpers.zipAppFolder(pwd, destinationFilePath, function (err) {
        if (err) {
          Matrix.loader.stop();
          return cb(new Error('Error zipping app folder: ' + err.message.red));
        } else {
          return cb(null, appDetails);
        }
      });
    } else {
      Matrix.loader.stop();
      return cb(err);
    }
  });
}

function validateConfig(details, cb) {

  debug('Finished packaging ', appName);
  downloadFileName = Matrix.config.user.id + '/' + appName.toLowerCase() + '-' + Math.round(Math.random() * Math.pow(10, 8)) + '.zip';
  details.file = fileUrl + '/' + appName + '/' + downloadFileName;
  var configOk = true;
  Matrix.loader.stop();
  console.log('Validating configuration file...');
  try {
    configOk = Matrix.validate.config(details.config);
  } catch (e) {
    console.error(e);
    return cb(new Error('Configuration Invalid. Please make sure the config.yaml file is properly formatted and try again'.yellow));
  }

  if (!configOk) {
    return cb(new Error('Configuration Invalid. Please make sure the config.yaml is properly formatted and try again'.red));
  }

  console.log('Successfully validated configuration file');

  Matrix.helpers.getUploadUrl(downloadFileName, appName, 'zip', function (err, uploadUrl) {
    if (err) return cb(err);
    Matrix.helpers.uploadPackage(destinationFilePath, uploadUrl, function (err) {
      if (err) return cb(err);
      return cb(null, details);
    });
  });
}

function runDeploy(deviceId, details, cb) {
  Matrix.helpers.trackEvent('app-deploy', { aid: appName, did: deviceId });

  var err;
  var deviceName = Matrix.helpers.lookupDeviceName(deviceId);
  var appData = Matrix.helpers.formAppData(details);
  appData.override = true; //If true the appstore won't check for uniqueness

  var deployedAppId, workerTimeout, deviceTimeout;
  var nowInstalling = false;
  var didTimeout = false;
  //Listen for the app installation in device (appId from users>devices>apps)
  Matrix.firebase.app.watchNamedUserApp(deviceId, appName, function (app, appId) {
    debug('App install ' + appId + ' activity');
    if (!_.isUndefined(appId) && _.isUndefined(deployedAppId)) {
      debug('App id ' + appId + ' identified');
      deployedAppId = appId;
      //Listen for the status change (deviceapps)
      Matrix.firebase.app.watchStatus(deviceId, deployedAppId, function (status) {
        debug('App deployed with status > ' + status);
        if (status === 'error') {
          err = new Error(deviceName.green+': '+t('matrix.install.app_install_error').red, ' ', app);
          console.log(err.message);
          return cb(null);
          //It must first go through the pending state (nowInstalling) and then back to inactive
        } else if (nowInstalling && status === 'inactive') {
          clearTimeout(deviceTimeout);
          var deploymentTimer = setInterval(function () {
            if (deploymentFinished) {
              clearTimeout(deploymentTimer);
              console.log(deviceName.green+': '+'Application ' + appName.green + ' was successfully installed!');
              console.log(deviceName.green+': '+t('matrix.install.app_install_success').green);
              // clear out zip file
              // require('child_process').execSync('rm ' + destinationFilePath);
              // debug( destinationFilePath, 'removed');
              if (!didTimeout)
                return cb(null);
            }
          }, 400);
        } else if (status === 'active') {
          err = new Error(deviceName.green+': '+'App running already, will attempt restart'.red);
          console.log(err.message);
          return cb(null);
        } else if (status === 'pending') {
          nowInstalling = true
          console.log(deviceName.green+': '+'Installing ' + appName + ' on device...');
        }
      });
    }
  });

  //Start timeout in case the workers aren't up'
  workerTimeout = setTimeout(function () {
    err = new Error('Server response timeout, please try again later'.yellow);
    console.log(err.message);
    return cb(null);
  }, workerTimeoutSeconds * 1000);

  //Send the app deployment request
  var options = {
    deviceId: deviceId,
    appData: appData,
    userId: Matrix.config.user.id
  };

  Matrix.firebase.app.deploy(options, {
    error: function (err) {
      clearTimeout(workerTimeout);
      if (err.hasOwnProperty('details')) {
        err = new Error('App deployment failed: '.red, err.details.error);
      } else {
        err = new Error('App deployment failed: '.red, err.message);
      }
      console.log(err.message);
      return cb(null);
    },
    finished: function () {
      clearTimeout(workerTimeout);
      console.log(deviceName.green+': '+'Deploying to device...');
      //Start timeout in case the workers aren't up'
      deviceTimeout = setTimeout(function () {
        console.log(deviceName.green+': '+t('matrix.install.device_install_timeout').yellow);
        didTimeout = true;
        return cb(null);
      }, deviceTimeoutSeconds * 1000);
      deploymentFinished = true;
    },
    start: function () {
      console.log(deviceName.green+': '+'Requesting deploy...');
    },
    progress: function () {
      console.log(deviceName.green+': '+'Processing deployment parameters...');
    }
  });
}

function displayHelp() {
  console.log('\n> matrix deploy ¬\n');
  console.log('\t    matrix deploy <app> -', t('matrix.deploy.help', { app: '<app>' }).grey)
  console.log('\n')
  return process.exit(1);
}