#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('set');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
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
    local2: {
      api: 'http://dev-demo.admobilize.com',
      mxss: 'http://localhost:3001'
    },
    dev: {
      api: 'http://dev-demo.admobilize.com',
      mxss: 'http://dev-mxss.admobilize.com',
      appsBucket: 'dev-admobilize-matrix-apps'
    },
    rc: {
      api: 'http://dev-demo.admobilize.com',
      mxss: 'http://rc-mxss.admobilize.com'
    },
    stage: {
      api: 'http://stage-api.admobilize.com',
      mxss: 'http://stage-mxss.admobilize.com'
    },
    production: {
      api: 'http://demo.admobilize.com',
      mxss: 'http://mxss.admobilize.com',
      appsBucket: 'admobilize-matrix-apps'
    },
    hardcode: {
      api: 'http://dev-demo.admobilize.com',
      mxss: 'http://104.197.139.81'
    }
  };

  if (Matrix.pkgs.indexOf('env') === 0) {

    var value = Matrix.pkgs[1];

    if (value && value.match(/sandbox|dev|stage|local|production|hardcode/)) {
      Matrix.config.environment = _.assign(environments[value], { name: value });
      Matrix.helpers.saveConfig(function () {
        console.log(t('matrix.set.env.env').grey + ':'.grey, Matrix.config.environment.name.green);
        // TODO: set-env [value] sets a environment on the Matrix
        //Matrix.validate.device(); //Make sure the user has logged in
      });
    } else {
      console.error(t('matrix.set.env.valid_environments') + ' = [ sandbox, production ]')
    }

  } else if (Matrix.pkgs.indexOf('config') === 0) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.validate.device(); //Make sure the user has logged in
    var appName = Matrix.pkgs[1];
    var configStr = Matrix.pkgs[2];
    var key, val;

    if (_.isUndefined(appName)) {
      console.warn(t('matrix.set.config.no_app') + ': `matrix set config <appName> [key=value]` ')
      process.exit(0);
    }

    if (!_.isUndefined(configStr) && configStr.match(/=/)) {
      // key=value
      key = configStr.split('=')[0].trim();
      val = configStr.split('=')[1].trim();
    } else {
      console.warn(t('matrix.set.config.no_key_value') + ': `matrix set config <appName> [key=value]`');
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

  } else if (Matrix.pkgs.indexOf('locale') === 0) {

    var locale = Matrix.pkgs[1];
    if (_.isUndefined(locale)) {
      console.warn(t('matrix.set.locale.locale_required') + ': `matrix set locale <locale>` ')
      process.exit(0);
    } else {
      var localesRegExp = new RegExp(Object.keys(locales).join('|'));

      if (locale && locale.match(localesRegExp)) {
        Matrix.config.locale = _.assign(locale, { "name": locale });
        Matrix.helpers.saveConfig(function () {
          console.log(t('matrix.set.locale.locale').grey + ':'.grey, Matrix.config.locale.green);
          process.exit(0);
        }); 
      } else {
        var validLocales = Object.keys(locales).join(', ');
        console.error(t('matrix.set.locale.valid_locales') + ' = [ ' + validLocales + ' ]');
        process.exit(0);
      }
    }

  } else {
    displayHelp();
  }

  function displayHelp() {

    console.log('\n> matrix set ¬\n');
    console.log('\t         matrix set env [env] -', t('matrix.set.help_device').grey + ' ( production | sandbox )'.grey)
    console.log('\t         matrix set config <app> [k=v] -', t('matrix.set.help_config').grey)
    console.log('\t         matrix set locale <locale> -', t('matrix.set.help_locale').grey)
    console.log('\n')
    process.exit(1);
  }

});
