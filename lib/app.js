/**
 * lib/app.js
 */

var program       = require('commander');
var prompt        = require('prompt');
var _             = require('lodash');
var colors        = require('colors/safe');
var fs            = require('fs');
var tar           = require('tar');
var fstream       = require('fstream');
Matrix.helpers    = require('../lib/helpers');

var options = {
  clientId: 'AdMobilizeAPIDev',
  clientSecret: 'AdMobilizeAPIDevSecret',
  apiUrl: process.env['ADMATRIX_API_SERVER'] || 'http://dev-demo.admobilize.com'
};

console.log('AdMatrix API Server: '.grey, options.apiUrl)

Matrix.api.makeUrls( options.apiUrl );

prompt.message    = '';
prompt.delimiter  = '';

Matrix.helpers.getConfig();

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
.description(colors.yellow(
'\t      Anyway this cake is great\n\t     It\'s so delicious and moist'+
'\n\n'+
'\t            ,:/+/-\n'+
'\t            /M/              .,-=;//;-\n'+
'\t       .:/= ;MH/,    ,=/+%$XH@MM#@:\n'+
'\t      -$##@+$###@H@MMM#######H:.    -/H#\n'+
'\t .,H@H@ X######@ -H#####@+-     -+H###@x\n'+
'\t  .,@##H;      +XM##M/,     =%@###@X;-\n'+
'\tX%-  :M##########$.    .:%M###@%:\n'+
'\tM##H,   +H@@@$/-.  ,;$M###@%,          -\n'+
'\tM###M=,,---,.-%%H####M$:           ,+@##\n'+
'\t@##################@/.          :%##@$-\n'+
'\tM################H,         ;HM##M$=\n'+
'\t##################.    .=$M##M$=\n'+
'\t#################H..;XM##M$=         .:+\n'+
'\tM####################@%=          =+@MH%\n'+
'\t@#################M/.         =+H#X%=\n'+
'\t=+M###############M,     -/X#X+;.\n'+
'\t  .;XM###########H=    ,/X#H+:,\n'+
'\t    .=+HM#######M+/+HM@+=.\n'+
'\t         ,:/%XM####H/.\n'+
'\t              ,.:=-.'
));

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
      Matrix.config.user = {
        username: result.username,
        password: result.password
      };

      /** set the client to empty **/
      Matrix.config.client = {}

      /** authenticate client and user **/
      Matrix.api.auth.client( options, function(err, out) {
        if(err) throw err;
        // set client token
        Matrix.api.client.setToken(out.access_token);
        Matrix.api.auth.user( Matrix.config.user, function(err, state){
          if (err) throw err;
          Matrix.config.user.token = state.access_token;
          Matrix.config.client.token = out.access_token;

          /** token stores, delete extra stuff **/
          delete Matrix.config.user.username;
          delete Matrix.config.user.password;
          Matrix.api.user.setToken(Matrix.config.user.token);
          Matrix.helpers.saveConfig();
          // set user token
        });
      });
      /** save the creds if it's good **/

    });
});

/** Matrix - List Devices **/
program
.command('list-groups')
.description('Get a list of groups.')
.action(function(){
  /** do nothing if not device **/
  Matrix.helpers.getConfig();
  Matrix.api.group.list(function(body){
    //print group
    console.log(Matrix.helpers.displayGroups(body));
  });
});

/** Matrix - List Devices **/
program
.command('list-devices [group]')
.description('Get a list of devices, by group (optional).')
.action(function(group){
  /** do nothing if not device **/
  Matrix.helpers.getConfig();
  if(group !== undefined) {
    // Matrix.api.user.setToken(Matrix.config.user.token);
    var options = { group: group };
    Matrix.api.device.list(options, function(body){
      //print device
      console.log(Matrix.helpers.displayDevices(body));
    });
  } else {
    Matrix.api.device.list({}, function(body){
      //print device
      console.log(Matrix.helpers.displayDevices(body));
    });
  }

});

/** Matrix - Use Device **/
program
.command('use <cmd>')
.description('Options: Use [name] or [identifier] to interact with device.')
.action(function(cmd){
  /** TODO :: Functionality to basically save the Device Token locally. **/

  Matrix.helpers.getConfig();
  Matrix.api.user.setToken(Matrix.config.user.token);

  var options = {
    deviceId: cmd
  }

  Matrix.config.device = {}
  Matrix.api.auth.device(options, function(state) {
    console.log('matrix use --', cmd);
    console.log('device token:', state.results.device_token);
    // Save the device token
    Matrix.config.device.identifier = cmd;
    Matrix.config.device.token = state.results.device_token;
    Matrix.helpers.saveConfig();
  });
});

