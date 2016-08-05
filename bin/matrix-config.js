#!/usr/bin/env node

require('./matrix-init');

var program = require('commander');
var firebase = require('matrix-firebase');

var debug = debugLog('config');

program
.parse(process.argv);

var pkgs = program.args;



if ( _.isUndefined(Matrix, 'config.user.token') ){
  return console.error(i('matrix.please_login') + ' `matrix login`'.grey);
}

if (_.isUndefined(Matrix.config.device.identifier)) {
  console.warn(i('matrix.set_device') + ' `matrix use`'.grey);
  process.exit(0);
}

if ( _.isEmpty(pkgs) ) {
  return showHelp();
}

firebase.init(
  Matrix.config.user.id,
  Matrix.config.device.identifier,
  Matrix.config.user.token,
  function (err){
    if (err) return console.error(err);

    var options = {};

    if ( pkgs.indexOf('-w') > -1 || pkgs.indexOf('--watch') > -1){
      options.watch = true;
      _.omit(pkgs, '-w', '--watch')
    }

    if ( pkgs.indexOf('--help') > -1 || pkgs.indexOf('-h') > -1 ){
      showHelp();
    } else
    // show matrix config
    if ( pkgs.length === 0 ){
      // get form

      console.log(i('matrix.config.device_config') + ' ', Matrix.config.device.identifier);

      firebase.device.get(handleResponse);

      // matrix config base
    } else if ( pkgs.length === 1 ){

      var target = pkgs[0]
      firebase.app.get( target, handleResponse);
      // matrix config base services.vehicle.engine

            if(options.watch){
              firebase.app.onChange( target, handleResponse )
            }

    } else if (pkgs.length === 2){
      // get deep

      var key = pkgs[1];
      var target = pkgs[0]+'/'+ key.replace(/\./g,'/');
      debug('Firebase: '.blue, target)
      firebase.app.get( target, handleResponse )

      if(options.watch){
        firebase.app.onChange( target, handleResponse )
      }
      // matrix config base keywords=test,keyword
    } else if (pkgs.length >= 3){
      var key = pkgs[1];
      var value = pkgs[2];

      //typing
      if ( pkgs.length > 4 ){
        //string
        value = _.drop( pkgs, 2 ).join(' ');
      } else {
        // is array?
        if ( value.indexOf(',') > -1 ){
          value = value.split(',');
        }
      }

      var target = pkgs[0]+'/'+ key.replace(/\./g,'/');

      debug(target, value);

      firebase.app.set(target, value);

    } else {
      showHelp();
    }
});

function handleResponse(err, app){
  if (err) return console.error(err);

  console.log(require('util').inspect(app, {depth: 3, colors:true}));

}


function showHelp() {

  console.log('\n> matrix config ¬\n');
  console.log('\t         matrix config -', i('matrix.config.help').grey)
  console.log('\tmatrix config <appName> -', i('matrix.config.help_app').grey)
  console.log('\tmatrix config <appName> <key> -', i('matrix.config.help_app_key').grey)
  console.log('\tmatrix config <appName> <key> <value> -', i('matrix.config.help_app_key_value').grey)
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
