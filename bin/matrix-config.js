#!/usr/bin/env node

require('./matrix-init');

var program = require('commander');
var firebase = require('matrix-firebase');

var debug = debugLog('config');

program
.parse(process.argv);

var pkgs = program.args;



if ( _.isUndefined(Matrix, 'config.user.token') ){
  return console.error('No user logged in. Please `matrix login`')
}

if (_.isUndefined(Matrix.config.device.identifier)) {
  console.warn('No Device Set. Use `matrix use`.')
  process.exit(0);
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

    if ( pkgs.match(/(--help|-h)/) ){
      showHelp();
    } else
    // show matrix config
    if ( pkgs.length === 0 ){
      // get form

      console.log('Config for device', Matrix.config.device.identifier);

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
      debug('Firebase:'.blue, target)
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
  console.log('\t         matrix config -', 'get device configurations'.grey)
  console.log('\tmatrix config <appName> -', 'get application configurations'.grey)
  console.log('\tmatrix config <appName> <key> -', 'get application configuration key'.grey)
  console.log('\tmatrix config <appName> <key> <value> -', 'set application configuration key value'.grey)
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