/** Matrix - In App List **/
program
.command('list <cmd>')
.description('Options: [info, config, apps] once using a device.')
.action(function(cmd){
  if(cmd === 'info') {
    /** TODO :: Permanent Device Functionality **/
    Matrix.api.device.list(function(body){
      var output = _.filter(JSON.parse(body).results,{ 'deviceId': Matrix.config.device.identifier });
      delete output[0].user;
      delete output[0].campaign;
      delete output[0].deviceToken;
      delete output[0].assignDate;
      delete output[0].pusherEvent;
      delete output[0].location;
      console.log(Matrix.helpers.displayKeyValue(output[0]));
    });
  }

  if(cmd === 'config') {
    /** TODO :: Permanent Device Functionality **/
    Matrix.api.device.list(function(body){
      var output = _.filter(JSON.parse(body).results,{ 'deviceId': Matrix.config.device.identifier });
      /** TODO fix with real config **/
      var config = { KEY_1: 'Value 1', KEY_2: 'Value 2' };
      console.log(Matrix.helpers.displayKeyValue(config));
    });
  }

  if(cmd === 'apps') {
    // TODO: list apps - show a list of defined
    Matrix.api.app.list(function(err, resp){
      console.log('Installed Apps\n', resp + '...');
    });
  }
});

/** Matrix - In App List **/
program
.command('set-env [value]')
.description('Options: [development, staging, production]')
.action(function(value){
  Matrix.config.environment = value;
  Matrix.helpers.saveConfig();
  // TODO: set-env [value] set a environment on the AdMatrix
});

program
.command('set-config [key=value]')
.description('Options: [info, config, apps] once using a device.')
.action(function(attrs){
  var opts = attrs.split('=');
  Matrix.config.options[opt[0]] = opt[1];
  Matrix.helpers.saveConfig();
  // TODO: set-config [key=value] set a configuration option on the AdMatrix
});

/** Matrix - In App - Install **/
program
.command('install <app>')
.description('Usage: install app1')
.action(function(app){
  console.log('Installing', app + '...');
  Matrix.api.app.install(app, function(err, resp){
    if (err) console.error(err);
    console.log('Installed', app + '...');
    // TODO: install <app> - install an app on the admatrix
  });
});

/** Matrix - In App - Uninstall **/
program
  .command('uninstall <app>')
  .description('Usage: uninstall app1')
  .action(function(app){
    Matrix.api.app.uninstall(name, function(err, resp){
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
    // Matrix.api.device.reboot()
  });

/** App management **/
program
  .command('create <app>')
  .description('Creates a new scaffolding for a Matrix App.')
  .action(function(app){
    if ( _.isUndefined(app)){ return console.error('Must specify app name')}

    function onError(err) {
      console.error('An error occurred:', err)
    }

    function onEnd() {
      console.log('App Folder Created:>'.grey , app.green+'/'.grey)
    }

    var extractor = tar.Extract({path: process.cwd() + "/" + app})
      .on('error', onError)
      .on('end', onEnd);

    fs.createReadStream(__dirname + "/../baseapp.tar")
      .on('error', onError)
      .pipe(extractor);
    // unzip baseApp.zip to named folder
  });

// Run from current directory
program
  .command('deploy <dir>')
  .description('Deploys an app to the Matrix.')
  .action(function(dir){
      var pwd = process.cwd();
      var detectFile = 'pkg.yml';
      var tmp = __dirname + '/dir.tar';

      if ( !_.isUndefined(dir)){
        pwd += '/' + dir +'/';
      } else {
        // set name
        dir = require('path').basename(pwd);
      }

      console.log('Reading ', pwd);

      //TODO: IMPORTANT Make sure this file exists
      if ( !fs.existsSync(pwd + detectFile) ){
        return console.error('No ', detectFile, ' found');
      }

      var dirDest = fs.createWriteStream(tmp);

      function onError(err) {
        console.error('An error occurred:', err)
      }

      function onEnd() {
        console.log('Packed!');
        Matrix.api.app.deploy({ file: tmp, name: dir }, function(err, resp){
          if (err) console.error(err);
          console.log('wow!', resp);
        })
      }

      var packer = tar.Pack({ noProprietary: true })
        .on('error', onError)
        .on('end', onEnd);

      // This must be a "directory"
      fstream.Reader({ path: pwd, type: "Directory" })
        .on('error', onError)
        .pipe(packer)
        .pipe(dirDest)

      // upload zip
      // remove from tmp

    // Matrix.helpers.deploy(function(){
    //   // TODO: deploy <app> - creates a build as tar.gz, uploads to CDN, pushes to AdMatrix
    //   Matrix.api.app.deploy(name, function(err, resp){
    //     // TODO: deploy <app> - uninstall an app on the admatrix
    //   });
    // });
  });

program
  .command('publish <app> [version]')
  .description('Publishes a version of the App to the store.')
  .action(function(app, version){
    console.log('Shutting down',app);
    Matrix.api.app.publish(app, version, function(err, res){

    });
  });

program
  .command('start <app>')
  .description('Starts an app running on the Matrix.')
  .action(function(app){
    console.log('Starting: ',app);
    Matrix.api.app.start(app, function(err, res){
      console.log('Started: ',app, res);
    })
  });

program
  .command('stop <app>')
  .description('Stops an app running on the Matrix.')
  .action(function(app){
    console.log('Stopping: ',app);
    Matrix.api.app.stop(app, function(err, res){
      console.log('Stopped:', app, res);
    });
  });

program
  .command('restart <app>')
  .description('Restarts an app running on the Matrix.')
  .action(function(app){
    console.log('Restarting: ',app);
    Matrix.api.app.restart(app, function(err, res){
      console.log('Restarted:', app, res);
    });
  });

program.parse(process.argv);
