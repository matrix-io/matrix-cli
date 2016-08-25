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



  var tmp = __dirname + '/../' + appName + '.zip';

  //TODO: IMPORTANT Make sure config file exists
  if (!fs.existsSync(pwd + detectFile)) {
    return console.error(t('matrix.deploy.app_not_found', {detect_file: detectFile, pwd: pwd}));
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
  })


  var appFile = fs.readFileSync(pwd + 'app.js').toString();
  var configFile = fs.readFileSync(pwd + detectFile).toString();
  var configObject = {};

  try {
    var config = yaml.safeLoad(fs.readFileSync(pwd + detectFile));
  } catch (e){
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

  console.log(t('matrix.deploy.reading') + ' ', pwd);
  console.log(t('matrix.deploy.writing') + ' ', tmp);

  var destinationZip = fs.createWriteStream(tmp);

  destinationZip.on('open', function () {
    debug('deploy zip start')
  })

  destinationZip.on('error', function (err) {
    debug('deploy zip err', err)
  })

  destinationZip.on('finish', function () {
    debug('deploy zip finish');
    onEnd();
  })

  // zip up the files in the app directory
  var archiver = require('archiver');
  var zip = archiver.create('zip', {});

  // zip.bulk([{
  //   expand: true,
  //   cwd: pwd
  // }, ]);


  var files = fs.readdirSync(pwd);
  //console.log('Files found = ', files);
  _.each(files, function (file) {
    debug('Adding to zip', file)
    //TODO need to properly validate filenames
    if (_.isEmpty(file) || _.isUndefined(file) || file == ':'){
      console.log('Skipping invalid file: ', file);
    } else {
      zip.append(fs.createReadStream(pwd + file), {
        name: file
      });
    }
  });

  // zip.on('end', onEnd);
  zip.on('error', onError);
  zip.finalize();

  // send zip to the file
  zip.pipe(destinationZip);

  function onError(err) {
    console.error(t('matrix.deploy.error') + ':', err)
  }

  function onEnd() {
    console.log('Finished packaging app folder');
    
    firebase.init(
      Matrix.config.user.id,
      Matrix.config.device.identifier,
      Matrix.config.user.token,
      function (err) {
        if (err) {
          if (err.code === "EXPIRED_TOKEN") {
            console.error(t('matrix.expired'))
          } else {
            console.error(err);
          }
        }

    if (firebaseWorkers) {
      var appData = {
        'meta': {
          'name': appName
        },
        'config': configObject
      };
      //file: tmp
      //TODO Need to upload the file and add the URL
      //upload file (located in tmp) to firebase storage or google cloud storage
      //add file URL under file: http://...

      firebase.app.deploy(Matrix.config.user.token, Matrix.config.device.identifier, Matrix.config.user.id, appData, function (err, result) {
        console.log('App '.green + appName + ' deployment request successfully generated'.green);
        if (err) console.log('Error: ', err);
        if (result) console.log('Result: ', result);
        endIt();
      });
    } else {
      Matrix.api.app.deploy({
        appConfig: configObject,
        file: tmp,
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

            // remove zip file
            fs.unlinkSync(tmp);

            console.log(t('matrix.deploy.app_installed').green, appName, '--->', Matrix.config.device.identifier);
            endIt();
          });

        });
      });
      }
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