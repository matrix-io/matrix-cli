#!/usr/bin/env node

var async = require('async');
var deploymentFinished = false;
var workerTimeoutSeconds = 30;
var deviceTimeoutSeconds = 30;

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
  function(cb) {
    Matrix.firebaseInit(cb)
  }
], function(err) {
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
    function(err, results) {
      if (!err && !_.isUndefined(results.data)) {
        var appDetails = results.data;
        debug('Using app details: ' + JSON.stringify(appDetails));

        Matrix.helpers.zipAppFolder(pwd, destinationFilePath, function(err) {
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

    Matrix.helpers.trackEvent('app-deploy', { aid: appName, did: Matrix.config.device.identifier });

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

    Matrix.helpers.getUploadUrl(downloadFileName, appName, 'zip', function(err, uploadUrl) {
      if (!err) {
        Matrix.helpers.uploadPackage(destinationFilePath, uploadUrl, function(err) {

          var appData = Matrix.helpers.formAppData(details);
          appData.override = true; //If true the appstore won't check for uniqueness

          var deployedAppId, workerTimeout, deviceTimeout;
          var nowInstalling = false;
          //Listen for the app installation in device (appId from users>devices>apps)
          Matrix.firebase.app.watchNamedUserApp(appName, function(app, appId) {
            debug('App install ' + appId + ' activity');
            if (!_.isUndefined(appId) && _.isUndefined(deployedAppId)) {
              debug('App id ' + appId + ' identified');
              deployedAppId = appId;
              //Listen for the status change (deviceapps)
              Matrix.firebase.app.watchStatus(deployedAppId, function(status) {
                debug('App deployed with status > ' + status);
                Matrix.loader.stop();
                if (status === 'error') {
                  console.error(t('matrix.install.app_install_error'), ' ', app);
                  process.exit(1);
                  //It must first go through the pending state (nowInstalling) and then back to inactive
                } else if (nowInstalling && status === 'inactive') {
                  //agrouping on a function so can call it on status active
                  timerDeployment(deviceTimeout, deploymentFinished);
                } else if (status === 'active') {
                  console.log('App running already, re-deploying and starting app!');
                  Matrix.api.app.stop(appName, Matrix.config.device.identifier, function(err) {
                    if (err) {
                      Matrix.loader.stop();
                      console.log(t('matrix.stop.stop_app_error') + ':', app, ' (' + err.message.red + ')');
                      process.exit(1);
                    }
                    timerDeployment(deviceTimeout, deploymentFinished);
                  });
                } else if (status === 'pending') {
                  nowInstalling = true
                  console.log('Installing ' + appName + ' on device...');
                  Matrix.loader.start();
                }
              });
            }
          });

          //Start timeout in case the workers aren't up'
          workerTimeout = setTimeout(function() {
            console.log('Server response timeout, please try again later'.yellow);
            process.exit(1);
          }, workerTimeoutSeconds * 1000);

          //Send the app deployment request
          var options = {
            deviceId: Matrix.config.device.identifier,
            appData: appData,
            userId: Matrix.config.user.id
          };

          Matrix.firebase.app.deploy(options, {
            error: function(err) {
              clearTimeout(workerTimeout);
              if (err.hasOwnProperty('details')) {
                console.log('App deployment failed: '.red, err.details.error);
              } else {
                console.log('App deployment failed: '.red, err.message);
              }
              process.exit();
            },
            finished: function() {
              clearTimeout(workerTimeout);
              Matrix.loader.stop();
              console.log('Deploying to device...');
              //Start timeout in case the workers aren't up'
              deviceTimeout = setTimeout(function() {
                console.log(t('matrix.install.device_install_timeout').yellow);
                process.exit(1);
              }, deviceTimeoutSeconds * 1000);
              Matrix.loader.start();
              deploymentFinished = true;
            },
            start: function() {
              Matrix.loader.stop();
              console.log('Requesting deploy...');
              Matrix.loader.start();
            },
            progress: function() {
              Matrix.loader.stop();
              console.log('Processing deployment parameters...');
              Matrix.loader.start();
            }
          });

        });
      } else {
        console.error(err);
        return process.exit(1);
      }
    });

  }

  function timerDeployment(deviceTimeout, deploymentFinished){
    clearTimeout(deviceTimeout);
    var deploymentTimer = setInterval(function() {
      if (deploymentFinished) {
        clearTimeout(deploymentTimer);
        console.log('Application ' + appName.green + ' was successfully installed!');
        console.log(t('matrix.install.app_install_success').green);
        // clear out zip file
        // require('child_process').execSync('rm ' + destinationFilePath);
        // debug( destinationFilePath, 'removed');
        endIt();
      }
    }, 400);
  }

  function endIt() {
    setTimeout(function() {
      process.nextTick(function() {
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
