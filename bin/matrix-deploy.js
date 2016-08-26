#!/usr/bin/env node

require('./matrix-init');
var program = require('commander')
var firebase = require('matrix-firebase');
var fs = require('fs');
var tar = require('tar');
var fstream = require('fstream');
var JSHINT = require('jshint').JSHINT;
var debug = debugLog('deploy');
var firebaseWorkers = _.has(process.env, 'MATRIX_WORKER'); //Use new firebase flow if MATRIX_WORKER env var is found
var yaml = require('js-yaml')
var request = require('request');

var serverUrl = 'http://dev-demo.admobilize.com';
var uploadEndpoint = 'v2/app/resources/uploadurl';
var fileUrl = 'https://storage.cloud.google.com/admobilize-data-training/apps';

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  program
    .parse(process.argv);

  var pkgs = program.args;
  var appName = pkgs[0];
  var pwd = process.cwd();
  var detectFile = 'config.yaml';

  //TODO: make sure package.json is included
  if (_.isUndefined(appName)) {
    // infer name from current directory
    appName = require('path').basename(pwd);
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
  var configObject = {};
  var appVersion;

  try {
    var config = yaml.safeLoad(fs.readFileSync(pwd + detectFile));
  } catch (e) {
    return console.error(e.message.red);
  }

  debug('included config', config);

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

  try {
    appVersion = require(pwd + 'package.json').version;
  } catch (err) {
    return console.error(err.message.red);
  }

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

  function onEnd() {
    console.log('Finished packaging ', appName);
    firebase.init(
      Matrix.config.user.id,
      Matrix.config.device.identifier,
      Matrix.config.user.token,
      function (err) {
        if (err) {
          if (err.code === "EXPIRED_TOKEN") {
            console.error(t('matrix.expired'));
          } else {
            console.error(err);
          }
        }

        if (firebaseWorkers) {
          var versionParam = appVersion + '.zip';
          var url = serverUrl + '/' + uploadEndpoint
            + '?access_token=' + Matrix.config.user.token
            + '&appName=' + appName
            + '&version=' + versionParam;

          request.get(url, function (error, response, body) { //Get the upload URL
            if (error) {
              return console.error("Error getting the upload URL: ", error);
            } else if (response.statusCode !== 200) {
              return console.error(new Error("Error getting the upload URL (" + response.statusCode + ")" + response.status));
            } else if (!body || body === "") {
              return console.error(new Error("Error processing the upload URL request " + response.status));
            } else {
              if (!body.hasOwnProperty('status')) {
                body = JSON.parse(body);
              }
              if (!body.error && body.hasOwnProperty('status') && body.status == 'OK' && body.hasOwnProperty('results') && body.results.hasOwnProperty('uploadurl')) {
                var stream = fs.createReadStream(destinationFilePath).pipe(request.put(body.results.uploadurl))
                  .on('error', function (err) {
                    return console.log('Error uploading zipped file (' + destinationFilePath + '): \n', err);
                  })
                  .on('response', function (response) {
                    console.log('Upload response (' + response.statusCode + ')');
                    if (response.statusCode == 200) {
                      console.log(response.headers['content-type']);
                      var downloadURL = fileUrl + '/' + appName + '/' + versionParam;
                      var appData = {
                        'meta': {
                          'name': appName,
                          'version': appVersion,
                          'file': downloadURL
                        },
                        'config': configObject
                      };
                      console.log('Queuing app deployment for ' + appName + '-' + appVersion);
                      console.log('URL: ' + downloadURL);
                      firebase.app.deploy(Matrix.config.user.token, Matrix.config.device.identifier, Matrix.config.user.id, appData, function (err, result) {
                        console.log('App '.green + appName + ' deployment request successfully generated'.green);
                        if (err) console.log('Error: ', err);
                        if (result) console.log('Result: ', result);
                        endIt();
                      });
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
                return console.error("Unknown structure reported");
              }
            }
          });

        } else { //Non worker flow
          Matrix.api.app.deploy({
            appConfig: configObject,
            file: destinationFilePath,
            name: appName
          }, function (err, resp) {
            if (err) return console.error(t('matrix.deploy.deploy_error') + ':'.red, err);
            console.log(t('matrix.deploy.deply_started').yellow);
            resp.setEncoding();

            var data = '';
            resp.on('error', function (e) {
              console.error(t('matrix.deploy.stream_error').red, e)
            })
            resp.on('data', function (d) {
              data += d;
            });
            resp.on('end', function () {
              console.log(t('matrix.deploy.deploy_complete').green);
              debug(data);

              try {
                data = JSON.parse(data);
              } catch (e) {
                console.error(t('matrix.deploy.bad_payload'), e);
              }

              var deployInfo = data.results;
              deployInfo.name = appName;
              Matrix.helpers.checkPolicy(config, function (err, policy) {
                if (err) console.error(err);
                config = Matrix.helpers.configHelper.validate(config);
                firebase.app.add(config, policy);
              });

              // Tell device to download app
              Matrix.api.app.install(deployInfo, Matrix.config.device.identifier, function (err, resp) {
                if (err) {
                  return console.error(t('matrix.deploy.app_install_failed').red, err);
                }
                fs.unlinkSync(destinationFilePath); // remove zip file
                console.log(t('matrix.deploy.app_installed').green, appName, '--->', Matrix.config.device.identifier);
                endIt();
              });

            });
          });
        } //End of non worker flow
      });
  }

  function endIt() {
    setTimeout(function () {
      process.nextTick(function () {
        process.exit(0);
      })
    }, 1000)
  }

});