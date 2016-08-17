#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('install');



Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  require('./matrix-validate');
  program
    .parse(process.argv);

  var pkgs = program.args;

  var cmd = pkgs[0];
  //target
  var t = pkgs[1];

  //Defaults to app
  if (pkgs.length === 1) {
    t = cmd;
    cmd = 'app';
  }

  if (cmd.match(/a|ap|app|-a|--app/)) {
    console.log('____ | ' + t('matrix.install.installing') + ' ', t, ' ==> '.yellow, Matrix.config.device.identifier)

    // TODO lookup policy from config file, pass to function
    Matrix.helpers.checkPolicy({}, function (err, policy) {


      console.warn('Policy>', policy, 'rest of flow unfinished')
      //TODO: make the rest of this work
      return;
      Matrix.api.app.install(t, Matrix.config.device.identifier, function (err, resp) {
        if (err) return console.error(err);
        console.log(t('matrix.install.app_installed').yellow, t);
        debug(resp);

        //manage api records
        Matrix.api.app.assign(t, function (err, resp) {
          if (err) return console.error(err);
          debug('App Assigned to', Matrix.config.device.identifier);
          process.exit();
        });

        //TODO: Pull sensors / integrations. Ask permissions. Write Policy
      });

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
