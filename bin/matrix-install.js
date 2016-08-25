#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var firebase = require('matrix-firebase');
var debug = debugLog('install');
var firebaseWorkers = _.has(process.env, 'MATRIX_WORKER'); //Use new firebase flow if MATRIX_WORKER env var is found

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  require('./matrix-validate');
  program
    .parse(process.argv);

  var pkgs = program.args;

  var cmd = pkgs[0];
  //target
  var target = pkgs[1];

  //Defaults to app
  if (pkgs.length === 1) {
    target = cmd;
    cmd = 'app';
  }

  if (cmd.match(/a|ap|app|-a|--app/)) {
    console.log('____ | ' + t('matrix.install.installing') + ' ', t, ' ==> '.yellow, Matrix.config.device.identifier)
    // TODO lookup policy from config file, pass to function
    Matrix.helpers.checkPolicy({}, function (err, policy) {
      console.warn('Policy>', policy, 'rest of flow unfinished');

      if (firebaseWorkers) {
        firebase.init(
          Matrix.config.user.id,
          Matrix.config.device.identifier,
          Matrix.config.user.token,
          function (err) {
            debug("Firebase Init");
            if (err) return console.error(err);

            firebase.app.search(target);
            //Get app with name X
            //Get versionId of appId with version X
            //firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, "myAppId", policy, handleResponse);
            process.exit();
          }
        );
      } else {
        //TODO: make the rest of this work
        return;
        /*Matrix.api.app.install(t, Matrix.config.device.identifier, function (err, resp) {
          if (err) return console.error(err);
          console.log(t('matrix.install.app_installed').yellow, t);
          debug(resp);
        });*/
      }

    });
  } else if (cmd.match(/s|se|sen|sens|senso|sensor|sensors|-s|--sensors/)) {
    Matrix.api.sensor.install(t, Matrix.config.device.identifier, function (err, resp) {
      if (err) return console.error(err);
      debug(resp);
      console.log(t, ' ' + t('matrix.install.sensor_installed') + '.')
      process.exit();
    })
  }

  // if (!_.isUndefined(o) && o.sensors === true) {
  //   //sensor install
  //   console.warn('sensor not implemented yet');
  // } else {
  //   // application install
  //   // TODO: ensure if file is not found, we're hitting api directory
  //   // console.log('Installing app', name)
  // }

});
