#!/usr/bin/env node

require('./matrix-init');
var fs = require('fs');
var tar = require('tar');
var async = require('async');
var yaml = require('js-yaml');
var debug = debugLog('publish');
var fstream = require('fstream');
var appDetectFile = 'config.yaml';
var fileUrl = 'https://storage.googleapis.com/' + Matrix.config.environment.appsBucket + '/apps'; // /<AppName>/<version>.zip
var publicationFinished = false;

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function() {

  if (showTheHelp) {
    return displayHelp();
  }

  Matrix.validate.user(); //Make sure the user has logged in

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
  var hasReadme = false;

  async.parallel({
      folder: async.apply(Matrix.helpers.checkAppFolder, pwd),
      code: async.apply(Matrix.helpers.checkAppCode, pwd),
      data: async.apply(Matrix.helpers.collectAppData, appName, pwd)
    },
    function(err, results) {
      if (!err && !_.isUndefined(results.data)) {
        if (!_.isUndefined(results.folder)) {
          //If it has a readme file
          if (results.folder.hasOwnProperty('readme')) {
            hasReadme = results.folder.readme;
          }
        }
        var appDetails = results.data;
        debug('Using app details: ' + JSON.stringify(appDetails));
        var configOk = true;
        Matrix.loader.stop();
        console.log('Validating configuration file...');
        try {
          configOk = Matrix.validate.config(appDetails.config);
        } catch (e) {
          console.error(e);
          console.log('Publication interrupted. Please make sure the config.yaml file is properly formatted and try again'.yellow);
          process.exit();
        }

        if (!configOk) {
          console.log('Publication interrupted. Please adjust the config.yaml file and try again'.yellow);
          process.exit();
        }
        console.log('Successful config file validation');
        Matrix.loader.start();

        var newVersion = Matrix.helpers.patchVersion(appDetails.version);

        //ASK
        var Rx = require('rx');
        var promptHandler = new Rx.Subject();

        Matrix.loader.stop();
        require('inquirer').prompt(promptHandler).ui.process.subscribe(function(answer) {
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
            Matrix.helpers.updateFile(packageContent, pwd + '/package.json', function(err) {
              if (err) {
                console.error('Error updating package.json file: ' + err.message.red);
                process.exit(1);
              }
              promptHandler.onCompleted();
            });
          }

        }, function(e) { console.error(e) }, function() {
          Matrix.helpers.zipAppFolder(pwd, destinationFilePath, function(err) {
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
          message: 'Publish ' + appName.yellow + ' version '.white + appDetails.version.yellow + '?'.white,
          default: true
        });

        //Ask for new version to deploy
        promptHandler.onNext({
          type: 'input',
          name: 'version',
          message: 'Select new version to use:'.white,
          default: newVersion,
          validate: function(versionInput) {
            if (versionInput.match('^(?:(\\d+)\.)(?:(\\d+)\.)(\\d+)$')) {
              return true;
            } else {
              return versionInput + ' is not a valid version';
            }
          },
          when: function(answers) {
            return !answers.current;
          }
        });

      } else {
        console.log('App configuration error, please adjust it and try again'.yellow);
        console.error(err.message.red);
      }
    });

  var localReadmeFileName = 'README.MD';
  var remoteReadmeFileName = 'readme.md';

  function onEnd(details) {
    debug('Finished packaging ', appName);
    var downloadFileName = details.version + '.zip';
    details.file = fileUrl + '/' + appName + '/' + downloadFileName;
    Matrix.firebaseInit(function(err) {
      async.parallel([
        function(next) {
          if (hasReadme) {
            Matrix.helpers.getUploadUrl(remoteReadmeFileName, appName, 'text', function(err, readmeUploadUrl) {
              if (err) {
                next(err);
              } else {
                Matrix.helpers.uploadPackage(pwd + '/' + localReadmeFileName, readmeUploadUrl, function(err) {
                  next(err);
                });
              }
            });
          } else {
            next();
          }
        },
        function(next) {
          Matrix.helpers.getUploadUrl(downloadFileName, appName, 'zip', function(err, uploadUrl) {
            if (!err) {
              Matrix.helpers.uploadPackage(destinationFilePath, uploadUrl, function(err) {
                next(err);
              });
            } else {
              console.error(err);
              return process.exit(1);
            }
          });
        }
      ], function(err) {
        if (details.config.hasOwnProperty('galleryUrl')) {
          iconUrl = details.config.galleryUrl;
        }

        var appData = {
          'meta': _.pick(details, ['name', 'description', 'shortname', 'keywords', 'categories', 'version', 'file']),
          'file': details.file, //TODO Remove this once it isn't required
          'version': details.version, //TODO Remove this once it isn't required
          'assets': {
            'icon': iconURL
          },
          'config': details.config,
          'policy': details.policy
            //'override': true //This ignores the version restriction on the backend
        };
        if (hasReadme) {
          appData.meta.readme = fileUrl + '/' + appName + '/' + remoteReadmeFileName;
          debug('README URL: ' + appData.meta.readme);
        }
        debug('DOWNLOAD URL: ' + appData.file);
        debug('The data sent for ' + appName + ' ( ' + details.version + ' ) is: ', appData);

        Matrix.helpers.trackEvent('app-publish', { aid: appName });
        //Listen for the app creation in appStore
        Matrix.firebase.appstore.watchForAppCreated(appName, function(app) {
          debug('app published>', app);
          var publicationTimer = setInterval(function() {
            if (publicationFinished) {
              clearTimeout(publicationTimer);
              console.log('Application ' + appName.green + ' published!');


              endIt();
            } else {
              debug('Publication not finished')
            }
          }, 400);
        });

        //Send the app creation request
        var events = {
          error: function(err) { //error
            if (err.hasOwnProperty('details')) {
              console.log('App registration failed: '.red, err.details.error);
            } else {
              console.log('App registration failed: '.red, err.message);
            }
            debug(err);
            process.exit();
          },
          finished: function() { //finished
            Matrix.loader.stop();
            console.log('App registered in appstore');
            publicationFinished = true;
          },
          start: function() { //start
            Matrix.loader.stop();
            console.log('App registration formed...');
            Matrix.loader.start();
          },
          progress: function() { //progress
            Matrix.loader.stop();
            console.log('App registration in progress...');
            Matrix.loader.start();
          }
        };

        Matrix.firebase.app.publish(Matrix.config.user.token, '', Matrix.config.user.id, appData, events);
      });

    });
  }

  function endIt() {
    setTimeout(function() {
      process.nextTick(function() {
        process.exit(0);
      })
    }, 1000)
  }

  function displayHelp() {
    console.log('\n> matrix publish ¬\n');
    console.log('\t    matrix publish <app> -', t('matrix.publish.help').grey, { app: '<app>' })
    console.log('\n')
    process.exit(1);
  }

});