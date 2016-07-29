#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);

var pkgs = program.args;

if (!pkgs.length) {
  showHelp();
}

var locales = [
  "en",
  "es"
];

var environments = {
  local: {
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://localhost:3000'
  },
  dev: {
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://dev-mxss.admobilize.com:80'
  },
  stage: {
    api: 'http://stage-api.admobilize.com',
    mxss: 'http://stage-mxss.admobilize.com:80'
  },
  production: {
    api: 'http://demo.admobilize.com',
    mxss: 'http://mxss.admobilize.com:80'
  },
  hardcode: {
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://104.196.123.3:80'
  }
};

if (pkgs.indexOf('env') === 0) {

  var value = pkgs[1];

  if (value && value.match(/sandbox|dev|stage|local|production|hardcode/)) {
    Matrix.config.environment = _.assign(environments[value], {name: value});
    Matrix.helpers.saveConfig();
    console.log('Env:'.grey, Matrix.config.environment.name.green);
    // TODO: set-env [value] sets a environment on the Matrix
    if ( _.isUndefined(Matrix.config.device.identifier) ) {
      console.log('No Device Selected'.red, '\nSelect an Active Device with'.grey,'matrix use {deviceid}')
    }
} else {
  console.error('Valid Environments = [ sandbox, production ]')
}

} else if (pkgs.indexOf('config') === 0) {
  var appName = pkgs[1];
  var configStr = pkgs[2];
  var key, val;

  if (_.isUndefined(Matrix.config.device.identifier)) {
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

} else if (pkgs.indexOf('locale') === 0) {

  var locale = pkgs[1];

  var localesRegExp = new RegExp(locales.join('|'));
  
  if (locale && locale.match(localesRegExp)) {
    Matrix.config.locale = _.assign(locale, { "name": locale });
    Matrix.helpers.saveConfig();
    console.log('Locale:'.grey, Matrix.config.locale.green);
  } else {
    var validLocales = locales.join(', ');
    console.error('Valid locales = [ ' + validLocales + ' ]')
  }

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
