#!/usr/bin/env node

var async = require('async');
var deploymentFinished = false;
var workerTimeoutSeconds = 30;
var deviceTimeoutSeconds = 80;

var debug, fileUrl;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('deploy');
    fileUrl = 'https://storage.googleapis.com/' + Matrix.config.environment.appsBucket + '/apps'; // /<AppName>/<version>.zip
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  Matrix.validate.deviceAsync,
  // user register does fb init for login, bad if we do that 2x
  function (cb) {
    Matrix.firebaseInit(cb)
  }
], function (err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  if (showTheHelp) return displayHelp();

  var appName = Matrix.pkgs[0];
  var pwd = process.cwd();

  if (_.isUndefined(appName)) {
    // infer name from current directory + strip out suffix jic
    appName = require('path').basename(pwd).replace('.matrix', '');
    // step out one level so we can target this dir
    pwd += '/';
  } else {
    pwd += '/' + appName + '/';
  }

  var destinationFilePath = require('os').homedir() + '/.matrix/' + appName + '.zip';

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
            console.error('Error zipping app folder: ' + err.message.red);
            process.exit();
          } else {
            onEnd(appDetails);
          }
        });

      } else {
        Matrix.loader.stop();
        console.error(err.message.red);
      }
    });

  function onEnd(details) {

    async.each(Matrix.config.devices, (device, cb) => {
      Matrix.helpers.trackEvent('app-deploy', { aid: appName, did: device.identifier }, cb);
    }, (err) => {});

    debug('Finished packaging ', appName);
    var downloadFileName = Matrix.config.user.id + '/' + appName.toLowerCase() + '-' + Math.round(Math.random() * Math.pow(10, 8)) + '.zip';
    details.file = fileUrl + '/' + appName + '/' + downloadFileName;
    var configOk = true;
    Matrix.loader.stop();
    console.log('Validating configuration file...');
    try {
      configOk = Matrix.validate.config(details.config);
    } catch (e) {
      console.error(e);
      console.log('Configuration Invalid. Please make sure the config.yaml file is properly formatted and try again'.yellow);
      process.exit();
    }

    if (!configOk) {
      console.log('Configuration Invalid. Please make sure the config.yaml is properly formatted and try again'.red);
      process.exit();
    }
    console.log('Successfully validated configuration file');
    Matrix.loader.start();

    var installedCounter = 0;

    Matrix.helpers.getUploadUrl(downloadFileName, appName, 'zip', function (err, uploadUrl) {
      if (!err) {
        Matrix.helpers.uploadPackage(destinationFilePath, uploadUrl, function (err) {

          var appData = Matrix.helpers.formAppData(details);
          appData.override = true; //If true the appstore won't check for uniqueness

          var workersTimeout, deviceTimeout, deploymentFinished, didTimeout, nowInstalling;
          deviceTimeout = {};
          didTimeout = {};
          deploymentFinished = {}
          workersTimeout = {}
          nowInstalling = {};
          //Listen for the app installation in each device (appId from users>devices>apps)
          async.each(Matrix.config.devices, (device, callback) => {
            var deviceId = device.identifier;            
            var deviceName = Matrix.helpers.lookupDeviceName(deviceId);
            var deployedAppId;
            nowInstalling[deviceId] = false;
            didTimeout[deviceId] = false;
            deploymentFinished[deviceId] = false;
            Matrix.firebase.app.watchNamedUserApp(deviceId, appName, function (app, appId) {
              debug('App install ' + appId + ' activity at device '+ deviceId);
              if (!_.isUndefined(appId) && _.isUndefined(deployedAppId)) {
                debug('App id ' + appId + ' identified');
                deployedAppId = appId;
                //Listen for the status change (deviceapps)
                Matrix.firebase.app.watchStatus(deviceId, deployedAppId, function (status) {
                  debug('App deployed with status > ' + status + ' at device '+deviceName.green);
                  Matrix.loader.stop();
                  if (status === 'error') {
                    console.error(t('matrix.install.app_install_error'), ' ', app, ' ', deviceName);
                    return callback(null);
                    //It must first go through the pending state (nowInstalling) and then back to inactive
                  } else if (nowInstalling[deviceId] && status === 'inactive') {
                    clearTimeout(deviceTimeout[deviceId]);
                    var deploymentTimer = setInterval(function () {
                      if (deploymentFinished[deviceId]) {
                        clearTimeout(deploymentTimer);
                        installedCounter++;
                        console.log(deviceName.green + ': Application ' + appName.green + ' was successfully installed!');
                        console.log(deviceName.green+': '+t('matrix.install.app_install_success').green+" ("+installedCounter+"/"+Matrix.config.devices.length+")");
                        // clear out zip file
                        // require('child_process').execSync('rm ' + destinationFilePath);
                        // debug( destinationFilePath, 'removed');
                        return callback(null);
                      }
                    }, 400);
                  } else if (status === 'active') {
                    console.log(deviceName.green + ': App running already, will attempt restart.');
                    return callback(null);
                  } else if (status === 'pending') {
                    nowInstalling[deviceId] = true
                    console.log(deviceName.green + ': Installing ' + appName + ' on device...');
                    Matrix.loader.start();
                  } 
                  if (didTimeout[deviceId]) {
                    return callback(null);
                  }
                });
              }
            });
          }, (err) => {
            Matrix.loader.stop();
            if (err) {
              console.error(err);
              process.exit(1);
            }
            return endIt();
          });
          
          
          async.each(Matrix.config.devices, (device, cb) => {
            //Send the app deployment request
            var options = {
              deviceId: device.identifier,
              appData: appData,
              userId: Matrix.config.user.id
            };

            var deviceName = Matrix.helpers.lookupDeviceName(device.identifier);

            //Start timeout in case the workers aren't up'
            workersTimeout[device.identifier] = setTimeout(function () {
              console.log(deviceName.green + ': Server response timeout, please try again later'.yellow);
              process.exit(1);
            }, workerTimeoutSeconds * 1000);

            Matrix.firebase.app.deploy(options, {
              error: function (err) {
                clearTimeout(workersTimeout[device.identifier]);
                if (err.hasOwnProperty('details')) {
                  console.log(deviceName.green + ': App deployment failed: '.red, err.details.error);
                } else {
                  console.log(deviceName.green + ': App deployment failed: '.red, err.message);
                }
                return cb(err);
              },
              finished: function () {
                clearTimeout(workersTimeout[device.identifier]);
                Matrix.loader.stop();
                console.log(deviceName.green + ': Deploying to device...');
                //Start timeout in case the workers aren't up'
                deviceTimeout[device.identifier] = setTimeout(function () {
                  console.log(deviceName.green + ': ' + t('matrix.install.device_install_timeout').yellow);
                  didTimeout[device.identifier] = true;
                }, deviceTimeoutSeconds * 1000);
                Matrix.loader.start();
                deploymentFinished[device.identifier] = true;
                return cb(null);
              },
              start: function () {
                Matrix.loader.stop();
                console.log(deviceName.green + ': Requesting deploy...');
                Matrix.loader.start();
              },
              progress: function () {
                Matrix.loader.stop();
                console.log(deviceName.green + ': Processing deployment parameters...');
                Matrix.loader.start();
              }
            });
          }, (err) => {
            if (err) {
              process.exit(1);
            }
          });
        });
      } else {
        console.error(err);
        return process.exit(1);
      }
    });

  }

  function endIt() {
    setTimeout(function () {
      console.log("Done.".green);
    
      process.nextTick(function () {
        process.exit(0);
      })
    }, 1000)
  }

  function displayHelp() {
    console.log('\n> matrix deploy ¬\n');
    console.log('\t    matrix deploy <app> -', t('matrix.deploy.help', { app: '<app>' }).grey)
    console.log('\n')
    process.exit(1);
  }

});