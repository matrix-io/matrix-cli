#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var firebase = require('matrix-firebase');
var debug = debugLog('config');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  program
  .parse(process.argv);

  var pkgs = program.args;

  // log(pkgs, pkgs.length)

  if (_.isUndefined(Matrix, 'config.user.token')) {
    return console.error(t('matrix.please_login') + ' `matrix register`'.grey);
  }

  if (_.isUndefined(Matrix.config.device.identifier)) {
    console.warn(t('matrix.set_device') + ' `matrix use`'.grey);
    process.exit(0);
  }

  firebase.init(
    Matrix.config.user.id,
    Matrix.config.device.identifier,
    Matrix.config.user.token,
    function (err) {
      if (err) {
        if (err.code === "EXPIRED_TOKEN"){
           console.error(t('matrix.expired'))
        } else {
          console.error(err);
        }
         process.exit();
      }

      var options = {};

      var target = pkgs[0];
      var key = pkgs[1];
      // normalize a.b.c for firebase a/b/c

      if ( !_.isUndefined(key)){
        key = key.replace(/\./g, '/');
      }
      var value = pkgs[2];

      // split on = if exists
      if ( !_.isUndefined(key) && key.indexOf('=') > -1 ){
        value = key.split('=')[1];
        key = key.split('=')[0];
      }

      //split up commas
      if (!_.isUndefined(value) && value.indexOf(',') > -1 ) {
        // is an array
        value = value.split(',');
      }

      console.log('App Path:'.blue, _.compact([ target, key, value ]).join('/').grey)

      if (pkgs.indexOf('--watch') > -1 || pkgs.indexOf('-w') > -1) {
        options.watch = true;
      }

      if (pkgs.indexOf('--help') > -1 || pkgs.indexOf('-h') > -1) {
        showHelp();
      } else if (_.isUndefined(target)) {
        // get form

        console.log(t('matrix.config.device_config') + ' ', Matrix.config.device.identifier);

        firebase.device.getConfig(handleResponse);

        // matrix config base
      } else if (_.isUndefined(key)) {

        firebase.app.getIDForName( target, function(err, appId){
          if (err) return console.error(err);
          debug('appId>', appId);
          firebase.app.getConfig(appId, handleResponse);
        })

      } else if (_.isUndefined(value)){
        // get deep
        //
        key = '/' + key.replace(/\./g, '/');
        debug('Firebase: '.blue, target)
        firebase.app.getIDForName( target, function(err, appId){
          if (err) return console.error(err);
          debug('appId>', appId);
          firebase.app.getConfigKey(appId, key, handleResponse);
        })

        // matrix config base keywords=test,keyword
      } else {

        debug('>>>',target, value);

        firebase.app.getIDForName( target, function(err, appId){
          if (err) return console.error(err);
          debug('appId>', appId);
          console.log('Application', target, '\nconfig value:', key, '\nupdate:', value)
          firebase.app.setConfigKey(appId, key, value, function(){
            process.exit(0);
          });
        })

      }
    });


    function handleResponse(err, app){
      if (err) return console.error(t('matrix.helpers.config_error'), err);
      if (_.isNull(app)){ console.error( t('matrix.helpers.config_error'), app) }
      console.log(require('util').inspect(app, {depth: 3, colors:true}));
      process.exit();
    }


    function showHelp() {

      console.log('\n> matrix config ¬\n');
      console.log('\t         matrix config -', t('matrix.config.help').grey)
      console.log('\tmatrix config <appName> -', t('matrix.config.help_app').grey)
      console.log('\tmatrix config <appName> <key> -', t('matrix.config.help_app_key').grey)
      console.log('\tmatrix config <appName> <key> <value> -', t('matrix.config.help_app_key_value').grey)
      console.log('\n')
      process.exit(1);
    }
    //
    //
    //
    // var appName = pkgs[1];
    // var configStr = pkgs[2];
    // var key, val;
    //
    //
    // if (_.isUndefined(appName)) {
    //   console.warn('App Name Required: `matrix set config <appName> [key=value]` ')
    //   process.exit(0);
    // }
    //
    // if (!_.isUndefined(configStr) && configStr.match(/=/)) {
    //   // key=value
    //   key = configStr.split('=')[0].trim();
    //   val = configStr.split('=')[1].trim();
    // } else {
    //   console.warn('Must supply key and value: `matrix set config <appName> [key=value]`');
    //   process.exit(0);
    // }
    //
    // // validate keys
    // key = _.snakeCase(key.toLowerCase());
    //
    // var options = {
    //   deviceId: Matrix.config.device.id,
    //   name: appName,
    //   key: key,
    //   value: val
    // }
    //
    // Matrix.api.app.configure(options, function(err, resp) {
    //   if (err) console.error(err);
    //   console.log('[' + options.deviceId + '](' + options.name + ')', options.key, '=', options.value);
    //   setTimeout(process.exit, 1000);
    // });
  });
