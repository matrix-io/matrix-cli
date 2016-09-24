#!/usr/bin/env node

require('./matrix-init');
var fs = require('fs');
var tar = require('tar');
var fstream = require('fstream');
var JSHINT = require('jshint').JSHINT;
var debug = debugLog('deploy');
var yaml = require('js-yaml')
var request = require('request');

var uploadEndpoint = 'v2/app/resources/uploadurl';
var fileUrl = 'https://storage.googleapis.com/' + Matrix.config.environment.appsBucket + '/apps';// /<AppName>/<version>.zip
var detectFile = 'config.yaml';

var waitForRegistrationToFinish = true;
var deployFinished = false;

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (showTheHelp) {
    return displayHelp();
  }

  Matrix.validate.user(); //Make sure the user has logged in
  Matrix.validate.device(); //Make sure the user has logged in
  var appName = Matrix.pkgs[0];
  var pwd = process.cwd();

  //TODO: make sure package.json is included
  if (_.isUndefined(appName)) {
    // infer name from current directory + strip out suffix jic
    appName = require('path').basename(pwd).replace('.matrix','');
    // step out one level so we can target this dir
    pwd += '/';
  } else {
    pwd += '/' + appName + '/';
  }
  var destinationFilePath = __dirname + '/../' + appName + '.zip';

  //TODO: IMPORTANT Make sure config file exists
  if (!fs.existsSync(pwd + detectFile)) {
    return console.error(t('matrix.deploy.app_not_found', { detect_file: detectFile, pwd: pwd }));
  }

  //See if any files are a directory. #113583355 Add other checks here sometime?
  var files = fs.readdirSync(pwd);
  _.each(files, function (f) {
    var s = fs.statSync(pwd + f);
    if (s.isDirectory()) {
      return console.error(f, ' <-- ' + t('matrix.deploy.folders_not_supported'));
    } else {
      debug('zipping up %s!', f);
    }
  });

  var appFile = fs.readFileSync(pwd + 'app.js').toString();
  var configFile = fs.readFileSync(pwd + detectFile).toString();
  var iconURL = 'https://storage.googleapis.com/dev-admobilize-matrix-apps/default.png';
  if (configFile.hasOwnProperty('icon')){
    //Upload icon?
  }

  var configObject = {};
  var policyObject = {};
  var appDetails = {};
  try {
    var config = yaml.safeLoad(fs.readFileSync(pwd + detectFile));
  } catch (e) {
    return console.error(e.message.red);
  }
  //TODO include actual config
  debug('included config', config);

  var initialPolicy = Matrix.helpers.configHelper.config.parsePolicyFromConfig(config);

  console.log('Please specify your application requirements:'.yellow);
  Matrix.helpers.checkPolicy(initialPolicy, appName, function (err, policy) {
    if (err) return console.error('Invalid policy ', policy);

    debug('Policy:>', policy)
    policyObject = policy;
    // run JSHINT on the application
    JSHINT(appFile);

    if (JSHINT.errors.length > 0) {
      console.log(t('matrix.deploy.cancel_deploy').red)
      _.each(JSHINT.errors, function (e) {
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
      })
      return;
    }

    var packageContent;
    try {
      packageContent = require(pwd + 'package.json');
      appDetails = {
        name: appName,
        version: packageContent.version || '1.0.0',
        description: packageContent.description || '',
        categories: packageContent.categories || ['Development'],
        shortname : packageContent.shortname || appName.toLowerCase().replace(" ", "_"),
        keywords : packageContent.keywords || ['development']
      }
      debug('Package.json data extracted: ', appDetails);
    } catch (err) {
      return console.error(err.message.red);
    }

    //TODO check version, get prompt    
    var inAppstore = true; //appDetails.version not in appstore
    
    if (!inAppstore){
      continue;
    } else {
      var Rx = require('rx');
      var prompts = new Rx.Subject();
      prompts.onNext({
        type: 'confirm',
        name: 'override',
        message: 'Do you want to override version'.white + appDetails.version + '? Y/N'.white,
        default: true
      });
      var newVersion = 1; //currentVersion + 1 
      var prompts = ['Y to override version' + appDetails.version + ', N to deploy as version ' + newVersion]; 
      require('inquirer').prompt(prompts).ui.process.subscribe(function (ans) {
        if (ans.name === 'quick' && ans.answer === true) {
          
        }
      });
    } 

    //ZIP    
    console.log(t('matrix.deploy.reading') + ' ', pwd);
    console.log(t('matrix.deploy.writing') + ' ', destinationFilePath);

    var destinationZip = fs.createWriteStream(destinationFilePath);

    destinationZip.on('open', function () {
      debug('deploy zip start')
    });

    destinationZip.on('error', function (err) {
      debug('deploy zip err', err)
    });

    destinationZip.on('finish', function () {
      debug('deploy zip finish');
      onEnd();
    });

    // zip up the files in the app directory
    var archiver = require('archiver');
    var zip = archiver.create('zip', {});

    // zip.bulk([{
    //   expand: true,
    //   cwd: pwd
    // }, ]);


    var files = fs.readdirSync(pwd);
    _.each(files, function (file) {
      debug('Adding to zip', file)
      //TODO need to properly validate filenames
      if (_.isEmpty(file) || _.isUndefined(file) || file == ':') {
        console.warn('Skipping invalid file: '.red, file);
      } else {
        zip.append(fs.createReadStream(pwd + file), {
          name: file
        });
      }
    });

    zip.on('error', function (err) {
      console.error(t('matrix.deploy.error') + ':', err)
    });
    zip.finalize();
    zip.pipe(destinationZip); // send zip to the file
  });

  function onEnd() {
    debug('Finished packaging ', appName);
    Matrix.firebaseInit(function (err, deviceId) {

      debug('firebase init done', deviceId);

          var url = Matrix.config.environment.api + '/' + uploadEndpoint
            + '?access_token=' + Matrix.config.user.token
            + '&appName=' + appName
            + '&version=' + appDetails.version + '.zip';

            debug('get', url);
          request.get(url, function (error, response, body) { //Get the upload URL
            if (error) {
              return console.error("Error getting the upload URL: ", error);
            } else if (response.statusCode !== 200) {
              if (response.statusCode == 401){
                console.log('Invalid user or expired token, please login again'.yellow);
                // remove user from config
                Matrix.helpers.removeConfig();
              } else {
                console.error(new Error("Error getting the upload URL (" + response.statusCode + ") " + response.status));
              }
              process.exit();
            } else if (!body || body === "") {
              console.error(new Error("Error processing the upload URL request " + response.status));
              process.exit();
            } else {
              if (!body.hasOwnProperty('status')) {
                body = JSON.parse(body);
              }
              if (!body.hasOwnProperty(error) && body.hasOwnProperty('status') &&
              body.status == 'OK' && body.hasOwnProperty('results') &&
              body.results.hasOwnProperty('uploadurl')) {

                debug('Uploading to ', body.results.uploadurl)
                var stream = fs.createReadStream(destinationFilePath).pipe(request.put(body.results.uploadurl))
                  .on('error', function (err) {
                    return console.log('Error uploading zipped file (' + destinationFilePath + '): \n', err);
                  })
                  .on('response', function (response) {
                    debug('Upload response (' + response.statusCode + ')');
                    if (response.statusCode == 200) {
                      var downloadURL = fileUrl + '/' + appName + '/' + appDetails.version + '.zip';
                      var appData = {
                        'meta': _.pick(appDetails, ['name', 'description', 'shortname', 'keywords', 'categories']),
                        'file': downloadURL,
                        'assets': {
                          'icon': iconURL
                        },
                        'version': appDetails.version,
                        'config': configObject,
                        'policy': policyObject
                      };
                      debug('DOWNLOAD URL: ' + downloadURL);
                      debug('The data sent for ' + appName + ' ( ' + appDetails.version + ' ) is: ', appData)

                      function triggerInstall(app) {
                        //TODO validate content of app
                        if (!app.hasOwnProperty('key') || !app.hasOwnProperty('data') || !app.data.hasOwnProperty('meta') || !app.data.meta.hasOwnProperty('currentVersion')) {
                          console.error('Trying to install app missing parameters'.red);
                          process.exit(1);
                        }
                        var options = {
                          policy: policyObject,
                          name: appName,
                          id: app.key,
                          versionId: app.data.meta.currentVersion
                        }

                        Matrix.helpers.installApp(options, function () {
                          endIt();
                        });
                      };

                      //Listen for the app creation in appStore
                      Matrix.firebase.appstore.watchForAppCreated(appName, function (app) {

                              debug('App in store > Triggering install for: ', app);
                              triggerInstall(app);

                      });

                      //Send the app creation request
                      var events = {
                        error: function (err) { //error
                          if (err.hasOwnProperty('details')) {
                            console.log('App registration failed: '.red, err.details.error);
                          } else {
                            console.log('App registration failed: '.red, err.message);
                          }
                          debug(err);
                          process.exit();
                        },
                        finished: function () { //finished
                          console.log('App registered in appstore');
                          deployFinished = true;
                        },
                        start: function () { //start
                          console.log('App registration formed...');
                        },
                        progress: function () { //progress
                          console.log('App registration in progress...');
                        }
                      };

                      Matrix.firebase.app.deploy(Matrix.config.user.token, Matrix.config.device.identifier, Matrix.config.user.id, appData, events);

                    } else {
                      return console.warn("Error uploading file");
                    }
                  });
                stream.on('error', function (err) {
                  return console.log('Error reading zipped file (' + destinationFilePath + '): \n', err);
                })
                /*.on('finish', function (err, response) {

                });*/
              } else {
                return console.error(t('matrix.deploy.app_install_failed').red, body);
              }
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
    console.log('\t    matrix deploy <app> -', t('matrix.deploy.help', {app: '<app>'}).grey)
    console.log('\n')
    process.exit(1);
  }

});
