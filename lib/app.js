/**
 * lib/app.js
 */

api               = require('admatrix-node-sdk');
var program       = require('commander');
var prompt        = require('prompt');
var _             = require('lodash');
var fs            = require('fs');

var options = {
  clientId: 'AdMobilizeAPIDev',
  clientSecret: 'AdMobilizeAPIDevSecret',
  apiUrl: 'http://dev-demo.admobilize.com'
};

api.makeUrls( 'http://dev-demo.admobilize.com' );

prompt.message    = '';
prompt.delimiter  = '';

getConfig();

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
.version( Matrix.version )
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
      prompt.get(['username', 'password'], function (err, result) {
        if (err) throw err;

        /** set the creds **/
        Matrix.config.credentials = {
          username: result.username,
          password: result.password
        };

        /** authenticate client and user **/
        api.auth.client( options, function(err, out) {
          api.auth.user( Matrix.config.credentials, function(err, state){
            if (err) throw err;
            Matrix.config.credentials.access_token = state.access_token;
            saveConfig();
          });
        } );
        /** save the creds if it's good **/
        
      });
  });

/** Matrix - List Devices **/
program
  .command('list-devices')
  .description('Get a list of devices.')
  .action(function(cmd){
    /** do nothing if not device **/
    api.user.getToken();
    api.device.get();
  });

/** Matrix - Use Device **/
program
  .command('use <cmd>')
  .description('Options: Use [name] or [identifier] to interact with device.')
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
      getConfig();
      console.log('config', Matrix.config);

    }

    if(cmd === 'apps') {
      console.log('apps');
      // TODO: list apps - show a list of defined 
      api.app.list(function(err, resp){
        console.log('Installed Apps\n', resp + '...');
      });
    }
  });

/** Matrix - In App List **/
program
  .command('set-env [value]')
  .description('Options: [development, staging, production]')
  .action(function(value){
    console.log('set environment', value);
    Matrix.config.environment = value;
    saveConfig();
    // TODO: set-env [value] set a environment on the AdMatrix
  });

program
  .command('set-config [key=value]')
  .description('Options: [info, config, apps] once using a device.')
  .action(function(attrs){
    var opts = attrs.split('=');
    console.log('set config', opts);
    Matrix.config.options[opt[0]] = opt[1];
    saveConfig();
    // TODO: set-config [key=value] set a configuration option on the AdMatrix
  });

/** Matrix - In App - Install **/
program
  .command('install <app>')
  .description('Usage: install app1')
  .action(function(app){
    console.log('Installing', app + '...');
    api.app.install(name, function(err, resp){
      console.log('Installed', app + '...');
      // TODO: install <app> - install an app on the admatrix
    });
  });

/** Matrix - In App - Uninstall **/
program
  .command('uninstall <app>')
  .description('Usage: uninstall app1')
  .action(function(app){
    api.app.uninstall(name, function(err, resp){
      // TODO: uninstall <app> - uninstall an app on the admatrix
    });
  });

/** Matrix - In App - Uninstall **/
program
  .command('logs <app>')
  .description('Usage: logs app1')
  .action(function(app){
    // TODO: logs <app> - pull logs from logentries
  });

/** Matrix - In App - Update the App or the Matrix **/
program
  .command('update <app> [version]')
  .description('Usage: update (matrix), update app1, update app1 v0.1')
  .action(function(app, version){
    if(app === undefined) {
       if(version === undefined) {
          console.log('Upgrading to latest version of Matrix');
          // TODO: update <app> [version] - Upgrade to latest version of Matrix
       } else {
          console.log('Upgrading to', version, 'of',app);
          // TODO: update <app> [version] - Upgrade Matrix
       }
    } else {
       if(version === undefined) {
          console.log('Upgrading to latest version of',app);
          // TODO: update <app> [version] - Upgrade to latest version of App
       } else {
          console.log('Upgrading to', version, 'of',app);
          // TODO: update <app> [version] - Upgrade Matrix
       }
    }

  });

/** Log out a user **/
program
  .command('logout')
  .description('Log out of all Matrix platform and devices.')
  .action(function(){
    // TODO: logout - delete the local credentials
  });

/** Update the App or the Matrix **/
program
  .command('reboot')
  .description('Reboots the Matrix.')
  .action(function(){
    // TODO: reboot - Trigger reboot on the AdMatrix
    // api.device.reboot()
  });

/** App management **/
program
  .command('create <app>')
  .description('Creates a new scaffolding for a Matrix App.')
  .action(function(app){
    // TODO: create <app> - Generate a local example of an App
  });

program
  .command('deploy <app>')
  .description('Deploys an app to the Matrix.')
  .action(function(app){
    // TODO: deploy <app> - creates a build as tar.gz, uploads to CDN, pushes to AdMatrix
    // TODO: deploy <app> - Trigger event to deploy to AdMatrix
    // api.post('/v1/app/deploy', app, function(err, res){ });
  });

program
  .command('publish <app> [version]')
  .description('Publishes a version of the App to the store.')
  .action(function(app){
    console.log('Shutting down',app);
    api.app.publish(app, function(err, res){

    });
  });

program
  .command('start <app>')
  .description('Starts an app running on the Matrix.')
  .action(function(app){
    console.log('Starting: ',app);
    api.app.start(app, function(err, res){
      console.log('Started: ',app, res);
    })
  });

program
  .command('stop <app>')
  .description('Stops an app running on the Matrix.')
  .action(function(app){
    console.log('Stopping: ',app);
    api.app.stop(app, function(err, res){
      console.log('Stopped:', app, res);
    });
  });

program
  .command('restart <app>')
  .description('Restarts an app running on the Matrix.')
  .action(function(app){
    console.log('Restarting: ',app);
    api.app.restart(app, function(err, res){
      console.log('Restarted:', app, res);
    });
  });

program.parse(process.argv);

/** Helpers **/

function saveConfig(){
  console.log('This is the matrix config', Matrix.config);
  fs.writeFileSync(__dirname + '/../tmp/store.json', JSON.stringify(Matrix.config));
}

function getConfig(){
  // See if we have existing creds on file
  if ( fs.existsSync(__dirname + '/../tmp/store.json')){
    Matrix.config = JSON.parse(fs.readFileSync(__dirname + '/../tmp/store.json'));
    api.user.setToken(Matrix.config.credentials.access_token);
  } else {
    console.log('Please `matrix login` to set configuration');
    Matrix.config = {};
  }
}
