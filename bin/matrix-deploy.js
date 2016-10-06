#!/usr/bin/env node

require('./matrix-init');
var fs = require('fs');
var tar = require('tar');
var async = require('async');
var yaml = require('js-yaml');
var debug = debugLog('deploy');
var fstream = require('fstream');
var appDetectFile = 'config.yaml';
var fileUrl = 'https://storage.googleapis.com/' + Matrix.config.environment.appsBucket + '/apps';// /<AppName>/<version>.zip
var deploymentFinished = false;

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (showTheHelp) {
    return displayHelp();
  }

  Matrix.validate.user(); //Make sure the user has logged in
  Matrix.validate.device(); //Make sure the user has logged in

  Matrix.loader.start();
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

  var destinationFilePath = __dirname + '/../' + appName + '.zip';
  var packageContent;
  var configObject = {};
  var policyObject = {};
  var iconURL = 'https://storage.googleapis.com/dev-admobilize-matrix-apps/default.png';

  async.parallel({
    folder: async.apply(Matrix.helpers.checkAppFolder, pwd),
    code: async.apply(Matrix.helpers.checkAppCode, pwd),
    data: async.apply(Matrix.helpers.collectAppData, appName, pwd)
  },
    function (err, results) {
      if (!err && !_.isUndefined(results.data)) {
        var appDetails = results.data;
        debug('Using app details: ' + JSON.stringify(appDetails));
        var newVersion = Matrix.helpers.patchVersion(appDetails.version);

        //ASK
        var Rx = require('rx');
        var promptHandler = new Rx.Subject();

        Matrix.loader.stop();
        require('inquirer').prompt(promptHandler).ui.process.subscribe(function (answer) {
          if (answer.name === 'current' && answer.answer === true) {
            promptHandler.onCompleted();
          }

          if (answer.name === 'version') {
            appDetails.version = answer.answer;
            try {
              packageContent = require(pwd + '/' + 'package.json');
            } catch (err) {
              console.error('Error reading package.json file:' + err.message);
              process.exit(1);
            }
            packageContent.version = appDetails.version;
            Matrix.helpers.updateFile(packageContent, pwd + '/package.json', function (err) {
              if (err) {
                console.error('Error updating package.json file: ' + err.message.red);
                process.exit(1);
              }
              promptHandler.onCompleted();
            });
          }

        }, function (e) { console.error(e) }, function () {
          Matrix.helpers.zipAppFolder(pwd, destinationFilePath, function (err) {
            if (err) {
              console.error('Error zipping app folder: ' + err.message.red);
              process.exit();
            } else {
              onEnd(appDetails);
            }
          });
        });

        //Confirm deployment to current version
        promptHandler.onNext({
          type: 'confirm',
          name: 'current',
          message: 'Deploy version '.white + appDetails.version.yellow + '?'.white,
          default: true
        });

        //Ask for new version to deploy
        promptHandler.onNext({
          type: 'input',
          name: 'version',
          message: 'Select new version to use:'.white,
          default: newVersion,
          validate: function (versionInput) {
            if (versionInput.match('^(?:(\\d+)\.)(?:(\\d+)\.)(\\d+)$')) {
              return true;
            } else {
              return versionInput + ' is not a valid version';
            }
          },
          when: function (answers) {
            return !answers.current;
          }
        });

      } else {
        console.error(err.message.red);
      }
    });

  function onEnd(details) {
    debug('Finished packaging ', appName);
    var downloadFileName = Matrix.config.user.id + '.zip';
    Matrix.firebaseInit(function (err) {
      Matrix.helpers.getUploadUrl(downloadFileName, appName, function (err, uploadUrl) {
        if (!err) {
          Matrix.helpers.uploadPackage(destinationFilePath, uploadUrl, function (err) {
            var appData = {
              'meta': _.pick(details, ['name', 'description', 'shortname', 'keywords', 'categories']),
              'file': fileUrl + '/' + appName + '/' + downloadFileName,
              'assets': {
                'icon': iconURL
              },
              'version': details.version,
              'config': details.config,
              'policy': details.policy,
              'override': true
            };
            debug('DOWNLOAD URL: ' + uploadUrl);
            debug('The data sent for ' + appName + ' ( ' + details.version + ' ) is: ', appData)

            //Listen for the app installation in device
            Matrix.firebase.app.watchNamedUserApp(appName, function (app) {
              debug('App deployed>', app);
              var appInfo = app;
              if (_.has(appInfo, 'runtime.status')) {
                Matrix.loader.stop();
                var status = app.runtime.status;
                debug('status>', status)
                if (status === 'error') {
                  console.error(t('matrix.install.app_install_error'), ' ', app);
                  process.exit(1);
                } else if (status === 'inactive') {
                  var deploymentTimer = setInterval(function () {
                    if (deploymentFinished) {
                      clearTimeout(deploymentTimer);
                      console.log('Application ' + appName.green + ' was successfully installed!');
                      endIt();
                    } else {
                      debug('Deploy not finished')
                    }
                  }, 400);
                  console.log(t('matrix.install.app_install_success').green);
                  process.exit(0);
                } else if (status === 'active') {
                  console.log('App running already, not good.')
                  process.exit(1);
                }
              } else {
                debug('App reported but no status found');
              }
            });

            //Send the app deployment request
            var options = {
              deviceId: Matrix.config.device.identifier,
              appData: appData,
              userId: Matrix.config.user.id
            };

            Matrix.firebase.app.deploy(options, {
              error: function (err) {
                if (err.hasOwnProperty('details')) {
                  console.log('App deployment failed: '.red, err.details.error);
                } else {
                  console.log('App deployment failed: '.red, err.message);
                }
                process.exit();
              },
              finished: function () {
                Matrix.loader.stop();
                console.log('Deploying to device...');
                deploymentFinished = true;
              },
              start: function () {
                Matrix.loader.stop();
                console.log('Requesting deploy...');
                Matrix.loader.start();
              },
              progress: function () {
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

    });
  }

  function endIt() {
    setTimeout(function () {
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
