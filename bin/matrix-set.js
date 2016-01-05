#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);

var pkgs = program.args;

if (!pkgs.length) {
  console.log('\n> matrix set ¬\n');
  console.log('\t         matrix set env -', 'set device environment'.grey)
  console.log('\tmatrix set config <app> [k=v] -', 'configure an application variables'.grey)
  console.log('\t    matrix list groups -', 'display groups of devices'.grey)
  console.log('\n')
  process.exit(1);
}

if (pkgs.indexOf('env') === 0) {

  var value = pkgs[1];

  if (value.match(/development|staging|production/)){
    Matrix.config.environment = value;
    Matrix.helpers.saveConfig();
    // TODO: set-env [value] set a environment on the AdMatrix
    console.log('Env:', Matrix.config.environment );
  } else {
    console.error('Valid Environments = [ development, staging, production ]')
  }

} else if (pkgs.indexOf('config') === 0) {
  var appName = pkgs[1];
  var configStr = pkgs[2];
  var key, val;

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

  var group = pkgs[2];
  /** do nothing if not device **/
  Matrix.helpers.getConfig();
  if (group !== undefined) {
    // Matrix.api.user.setToken(Matrix.config.user.token);
    var options = {
      group: group
    };
    Matrix.api.device.list(options, function(body) {
      //print device
      console.log(Matrix.helpers.displayDevices(body));
    });
  } else {
    Matrix.api.device.list({}, function(body) {
      //print device
      console.log(Matrix.helpers.displayDevices(body));
    });
  }

} else if (pkgs.indexOf('group') > -1) {

  /** do nothing if not device **/
  Matrix.helpers.getConfig();
  Matrix.api.group.list(function(body) {
    //print group
    console.log(Matrix.helpers.displayGroups(body));
  });

}
