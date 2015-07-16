/**
 * lib/app.js
 */

api = require('admatrix-node-sdk');
var program = require('commander');
var prompt = require('prompt');
prompt.message ='';
prompt.delimiter = '';

/**
Setup your local Matrix
DONE - matrix login -- stores key and secret of api in a file, when logging in /oauth2/*
DONE - matrix logout /oauth2/*

Device-Level
DONE - matrix list-devices -- shows devices under your account GET /device
DONE - matrix use device1 -- gets device token and stores locally -- stores locally /device/token

Matrix Console will use API, to deliver requests such as
DONE - matrix set-config POST /config?name=foo&val=bar
DONE - matrix set-env POST /env?name=foo&val=bar
DONE - matrix list-info GET /device?id=foo&token=foo
DONE - matrix list-config GET /config&token=foo
DONE - matrix list-apps GET/app&token=foo
DONE - matrix install app1 POST /app/install
DONE - matrix update app1 POST /app/update
DONE - matrix logs app1 GET/app/log?id=foo&token=foo
DONE - matrix uninstall app1 DELETE /app?id=foo
DONE - matrix reboot GET/device/reboot?token=foo
DONE - matrix shutdown GET/device/reboot?token=foo
matrix ssh

Deploy Apps
DONE - matrix deploy app1 POST /app/deploy
DONE - matrix start app1 POST /app/start
DONE - matrix stop app1 POST /app/stop
DONE - matrix restart app1 POST/app/restart
**/



program
.version( Matrix.config.version )
.description('\n'+

'\t-------------------------------------------------------------------------\n'+
'\t   ###    ########  ##     ##    ###    ######## ########  #### ##     ##\n'+
'\t  ## ##   ##     ## ###   ###   ## ##      ##    ##     ##  ##   ##   ## \n'+
'\t ##   ##  ##     ## #### ####  ##   ##     ##    ##     ##  ##    ## ##  \n'+
'\t##     ## ##     ## ## ### ## ##     ##    ##    ########   ##     ###   \n'+
'\t######### ##     ## ##     ## #########    ##    ##   ##    ##    ## ##  \n'+
'\t##     ## ##     ## ##     ## ##     ##    ##    ##    ##   ##   ##   ## \n'+
'\t##     ## ########  ##     ## ##     ##    ##    ##     ## #### ##     ##\n'+
'\t-------------------------------------------------------------------------\n'+
'\n'+
'\t\t\t     Welcome to the AdMatrix Console.');

/** Matrix - Login & Logout **/
program
  .command('login')
  .description('Log into the Matrix platform and see your available devices.')
  .action(function(){
      prompt.message = 'matrix login -- ';
      prompt.start();
      prompt.get(['email', 'password'], function (err, result) {
        if(err) process.exit(0);
        console.log('email: ' + result.email + ', password: ' + result.password);
        /** TODO :: Authenticate the user **/
      });
  });

/** Matrix - List Devices **/
program
  .command('list devices')
  .description('Get a list of devices.')
  .action(function(cmd){
    /** do nothing if not device **/
    if(cmd != 'devices') { } else {
      console.log('List of devices');
    }
  });

/** Matrix - Use Device **/
program
  .command('use <cmd>')
  .description('Options: [name] or [identifier] to interact with device.')
  .action(function(cmd){
    console.log(cmd);
    /** TODO :: Functionality to basically save the Device Token locally. **/ 
  });

/** Matrix - In App List **/
program
  .command('list <cmd>')
  .description('Options: [info, config, apps] once using a device.')
  .action(function(cmd){
    if(cmd === 'info') {
      console.log('Device info');
    }

    if(cmd === 'config') {
      console.log('config');
    }

    if(cmd === 'apps') {
      console.log('apps');
    }
  });

/** Matrix - In App List **/
program
  .command('set-env [value]')
  .description('Options: [development, staging, production]')
  .action(function(value){
    console.log('set environment', value);
  });

program
  .command('set-config [key=value]')
  .description('Options: [info, config, apps] once using a device.')
  .action(function(attrs){
    var opts = attrs.split('=');
    console.log('set config', opts);
  });

/** Matrix - In App - Install **/
program
  .command('install <app>')
  .description('Usage: install app1')
  .action(function(app){
    console.log('Installing', app + '...');
  });

/** Matrix - In App - Uninstall **/
program
  .command('uninstall <app>')
  .description('Usage: uninstall app1')
  .action(function(app){
    console.log('Uninstalling', app + '...');
  });

/** Matrix - In App - Uninstall **/
program
  .command('logs <app>')
  .description('Usage: logs app1')
  .action(function(app){
    console.log('Logs', app);
  });

/** Matrix - In App - Update the App or the Matrix **/
program
  .command('update [app] [version]')
  .description('Usage: update (matrix), update app1, update app1 v0.1')
  .action(function(app, version){
    if(app === undefined) {
       if(version === undefined) {
          console.log('Upgrading to latest version of Matrix');
          /** TODO :: Upgrade to latest version of Matrix **/
       } else {
          console.log('Upgrading to', version, 'of',app);
          /** TODO :: Upgrade Matrix **/
       }
    } else {
       if(version === undefined) {
          console.log('Upgrading to latest version of',app);
          /** TODO :: Upgrade to latest version of App **/
       } else {
          console.log('Upgrading to', version, 'of',app);
          /** TODO :: Upgrade Matrix **/
       }
    }
   
  });

/** Update the App or the Matrix **/
program
  .command('restart [app]')
  .description('Usage: restart (matrix), restart app1')
  .action(function(app){
    console.log('Restarting',app);
  });

/** Log out a user **/
program
  .command('logout')
  .description('Log out of all Matrix platform and devices.')
  .action(function(){
    console.log(Matrix.service.keepState.get());
  });

/** Update the App or the Matrix **/
program
  .command('reboot')
  .description('Reboots the Matrix.')
  .action(function(app){
    console.log('Restarting',app);
  });

/** Update the App or the Matrix **/
program
  .command('shutdown')
  .description('Shuts down the Matrix.')
  .action(function(app){
    console.log('Shutting down',app);
  });

/** App management **/
program
  .command('create <app>')
  .description('Creates a new scaffolding for a Matrix App.')
  .action(function(app){
    console.log('Shutting down',app);
  });

program
  .command('deploy <app>')
  .description('Shuts down the Matrix.')
  .action(function(app){
    console.log('Shutting down',app);
  });

program
  .command('publish <app> [version]')
  .description('Publishes a version of the App to the store.')
  .action(function(app){
    console.log('Shutting down',app);
  });

program
  .command('start <app>')
  .description('Starts an app running on the Matrix.')
  .action(function(app){
    console.log('Shutting down',app);
  });

program
  .command('stop <app>')
  .description('Stops an app running on the Matrix.')
  .action(function(app){
    console.log('Shutting down',app);
  });

program
  .command('restart <app>')
  .description('Restarts an app running on the Matrix.')
  .action(function(app){
    console.log('Shutting down',app);
  });

program.parse(process.argv);