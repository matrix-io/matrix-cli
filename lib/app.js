/**
 * lib/app.js
 */

api = require('admatrix-node-sdk');
var program = require('commander');

/**
Setup your local Matrix
matrix login -- stores key and secret of api in a file, when logging in /oauth2/*
matrix logout /oauth2/*

matrix list-devices -- shows devices under your account GET /device
matrix use device1 -- gets device token and stores locally -- stores locally /device/token
Matrix Console will use API, to deliver requests such as
matrix set-config POST /config?name=foo&val=bar
matrix set-env POST /env?name=foo&val=bar
matrix list-info GET /device?id=foo&token=foo
matrix list-config GET /config&token=foo
matrix list-apps GET/app&token=foo
matrix install app1 POST /app/install
matrix update app1 POST /app/update
matrix logs app1 GET/app/log?id=foo&token=foo
matrix uninstall app1 DELETE /app?id=foo
matrix reboot GET/device/reboot?token=foo
matrix shutdown GET/device/reboot?token=foo
matrix ssh
Deploy Apps
matrix deploy app1 POST /app/deploy
matrix start app1 POST /app/start
matrix stop app1 POST /app/stop
**/

program
.version( '1.0' )

program
  .command('ping <cmd>')
  .description('Manages heartbeat')
  .action(function(cmd) {
    Matrix.service.heartbeat[cmd]();
  });

/** login & logout **/
program
  .command('login')
  .description('Spits out state info')
  .action(function(){
    console.log(Matrix.service.keepState.get());
  });

program
  .command('logout')
  .description('Spits out state info')
  .action(function(){
    console.log(Matrix.service.keepState.get());
  });

/** list **/
program
  .command('list <cmd>')
  .description('list info, config, devices, apps')
  .action(function(cmd){
    if(cmd === 'info') {
      console.log('info');
    }

    if(cmd === 'config') {
      console.log('config');
    }

    if(cmd === 'devices') {
      console.log('devices');
    }

    if(cmd === 'apps') {
      console.log('apps');
    }
  });

program
  .command('use <cmd>')
  .description('Input the [name] or [identifier] of the device')
  .action(function(cmd){
    console.log(cmd);
  });

program
  .command('sensor-fake [which]')
  .description('make some fake data')
  .action(function(opt){
    Matrix.sensors[opt].faker();
  });

program.parse(process.argv);