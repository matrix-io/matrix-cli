#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('install');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var cmd = Matrix.pkgs[0];

  if (cmd.match(/sensor|sensors|-s|--sensors/)) {
    var target = Matrix.pkgs[1];
    //Make sure the user has logged in
    Matrix.validate.user();
    Matrix.validate.device();

    Matrix.loader.start();

    Matrix.api.sensor.install(target, Matrix.config.device.identifier, function (err, resp) {
      Matrix.loader.stop();
      if (err) return console.error(err);
      debug(resp);
      console.log(target, ' ' + t('matrix.install.sensor_installed') + '.')
      process.exit();
    })
  }else {
    //Take version and app name
    if (cmd.match(/(^|\s)app(\s|$)|-a|--app/)) {
      var appName = Matrix.pkgs[1];
      var version = Matrix.pkgs[2];
    }else{
      var appName = Matrix.pkgs[0];
      var version = Matrix.pkgs[1];
    }

    //Make sure the user has logged in
    Matrix.validate.user();
    Matrix.validate.device();

    // TODO lookup policy from config file, pass to function
    console.log('____ | ' + t('matrix.install.installing') + ' ', appName, ' ==> '.yellow, Matrix.config.device.identifier)

    Matrix.loader.start();
    Matrix.firebaseInit(function () {
      //Search the app to install
      Matrix.firebase.app.search(appName, function (result) {
        //Validate if found the app
        if (_.isUndefined(result)) {
          debug(result) 
          Matrix.loader.stop();
          console.log(t('matrix.install.app_x_not_found', { app: appName.yellow }));
          return process.exit();
        }

        var versionId;
        //Validate if the version exist and get the version Id
        if(version){
          versionId = _.findKey(result.versions, function (appVersion, versionId) {
            if (appVersion.version === version) {
              return true;
            }
          });
          //If the version doesn't exist show the error and end the process
          if (_.isUndefined(versionId)) {
            Matrix.loader.stop();
            console.log(t('matrix.install.app_version_x_not_found', { version: version }));
            return process.exit();
          }
        }else{
          //If in the command doesn't set the version use a current version of app
          versionId = result.meta.currentVersion;
        }

        debug('VERSION: '.blue, versionId, 'APP: '.blue, appName);

        var options = {
          policy: result.versions[versionId].policy,
          name: appName,
          id: result.id,
          versionId: versionId
        }
        Matrix.helpers.installApp(options, function (err) {
          Matrix.loader.stop();
          if (err) {
            console.log(err);
            process.exit(1);
          }

          console.log(t('matrix.install.app_install_success').green);
          process.exit(0);
        });

      });
    });
  }

  function displayHelp() {
    console.log('\n> matrix install ¬\n');
    console.log('\t    matrix install app <app> -', t('matrix.install.help_app', { app: '<app>' }).grey)
    console.log('\t    matrix install sensor <sensor> -', t('matrix.install.help_sensor', { sensor: '<sensor>' }).grey)
    console.log('\n')
    process.exit(1);
  }
});
