/**
* lib/app.js
*/
var program = require('commander');
var prompt = require('prompt');
var _ = require('lodash');
var colors = require('colors/safe');
var fs = require('fs');
var tar = require('tar');
var fstream = require('fstream');

var debug = debugLog('sdk')

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

// base cmd
//
// program
//   .version(Matrix.version)
//   .description(colors.yellow(
//     '\t      Anyway this cake is great\n\t     It\'s so delicious and moist' +
//     '\n\n' +
//     '\t            ,:/+/-\n' +
//     '\t            /M/              .,-=;//;-\n' +
//     '\t       .:/= ;MH/,    ,=/+%$XH@MM#@:\n' +
//     '\t      -$##@+$###@H@MMM#######H:.    -/H#\n' +
//     '\t .,H@H@ X######@ -H#####@+-     -+H###@x\n' +
//     '\t  .,@##H;      +XM##M/,     =%@###@X;-\n' +
//     '\tX%-  :M##########$.    .:%M###@%:\n' +
//     '\tM##H,   +H@@@$/-.  ,;$M###@%,          -\n' +
//     '\tM###M=,,---,.-%%H####M$:           ,+@##\n' +
//     '\t@##################@/.          :%##@$-\n' +
//     '\tM################H,         ;HM##M$=\n' +
//     '\t##################.    .=$M##M$=\n' +
//     '\t#################H..;XM##M$=         .:+\n' +
//     '\tM####################@%=          =+@MH%\n' +
//     '\t@#################M/.         =+H#X%=\n' +
//     '\t=+M###############M,     -/X#X+;.\n' +
//     '\t  .;XM###########H=    ,/X#H+:,\n' +
//     '\t    .=+HM#######M+/+HM@+=.\n' +
//     '\t         ,:/%XM####H/.\n' +
//     '\t              ,.:=-.'
//   ));
//

program.command('Setup')
program.command('login', 'Log into the MATRIX platform'.grey);
program.command('logout')
.description('Log out of all MATRIX platform and devices.')
.action(function() {
  Matrix.helpers.removeConfig(function(err){
    console.log('Logged Out Successfully'.green);
  });
});

program.command('use', 'Indicate active device'.grey);
program.command('set [target]', 'set environment settings, update application configuration\n[env <environment>, config <app> k=v]'.grey)

program.command('Management')
program.command('sim [target]', 'manage local MatrixOS simulator using docker\n[ init, start, clear ]' )
program.command('list [target]', 'information about your MatrixOS devices, applications and installations\n[ apps, devices, all, groups ] '.grey)

/** Update the App or the Matrix **/
program
.command('reboot')
.description('Reboots the MATRIX.')
.action(function() {
  // TODO: reboot - Trigger reboot on the AdMatrix
  Matrix.api.device.reboot(Matrix.config.device.identifier, function(err) {
    console.log('Device Rebooting');
    process.exit();
  });
});



//
program.command('config').description('list out configuration object')
.action(function(){
  console.log(Matrix.config)
});

program.command('Apps');
program.command('search', 'Search for apps'.grey);
program.command('install').description('[-a] app and [-s] sensor install. defaults to app'.grey)
.option('-s, --sensors')
.option('-a,--app')
.action(function(name, o) {
  if (!_.isUndefined(o) && o.sensors === true) {
    //sensor install
    console.warn('sensor not implemented yet');
  } else {
    // application install
    // TODO: ensure if file is not found, we're hitting api directory
    // console.log('Installing app', name)
    Matrix.api.app.install(name, Matrix.config.device.identifier, function(err, resp) {
      if (err) console.error(err);
      console.log('Installed'.yellow, name);
      debug(resp);

      //manage api records
      Matrix.api.app.assign( name, function (err, resp) {
        if (err) return console.error(err);
        debug('App Assigned to', Matrix.config.device.identifier );
        process.exit();
      });
    });
  }
});


program.command('update <app> [version]', 'Update, update app1, update app1 v0.1'.grey)

// /** Matrix - In App - Uninstall **/
program
.command('uninstall <app>')
.description('Usage: uninstall app1')
.action(function(name) {
  Matrix.api.app.uninstall(name, Matrix.config.device.identifier, function(err, resp) {
    if (err) console.error(err);
    console.log('Uninstalled', name + '...');
    process.exit();
  });
});


program
.command('start [app]')
.description('Starts an app running on the MATRIX.')
.option('-a, --all')
.action(function(app, options) {
  if (options.all){
    //FIXME: hacky
    app = 'all-applications'
  }
  console.log('Starting: ', app);
  Matrix.api.app.start(app, Matrix.config.device.identifier, function(err, res) {
    if (err) return console.log(err);
    console.log('Started: ', app);
    endIt();
  });
});
//
program
.command('stop [app]')
.description('Stops an app running on the MATRIX.')
.option('-a, --all')
.action(function(app, options) {
  console.log('Stopping: ', app);
  if (options.all){
    //FIXME: hacky
    app = 'all-applications'
  }
  Matrix.api.app.stop(app, Matrix.config.device.identifier, function(err) {
    console.log('Stopped:', app);
    endIt();
  });
});
//
program
.command('restart <app>')
.description('Restarts an app running on the MATRIX.')
.action(function(app) {
  console.log('Restarting: ', app);
  Matrix.api.app.restart(app, function(err, res) {
    console.log('Restarted:', app, res);
    endIt();
  });
});

