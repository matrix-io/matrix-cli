#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('set');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var i = Matrix.localization.get;

  program
    .parse(process.argv);

  var pkgs = program.args;

  if (!pkgs.length) {
    showHelp();
  }

  var locales = {
    "en": {
      name: "English"
    },
    "es": {
      name: "Spanish"
    }
  };

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
      Matrix.config.environment = _.assign(environments[value], { name: value });
      Matrix.helpers.saveConfig();
      console.log(i('matrix.set.env.env').grey + ':'.grey, Matrix.config.environment.name.green);
      // TODO: set-env [value] sets a environment on the Matrix
      if (_.isUndefined(Matrix.config.device.identifier)) {
        console.log(i('matrix.set.env.no_device').red, '\n' + i('matrix.set.env.select_device').grey, 'matrix use {deviceid}')
      }
    } else {
      console.error(i('matrix.set.env.valid_environments') + ' = [ sandbox, production ]')
    }

  } else if (pkgs.indexOf('config') === 0) {
    var appName = pkgs[1];
    var configStr = pkgs[2];
    var key, val;

    if (_.isUndefined(Matrix.config.device.identifier)) {
      console.warn(i('matrix.set.config.no_device') + ' `matrix use`.');
      process.exit(0);
    }

    if (_.isUndefined(appName)) {
      console.warn(i('matrix.set.config.no_app') + ': `matrix set config <appName> [key=value]` ')
      process.exit(0);
    }

    if (!_.isUndefined(configStr) && configStr.match(/=/)) {
      // key=value
      key = configStr.split('=')[0].trim();
      val = configStr.split('=')[1].trim();
    } else {
      console.warn(i('matrix.set.config.no_key_value') + ': `matrix set config <appName> [key=value]`');
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

    Matrix.api.app.configure(options, function (err, resp) {
      if (err) console.error(err);
      console.log('[' + options.deviceId + '](' + options.name + ')', options.key, '=', options.value);
      setTimeout(process.exit, 1000);
    });

  } else if (pkgs.indexOf('locale') === 0) {

    var locale = pkgs[1];
    if (_.isUndefined(locale)) {
      console.warn(i('matrix.set.locale.locale_required') + ': `matrix set locale <locale>` ')
      process.exit(0);
    } else {
      var localesRegExp = new RegExp(Object.keys(locales).join('|'));
      
      if (locale && locale.match(localesRegExp)) {
        Matrix.config.locale = _.assign(locale, { "name": locale });
        Matrix.helpers.saveConfig();
        console.log(i('matrix.set.locale.locale').grey + ':'.grey, Matrix.config.locale.green);
      } else {
        var validLocales = Object.keys(locales).join(', ');
        console.error(i('matrix.set.locale.valid_locales') + ' = [ ' + validLocales + ' ]');
      }
    }

  } else {
    showHelp();
  }

  function showHelp() {

    console.log('\n> matrix set ¬\n');
    console.log('\t         matrix set env [env] -', i('matrix.set.help_device').grey + ' ( production | sandbox )'.grey)
    console.log('\t         matrix set config <app> [k=v] -', i('matrix.set.help_config').grey)
    console.log('\t         matrix set locale <locale> -', i('matrix.set.help_locale').grey)
    console.log('\n')
    process.exit(1);
  }
});