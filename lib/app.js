
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
var async = require('async');
var debug = debugLog('sdk')
var npmVersion = require('package-json');
var commandTimeoutSeconds = 30;
Matrix.latestVersion; //Latest npm matrix-cli version is stored here

async.series([
  function (next) { //Fetch latest npm version
    npmVersion('matrix-cli', 'latest').then(function (package) {
      Matrix.latestVersion = package.version;
      next();
    }).catch(next);
  },
  async.apply(Matrix.localization.init, Matrix.localesFolder, Matrix.config.locale), //i18n initialization
  function () { //Main flow
    var t = Matrix.localization.get;

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
    program.command('register', t('matrix.help_register').grey + '\n[device] - registers new device');
    program.command('remove', t('matrix.help_remove').grey);
    program.command('login', t('matrix.help_login').grey);
    program.command('logout')
      .description(t('matrix.help_logout'))
      .action(function () {
        Matrix.validate.user(); //Make sure the user has logged in
        Matrix.helpers.logout(function () {
          console.log(t('matrix.logout.logout_success').green);
          process.exit(0);
        });
      })

    //TODO : Add CREATE ACCOUNT command;


    // indicate subcommands or usage information using \n
    program.command('use', t('matrix.help_use').grey);
    program.command('set [target]', t('matrix.help_set') + '\n[env <environment>, config <app> k=v, locale <locale>]'.grey)

    program.command('Management')
    program.command('sim [target]', t('matrix.help_sim') + '\n[ init, restore, start, stop, save, clear ]');
    program.command('list [target]', t('matrix.help_list') + '\n[ apps, devices, all ] '.grey)

    /** Update the App or the Matrix **/
    program
      .command('reboot')
      .description(t('matrix.help_reboot'))
      .action(function () {
        Matrix.validate.user(); //Make sure the user has logged in
        Matrix.validate.device(); //Make sure the user has logged in
        Matrix.api.device.reboot(Matrix.config.device.identifier, function (err) {
          console.log(t('matrix.reboot.rebooting') + '...');
          process.exit();
        });
      });


      // HEY DEVELOPER - THIS ONE IS USEFUL
    // Hidden in help output
    program.command('debug').description('list out configuration object')
      .action(function () {
        console.log(Matrix.config)
      });

  program.command('Apps');
  program.command('search', t('matrix.help_search').grey);
  program.command('install', t('matrix.help_install') + '\n[ app / sensor ] <name>. '.grey + t('matrix.help_install_default').grey)
  program.command('uninstall', t('matrix.help_uninstall'), ' <app>')
  program.command('config', t('matrix.help_config'))
  program.command('update', t('matrix.help_update') + '\n<appName> <version>'.grey)

  //Start command
  program
    .command('start [app]')
    .description(t('matrix.help_start'))
    .option('-a, --all')
    .action(function (app, options) {
      //Make sure the user has logged in
      Matrix.validate.user();
      Matrix.validate.device();

      Matrix.api.device.setId(Matrix.config.device.identifier);
      console.log(t('matrix.start.starting_app') + ': ', app, Matrix.config.device.identifier);

      Matrix.firebaseInit(function () {
        //Get the app id for name
        Matrix.firebase.app.getIDForName( app, function(err, appId){
          if (err) return console.error(err);
          debug('appId>', appId);
          //Get the current status of app
          Matrix.firebase.app.getStatus(appId, function (status) {
            debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);

            if (_.isUndefined(app)) {
              console.log('\n> matrix start ¬\n');
              console.log('\t    matrix start <app> -', t('matrix.start.help', {app: '<app>'}).grey)
              endIt();
            //If the status of the app is different of active or error doesn't execute de start command
          } else if(status === 'active' || status === 'pending' ){
              console.log(t('matrix.start.start_app_status_error') + ':', app, status.green );
              endIt();
            }else{
              var commandTimeout;

              if (options.all) {
                //FIXME: hacky
                app = 'all-applications'
              }

              Matrix.loader.start();

              //Watch the app status and verify if the behavior it's right
              Matrix.firebase.app.watchStatus(appId, function (status) {
                //stop command status behavior(inactive or error -> active)
                Matrix.loader.stop()
                if(status === 'active'){
                  clearTimeout(commandTimeout);
                  console.log(t('matrix.start.start_app_successfully') + ': ', app);
                  endIt();
                }

              });
              //Send the start command
              Matrix.api.app.start(app, Matrix.config.device.identifier, function (err, res) {
                if (err) {
                  Matrix.loader.stop();
                  console.log(t('matrix.start.start_app_error') + ':', app , ' (' + err.message.red + ')');
                  endIt();
                }

                //add timeout to start command
                commandTimeout = setTimeout(function () {
                  console.log(t('matrix.start.start_timeout'));
                  endIt();

                }, commandTimeoutSeconds * 1000);

              });
            }
          });
        });
      });
    });

  //Stop command
  program
    .command('stop [app]')
    .description(t('matrix.help_stop'))
    .option('-a, --all')
    .action(function (app, options) {
      //Make sure the user has logged in
      Matrix.validate.user();
      Matrix.validate.device();

      Matrix.firebaseInit(function () {
        //Get the app id for name
        Matrix.firebase.app.getIDForName( app, function(err, appId){
          if (err) return console.error(err);
          debug('appId>', appId);
          //Get the current status of app
          Matrix.firebase.app.getStatus(appId, function (status) {
            debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
            if (_.isUndefined(app)) {
              console.log('\n> matrix stop ¬\n');
              console.log('\t    matrix stop <app> -', t('matrix.stop.help', {app: '<app>'}).grey)
              endIt();

            //If the status of the app is different of active doesn't execute de stop command
          } else if( status !== 'active' ) {
              console.log(t('matrix.stop.stop_app_status_error') + ':', app);
              endIt();
            } else {
              console.log(t('matrix.stop.stopping_app') + ': ', app);
              var commandTimeout;
              if (options.all) {
                //FIXME: hacky, passes this to server
                app = 'all-applications'
              }
              Matrix.loader.start();

              //Watch the app status and verify if the behavior it's right
              Matrix.firebase.app.watchStatus(appId, function (status) {
                //stop command status behavior(active -> inactive)
                Matrix.loader.stop();
                if(status === 'inactive'){
                  clearTimeout(commandTimeout);
                  console.log(t('matrix.stop.stop_app_successfully') + ':', app);
                  endIt();
                }
              });
              //Send the stop command
              Matrix.api.app.stop(app, Matrix.config.device.identifier, function (err) {
                Matrix.loader.stop();
                if (err) {
                  console.log(t('matrix.stop.stop_app_error') + ':', app , ' (' + err.message.red + ')');
                  endIt();
                }

                //add timeout to stop command
                commandTimeout = setTimeout(function () {
                  console.log(t('matrix.stop.stop_timeout'));
                  endIt();
                }, commandTimeoutSeconds * 1000);

              });
            }
          });
        });
      });
    });

  //Restart command
  program
    .command('restart [app]')
    .description(t('matrix.help_restart'))
    .action(function (app) {

      //Make sure the user has logged in
      Matrix.validate.user();
      Matrix.validate.device();

      Matrix.firebaseInit(function () {
        //Get the app id for name
        Matrix.firebase.app.getIDForName( app, function(err, appId){
          if (err) return console.error(err);
          debug('appId>', appId);
          //Get the current status of app
          Matrix.firebase.app.getStatus(appId, function (status) {
            debug("Get current status: " + Matrix.config.user.id + '>' + Matrix.config.device.identifier + '>' + appId + '>' + status);
            if (_.isUndefined(app)) {
              console.log('\n> matrix restart ¬\n');
              console.log('\t    matrix restart <app> -', t('matrix.restart.help', {app: '<app>'}).grey)
              endIt();
            //If the status of the app is different of active doesn't execute de restart command
            } else if(status !== 'active'){
              console.log(t('matrix.restart.restart_app_status_error') + ':', app);
              endIt();
            } else {
              console.log(t('matrix.restart.restarting_app') + ': ', app);
              var commandTimeout;
              Matrix.loader.start();

              //Watch the app status and verify if the behavior it's right
              Matrix.firebase.app.watchStatus(appId, function (status) {
                //restart command status behavior(active -> inactive -> active)
                Matrix.loader.stop();
                if(status === 'active'){
                  clearTimeout(commandTimeout);
                  console.log(t('matrix.restart.restart_app_successfully') + ':', app);
                  endIt();
                }else if(status === 'inactive'){
                  console.log(t('matrix.stop.stop_app_successfully') + ':', app);
                }
              });

              //Send the restart command
              Matrix.api.app.restart(app, function (err, res) {
                Matrix.loader.stop();
                if (err) {
                  console.log(t('matrix.restart.restart_app_error') + ':', app , ' (' + err.message.red + ')');
                  endIt();
                }

                //add timeout to restart command
                commandTimeout = setTimeout(function () {
                  console.log(t('matrix.restart.restart_timeout'));
                  endIt();
                }, commandTimeoutSeconds * 1000);
              });
            }
          });
        });
      });
    });

    program.command('development');

    //
    /** App management **/
    program.command('create [app]', t('matrix.help_create'))

    // // Run from current directory
    program.command('deploy [dir]', t('matrix.help_deploy'))
    program.command('publish <app> [version]', 'Publishes a version of the App to the store.')
    program
      .command('trigger [string]')
      .description(t('matrix.help_trigger'))
      .action(function (data) {
        Matrix.api.app.trigger(Matrix.config.device.identifier, data, function (err) {
          console.error(err);
          endIt();
        });
      })

      program
        .command('ping')
        .description(t('matrix.help_ping'))
        .action(function () {
          // console.warn('Ping not complete yet. Do NOT use.')
          // process.exit(1);
          Matrix.validate.user();
          Matrix.validate.device();
          Matrix.api.app.trigger(Matrix.config.device.identifier, 'amazing-matrix-ping', function (err) {
            console.error(err);
            endIt();
          });
        })

    // /** Matrix - In App - Uninstall **/
    program
      .command('log')
      .option('-f, --follow', 'Follow the log')
      .description(t('matrix.help_log'))
      .action(function (option) {

        Matrix.validate.user(); //Make sure the user has logged in
        Matrix.validate.device(); //Make sure the user has logged in
        // if (option.follow)
        var options = {};
        options.deviceId = Matrix.config.device.identifier;

        var eq = '=';
        for (var i = 1; i < process.stdout.columns; i++) {
          eq += '=';
        }

        console.log(eq.grey);

        Matrix.api.app.log(options, function (err, log) {
          if (err) console.error(err);
          if (_.has(log, 'payload')) {
            console.log(log.payload);
          }
          if (!option.follow) {
            // process.exit();
          }
        });
      });

      program
        .command('validate')
        .action(function(appName ){
          var yaml = require('js-yaml');
          try {
            process.env.DEBUG='*';
            var configRaw = fs.readFileSync(process.cwd() + '/' + appName + '/config.yaml');
            var config = yaml.safeLoad(configRaw);
            Matrix.validate.config(config);
          } catch(e){
            console.error(e);
          }
        });
    //
      program.command('track').action(function(event){
        Matrix.helpers.trackEvent('test-event', event, console.log);
      });

    //
    // debug(process, '================', program);



    // Main Programs
    var commandList = _.map(program.commands, function (p) {
      return p._name;
    });


    // strip out -h / --help
    _.pull(process.argv, ['-h', '--h', '--help']);

    // nonsensically complicated way to override the help text
    if (process.argv.length === 2 || commandList.indexOf(process.argv[2]) === -1) {

      var updateMessage = '';
      if (!_.isUndefined(Matrix.latestVersion) && Matrix.latestVersion != Matrix.version){
        updateMessage = 'v' + Matrix.latestVersion + ' available!';
        updateMessage = ' (' + updateMessage.yellow + ')';
      }
      if (_.has(Matrix.config, 'environment.name')) {
        var env = ' - '.grey + Matrix.config.environment.name.grey;
      }

      console.log('\n')
      console.log(_.repeat(' ', 10), '_  _ ____ ___ ____ _ _  _')
      console.log(_.repeat(' ', 10), '|\\/| |__|  |  |__/ |  \\/   _ |', '[o]'.grey)
      console.log(_.repeat(' ', 10), '|  | |  |  |  |  \\ | _/\\_ |_ |_ |',
        'v'.grey + Matrix.version.grey + updateMessage, (env || ''));

      console.log('\n')

      var log = [];

      // TODO: Should we start with API? only if not logged in
      log.push(t('matrix.api_title').grey + ': '.grey + Matrix.options.apiUrl, t('matrix.streaming_title').grey + ': '.grey + Matrix.options.mxssUrl);


      if (!_.isEmpty(Matrix.config.user)) {
        log.push('\n' + t('matrix.user_title').grey + ':'.grey, Matrix.config.user.username);
      } else {
        log.push('\n' + t('matrix.user_title').grey + ':'.grey, t('matrix.no_user_message').yellow);
      }
      if (!_.isEmpty(Matrix.config.device)) {
        log.push(t('matrix.device_title').grey + ':'.grey, Matrix.config.device.identifier);
      } else {
        log.push(t('matrix.device_title').grey + ':'.grey, 'No device selected'.yellow);
      }

      if (!_.isEmpty(Matrix.config.locale)) {
        log.push(t('matrix.locale_title').grey + ':'.grey, Matrix.config.locale);
      }


      // TODO: add support for active group

      console.log(log.join(' '.blue));

      _.each(program.commands, function (c) {
        var command = c._name;
        var desc = c._description || '';



        if (command.match(/debug|validate/)) {
          return;
        }
        var pad = 14 - command.length;


        // break off sub commands
        desc = desc.split('\n');
        if (desc.length > 1) {
          var subcommands = desc[1];
        }
        // restore original string
        desc = desc[0];

        if (_.isEmpty(desc)) {
          // section markers
          var l = command.length;
          var r = Math.floor((14 - l) / 2);
          console.log('\n', _.repeat('-', r).grey, command.toUpperCase(), _.repeat('-', r).grey)
        } else {
          console.log(_.repeat(' ', pad), command, '-', desc.grey);
          (!_.isUndefined(subcommands)) ? console.log(_.repeat(' ', pad + command.length), ' ↳', subcommands.grey) : null;
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
      setTimeout(function () {
        process.nextTick(function () {
          process.exit(0);
        })
      }, 1000)
    }
  }

]);