program.command('development');

//
/** App management **/
program.command('create <app>', 'Creates a new scaffolding for a MATRIX App.')
//
// // Run from current directory
program.command('deploy <dir>', 'Deploys an app to the Matrix.')
//
// program
// .command('publish <app> [version]')
// .description('Publishes a version of the App to the store.')
// .action(function(app, version) {
//   console.log('Shutting down', app);
//   Matrix.api.app.publish(app, version, function(err, res) {
//
//   });
// });
//
//
program
.command('trigger <string>')
.description('Runs a trigger test')
.action(function(data) {
  Matrix.api.app.trigger(Matrix.config.device.identifier, data, function(err) {
    console.error(err);
    endIt();
  });
})


// /** Matrix - In App - Uninstall **/
program
.command('log')
.option('-f, --follow', 'Follow the log')
.description('Usage: log [-f, --follow]')
.action(function(option) {

  // if (option.follow)
  var options = {};
  options.deviceId = Matrix.config.device.identifier;

  var eq = '=';
  for (var i = 1; i < process.stdout.columns; i++) {
    eq += '=';
  }

  console.log(eq.grey);

  Matrix.api.app.log(options, function(err, log) {
    if (err) console.error(err);
    console.log(log.payload);
    if (!option.follow) {
      // process.exit();
    }
  });
});
//

//
// debug(process, '================', program);



// Main Programs
var commandList = _.map(program.commands, function(p) {
  return p._name;
});


  // strip out -h / --help
  _.pull( process.argv, [ '-h', '--h', '--help' ]);

  // nonsensically complicated way to override the help text
  if (process.argv.length === 2 || commandList.indexOf(process.argv[2]) === -1) {


    var helps = program.helpInformation().split('\n');

    // slice off remaining text + options
    var help = helps.slice(0, helps.length - (6 + program.options.length));
    // // console.log(cake.join('\n'));
    // console.log(helps);


    if (_.has(Matrix.config, 'environment.name')){
      var env = ' - '.grey + Matrix.config.environment.name.grey;
    }

    console.log('\n')
    console.log(_.repeat(' ', 10), '_  _ ____ ___ ____ _ _  _')
    console.log(_.repeat(' ', 10), '|\\/| |__|  |  |__/ |  \\/   _ |', '[o]'.grey )
    console.log(_.repeat(' ', 10), '|  | |  |  |  |  \\ | _/\\_ |_ |_ |',
    'v'.grey + Matrix.version.grey, (env || '') );

    // console.log(_.repeat('[..]', 20))
    console.log('\n')

    var log = [];

    // TODO: Should we start with API? only if not logged in
    log.push('API: '.grey + Matrix.options.apiUrl, 'Streaming: '.grey + Matrix.options.mxssUrl);


    if (!_.isEmpty(Matrix.config.user)) {
      log.push('\nUser:'.grey, Matrix.config.user.username);
    }
    if (!_.isEmpty(Matrix.config.device)) {
      log.push('Device:'.grey, Matrix.config.device.identifier);
    }

    // TODO: add support for active group

    console.log(log.join(' '.blue))
    console.log('\n')

    help.forEach(function(l, i) {
      // console.log(l);
      if (i > 5) {
        var splitIndex = l.lastIndexOf('  ');
        var command = l.slice(splitIndex, l.length).trim();
        var desc = l.slice(0, splitIndex).trim();
        if ( !_.isEmpty(desc) || command.length > desc.length ){
          // wtf is going on?
          var cmd = command;
          command = desc;
          desc = cmd;
        }
        if ( command.match(/config/) ){
          return;
        }
        var pad = 26 - command.length;
        if ( _.isEmpty(desc) ){
          // section markets
          var l = command.length;
          var r = Math.floor((26 - l)/2);
          console.log( '\n', _.repeat('-', r).grey,  command.toUpperCase(),  _.repeat('-', r).grey)
        } else {
        console.log(_.repeat(' ', pad), command, ( _.isEmpty(command) ) ? '↳'.grey : '-', desc.grey);
      }
      }
    });



    if (process.argv.length === 3) {
      var snark = [
        'You\'re not very good at this.',
        'Try again. Little train right?',
        'You can DO THIS.',
        'Above is some helpful reference material.',
        'Have you been sleeping at your desk?',
        'Your finger must have slipped.',
        'There ARE alot of words to remember.',
        'Have you had your coffee yet?',
        'Don\'t let your dreams be dreams!',
        // jeje matrix snark
        'Difference between knowing and walking the path.'
      ]
      console.log('\n', process.argv[2].toString().yellow, 'is'.grey, 'NOT'.red, 'a valid command.'.grey, _.sample(snark).grey);
    }

    console.log();

    // override the built in help
    process.argv.push('donthelp')
  }

  program.parse(process.argv);

  function endIt() {
    setTimeout(function() {
      process.nextTick(function() {
        process.exit(0);
      })
    }, 1000)
  }
