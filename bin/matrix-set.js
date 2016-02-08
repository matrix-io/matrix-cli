#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);

var pkgs = program.args;

if (!pkgs.length) {
  showHelp();
}

if (pkgs.indexOf('env') === 0) {

  var value = pkgs[1];

  if (value && value.match(/sandbox|production/)) {
    if (Matrix.config.device.identifier.length === 0) {
      console.log('Select an Active Device with `matrix use {deviceid}`')
      return false;
    }
    Matrix.config.environment = value;
    Matrix.helpers.saveConfig();
    // TODO: set-env [value] set a environment on the AdMatrix
    console.log('Env:'.grey, Matrix.config.environment);
} else {
  console.error('Valid Environments = [ sandbox, production ]')
}

} else if (pkgs.indexOf('config') === 0) {
  var appName = pkgs[1];
  var configStr = pkgs[2];
  var key, val;

  if (_.isUndefined(Matrix.deviceId)) {
    console.warn('No Device Set. Use `matrix use`.')
    process.exit(0);
  }

  if (_.isUndefined(appName)) {
    console.warn('App Name Required: `matrix set config <appName> [key=value]` ')
    process.exit(0);
  }

  if (!_.isUndefined(configStr) && configStr.match(/=/)) {
    // key=value
    key = configStr.split('=')[0].trim();
    val = configStr.split('=')[1].trim();
  } else {
    console.warn('Must supply key and value: `matrix set config <appName> [key=value]`');
    process.exit(0);
  }

  // validate keys
  key = _.snakeCase(key.toLowerCase());

  var options = {
    deviceId: Matrix.config.device.identifier,
    name: appName,
    key: key,
    value: val
  }

  Matrix.api.app.configure(options, function(err, resp) {
    if (err) console.error(err);
    console.log('[' + options.deviceId + '](' + options.name + ')', options.key, '=', options.value);
    setTimeout(process.exit, 1000);
  });

} else {
  showHelp();
}

function showHelp() {

  console.log('\n> matrix set ¬\n');
  console.log('\t         matrix set env [env] -', 'set device environment ( production | sandbox )'.grey)
  console.log('\tmatrix set config <app> [k=v] -', 'configure an application variables'.grey)
  console.log('\n')
  process.exit(1);
}
