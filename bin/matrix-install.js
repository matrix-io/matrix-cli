#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('install');

console.warn('Install is not yet functional. Do NOT use.')
process.exit(1);

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var cmd = Matrix.pkgs[0];
  var target = Matrix.pkgs[1];

  //Defaults to app
  if (Matrix.pkgs.length === 1) {
    target = cmd;
    cmd = 'app';
  }

  if (cmd.match(/a|ap|app|-a|--app/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.validate.device(); //Make sure the user has logged in
    // TODO lookup policy from config file, pass to function


    console.log('____ | ' + t('matrix.install.installing') + ' ', target, ' ==> '.yellow, Matrix.config.device.identifier)
    Matrix.loader.start();
    Matrix.firebaseInit(function () {
      Matrix.firebase.app.search(target, function (result) {
        if (!_.isNull(result)) {
          debug(result)

          var appId = _.findKey(result, function (app, appId) {
            if (app.meta.name == target || (app.meta.hasOwnProperty("shortName") && app.meta.shortName == target)) {
              return 1;
            } versionId
          });

          if (_.isUndefined(appId)) {
            Matrix.loader.stop();
            console.log(t('matrix.install.app_x_not_found', { app: target.yellow }));
            return process.exit();
          }
          var versionId = result[appId].meta.currentVersion;
          debug('VERSION: '.blue, versionId, 'APP: '.blue, appId);

          var options = {
            policy: result[appId].versions[versionId].policy,
            name: target,
            id: appId,
            versionId: versionId
          }

          Matrix.helpers.installApp(options, function (err) {
            Matrix.loader.stop();
            if (err) {
              console.log(err);
              process.exit(1);
            }

            console.log(name, " has now been deployed to your device, enjoy!");
            process.exit(0);
          });
        }
      });
    });

  } else if (cmd.match(/s|se|sen|sens|senso|sensor|sensors|-s|--sensors/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.validate.device(); //Make sure a device has been selected
    Matrix.loader.start();
    Matrix.api.sensor.install(t, Matrix.config.device.identifier, function (err, resp) {
      Matrix.loader.stop();
      if (err) return console.error(err);
      debug(resp);
      console.log(t, ' ' + t('matrix.install.sensor_installed') + '.')
      process.exit();
    })
  }

  function displayHelp() {
    console.log('\n> matrix install ¬\n');
    console.log('\t    matrix install app <app> -', t('matrix.install.help_app', { app: '<app>' }).grey)
    console.log('\t    matrix install sensor <sensor> -', t('matrix.install.help_sensor', { sensor: '<sensor>' }).grey)
    console.log('\n')
    process.exit(1);
  }
});
