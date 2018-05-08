/**
 * lib/app.js
 */
var program = require('commander');
var _ = require('lodash');
var fs = require('fs');
var async = require('async');
var debug = debugLog('sdk')
var npmVersion = require('package-json');
//Matrix.latestVersion; //Latest npm matrix-cli version is stored here

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
    program.command('register', t('matrix.help_register').grey + '\n[device] - ' + t('matrix.help_register_device'));
    program.command('account', t('matrix.help_account').grey + '\n[profile] - ' + t('matrix.help_account_profile'));
    program.command('remove', t('matrix.help_remove').grey);
    program.command('login', t('matrix.help_login').grey);
    program.command('logout')
      .description(t('matrix.help_logout'))
      .action(function () {
        Matrix.validate.userAsync(function (err) {
          if (err) {
            debug('Error:', err.message);
            return process.exit(1);
          }

          Matrix.helpers.trackEvent('user-logout');
          Matrix.helpers.logout(function () {
            console.log(t('matrix.logout.logout_success').green);
            process.exit(0);
          });
        }); //Make sure the user has logged in
      })

    program.command('upgrade')
      .description(t('matrix.help_upgrade'))
      .action(function () {
        console.log('To Upgrade MATRIX CLI, please run\n\n', 'npm update -g matrix-cli\n'.grey);
      })

    //TODO : Add CREATE ACCOUNT command;


    // indicate subcommands or usage information using \n
    program.command('use', t('matrix.help_use').grey);
    program.command('set [target]', t('matrix.help_set') + '\n( env (production|dev), locale (es|en) )'.grey)
    program.command('Management')
    // program.command('sim [target]', t('matrix.help_sim') + '\n[ init, restore, start, stop, save, clear ]');
    program.command('list [target]', t('matrix.help_list') + '\n( apps, devices, all ) '.grey)

    /** Update the App or the Matrix **/
    // program
    //   .command('reboot')
    //   .description(t('matrix.help_reboot'))
    //   .action(function() {
    //     Matrix.validate.user(); //Make sure the user has logged in
    //     Matrix.validate.device(); //Make sure the user has logged in

    //     Matrix.helpers.trackEvent('device-reboot', { did: Matrix.config.device.identifier });

    //     Matrix.api.device.reboot(Matrix.config.device.identifier, function(err) {
    //       console.log(t('matrix.reboot.rebooting') + '...');
    //       process.exit();
    //     });
    //   });


    // HEY DEVELOPER - THIS ONE IS USEFUL
    // Hidden in help output
    program.command('debug').description('list out configuration object')
      .action(function () {
        console.log(Matrix.config)
      });

    program.command('Apps');
    program.command('search', t('matrix.help_search').grey);
    program.command('install', t('matrix.help_install'))
    program.command('uninstall', t('matrix.help_uninstall'), ' <app>')
    program.command('config', t('matrix.help_config'))
    program.command('update', t('matrix.help_update'))
    program.command('start', t('matrix.help_start'));
    program.command('stop', t('matrix.help_stop'));
    program.command('restart', t('matrix.help_restart'));

    program.command('development');

    //
    /** App management **/
    program.command('create [app]', t('matrix.help_create'))

    // // Run from current directory
    program.command('deploy [dir]', t('matrix.help_deploy'))
    program.command('publish <app> [version]', '(name) Publishes a version of the App to the store.')
    program.command('unpublish <app>', '(name) unpublish an App from the store')
    program
      .command('trigger [string]')
      .description(t('matrix.help_trigger'))
      .action(function (data) {

        async.series([
          Matrix.validate.userAsync,
          Matrix.validate.deviceAsync,
          async.apply(Matrix.api.app.trigger, Matrix.config.device.identifier, data)
        ], function (err) {
          if (err) {
            console.error(err.message.red);
            debug('Error:', err);
          }
          endIt();
        });
      })

    program
      .command('ping')
      .description(t('matrix.help_ping'))
      .action(function () {

        async.series([
          Matrix.validate.userAsync,
          Matrix.validate.deviceAsync,
          async.apply(Matrix.api.app.trigger, Matrix.config.device.identifier, 'amazing-matrix-ping')
        ], function (err) {
          // bail on null, null has no string coloring
          if (!_.isNull(err) && err) {
            console.error(err.message.red);
            debug('Error:', err);
          }
          return endIt();
        });

      })

    // /** Matrix - In App - Uninstall **/
    program
      .command('log')
      .option('-f, --follow', 'Follow the log')
      .description(t('matrix.help_log'))
      .action(function (option) {

        async.series([
          Matrix.validate.userAsync,
          Matrix.validate.deviceAsync
        ], function (err) {
          if (err) {
            console.error(err.message.red);
            debug('Error:', err);
            return endIt();
          }

          var options = {};
          options.deviceId = Matrix.config.device.identifier;

          var eq = '=';
          for (var i = 1; i < process.stdout.columns; i++) {
            eq += '=';
          }

          console.log(eq.grey);

          Matrix.api.app.log(options, function (err, log) {
            if (err) console.error(err);
            if (_.has(log, 'payload')) console.log(log.payload);
            if (!option.follow) {
              // process.exit();
            }
          });
        });
      });

    program
      .command('validate')
      .action(function (appName) {
        var yaml = require('js-yaml');
        try {
          process.env.DEBUG = '*';
          var configRaw = fs.readFileSync(process.cwd() + '/' + appName + '/config.yaml');
          var config = yaml.safeLoad(configRaw);
          Matrix.validate.config(config);
        } catch (e) {
          console.error(e);
        }
      });
    //
    program.command('track').action(function (event) {
      Matrix.helpers.trackEvent('test-event', { aid: event }, function () {
        console.log(arguments);
      });
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
      if (!_.isUndefined(Matrix.latestVersion) && Matrix.latestVersion != Matrix.version) {
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

      if (!_.isUndefined(Matrix.config.environment.name)) {
        log.push(t('matrix.env_title').grey + ':'.grey, Matrix.config.environment.name);
      }

      // if (!_.isUndefined(Matrix.version)) {
      //   log.push(t('matrix.v_title').grey + ':'.grey, Matrix.version);
      // }


      // TODO: add support for active group

      _.each(program.commands, function (c) {
        var subcommands;
        var command = c._name;
        var desc = c._description || '';

        if (command.match(/debug|validate|track/)) return;

        var pad = 14 - command.length;

        // break off sub commands
        desc = desc.split('\n');
        if (desc.length > 1) subcommands = desc[1];

        // restore original string
        desc = desc[0];

        if (_.isEmpty(desc)) {
          // section markers
          var l = command.length;
          var r = Math.floor((14 - l) / 2);
          console.log('\n', _.repeat('-', r).grey, command.toUpperCase(), _.repeat('-', r).grey)
        } else {
          console.log(_.repeat(' ', pad), command, '-', desc.grey);
          if (!_.isUndefined(subcommands)) console.log(_.repeat(' ', pad + command.length), ' ↳', subcommands.grey);
        }
      });

      console.log('\n\n', log.join(' '.blue));

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
