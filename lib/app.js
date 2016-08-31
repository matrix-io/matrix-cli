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

if (Matrix.config.user.hasOwnProperty('username')) {
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


    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function() {
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
        program.command('register', t('matrix.help_register').grey);
        program.command('login', t('matrix.help_login').grey);
        program.command('logout')
            .description(t('matrix.help_logout'))
            .action(function() {
                Matrix.helpers.removeConfig(function(err) {
                    if (Matrix.config.user.hasOwnProperty('username')) {
                        console.log(t('matrix.logout.logout_success').green);
                    }
                });
            })

        //TODO : Add CREATE ACCOUNT command;


        // indicate subcommands or usage information using \n
        program.command('use', t('matrix.help_use').grey);
        program.command('set [target]', t('matrix.help_set') + '\n[env <environment>, config <app> k=v, locale <locale>]'.grey)

        program.command('Management')
        program.command('sim [target]', t('matrix.help_sim') + '\n[ init, restore, start, stop, save, clear ]');
        program.command('list [target]', t('matrix.help_list') + '\n[ apps, devices, all, groups ] '.grey)

        /** Update the App or the Matrix **/
        program
            .command('reboot')
            .description(t('matrix.help_reboot'))
            .action(function() {
                Matrix.api.device.reboot(Matrix.config.device.identifier, function(err) {
                    console.log(t('matrix.reboot.rebooting') + '...');
                    process.exit();
                });
            });



        // Hidden in help output
        program.command('debug').description('list out configuration object')
            .action(function() {
                console.log(Matrix.config)
            });


        program.command('Apps');
        program.command('search', t('matrix.help_search').grey);
        program.command('install', t('matrix.help_install') + '\n[ app / sensor ] <name>. '.grey + t('matrix.help_install_default').grey)
        program.command('config', t('matrix.help_config'))



        // /** Matrix - In App - Uninstall **/
        program
            .command('uninstall <app>')
            .description(t('matrix.help_uninstall'), ' <app>')
            .action(function(name) {
                Matrix.api.app.uninstall(name, Matrix.config.device.identifier, function(err, resp) {
                    if (err) console.error(err);
                    console.log(t('matrix.uninstall.uninstalled') + ' ', name + '...');
                    process.exit();
                });
            });

        program.command('update', t('matrix.help_update') + '\n<appName> <version>'.grey)

        program
            .command('start [app]')
            .description(t('matrix.help_start'))
            .option('-a, --all')
            .action(function(app, options) {
                if (options.all) {
                    //FIXME: hacky
                    app = 'all-applications'
                }
                Matrix.api.device.setId(Matrix.config.device.identifier);
                console.log(t('matrix.start.starting_app') + ': ', app, Matrix.config.device.identifier);
                Matrix.api.app.start(app, Matrix.config.device.identifier, function(err, res) {
                    if (err) return console.log(err);
                    console.log(t('matrix.start.start_app_successfully') + ': ', app);
                    endIt();
                });
            });
        //
        program
            .command('stop [app]')
            .description(t('matrix.help_stop'))
            .option('-a, --all')
            .action(function(app, options) {
                console.log(t('matrix.stop.stopping_app') + ': ', app);
                if (options.all) {
                    //FIXME: hacky, passes this to server
                    app = 'all-applications'
                }
                Matrix.api.app.stop(app, Matrix.config.device.identifier, function(err) {
                    console.log(t('matrix.stop.stop_app_successfully') + ':', app);
                    endIt();
                });
            });
        //
        program
            .command('restart <app>')
            .description(t('matrix.help_restart'))
            .action(function(app) {
                console.log(t('matrix.restart.restarting_app') + ': ', app);
                Matrix.api.app.restart(app, function(err, res) {
                    console.log(t('matrix.restart.restart_app_successfully') + ':', app, res);
                    endIt();
                });
            });

        program.command('development');

        //
        /** App management **/
        program.command('create <app>', t('matrix.help_create'))
            //
            // // Run from current directory
        program.command('deploy <dir>', t('matrix.help_deploy'))
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
            .description(t('matrix.help_trigger'))
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
            .description(t('matrix.help_log'))
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
                    if (_.has(log, 'payload')) {
                        console.log(log.payload);
                    }
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
        _.pull(process.argv, ['-h', '--h', '--help']);

        // nonsensically complicated way to override the help text
        if (process.argv.length === 2 || commandList.indexOf(process.argv[2]) === -1) {

            // console.log(program)
            //
            // var helps = program.helpInformation().split('\n');
            //
            // // slice off remaining text + options
            // var help = helps.sliceSet (0, helps.length - (6 + program.options.length));
            // // // console.log(cake.join('\n'));
            // // console.log(helps);


            if (_.has(Matrix.config, 'environment.name')) {
                var env = ' - '.grey + Matrix.config.environment.name.grey;
            }

            console.log('\n')
            console.log(_.repeat(' ', 10), '_  _ ____ ___ ____ _ _  _')
            console.log(_.repeat(' ', 10), '|\\/| |__|  |  |__/ |  \\/   _ |', '[o]'.grey)
            console.log(_.repeat(' ', 10), '|  | |  |  |  |  \\ | _/\\_ |_ |_ |',
                'v'.grey + Matrix.version.grey, (env || ''));

            // console.log(_.repeat('[..]', 20))
            console.log('\n')

            var log = [];

            // TODO: Should we start with API? only if not logged in
            log.push(t('matrix.api_title').grey + ': '.grey + Matrix.options.apiUrl, t('matrix.streaming_title').grey + ': '.grey + Matrix.options.mxssUrl);


            if (!_.isEmpty(Matrix.config.user)) {
                log.push('\n' + t('matrix.user_title').grey + ':'.grey, Matrix.config.user.username);
            }
            if (!_.isEmpty(Matrix.config.device)) {
                log.push(t('matrix.device_title').grey + ':'.grey, Matrix.config.device.identifier);
            }

            log.push(t('matrix.locale_title').grey + ':'.grey, Matrix.config.locale);


            // TODO: add support for active group

            console.log(log.join(' '.blue));

            _.each(program.commands, function(c) {
                var command = c._name;
                var desc = c._description || '';



                if (command.match(/debug/)) {
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
                    (!_.isUndefined(subcommands)) ? console.log(_.repeat(' ', pad + command.length), ' ↳', subcommands.grey): null;
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
    });

} else { //validate
    console.log('Warnin:'.yellow, 'No user logged in.');
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


    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function() {
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
        program.command('register', t('matrix.help_register').grey);
        program.command('login', t('matrix.help_login').grey);
        program.command('logout')
            .description(t('matrix.help_logout'))
            .action(function() {
                Matrix.helpers.removeConfig(function(err) {
                    if (Matrix.config.user.hasOwnProperty('username')) {
                        console.log(t('matrix.logout.logout_success').green);
                    }
                });
            })

        //TODO : Add CREATE ACCOUNT command;


        // indicate subcommands or usage information using \n
        program.command('use', t('matrix.help_use').grey);
        program.command('set [target]', t('matrix.help_set') + '\n[env <environment>, config <app> k=v, locale <locale>]'.grey)

        program.command('Management')
        program.command('sim [target]', t('matrix.help_sim') + '\n[ init, restore, start, stop, save, clear ]');
        program.command('list [target]', t('matrix.help_list') + '\n[ apps, devices, all, groups ] '.grey)

        /** Update the App or the Matrix **/
        program
            .command('reboot')
            .description(t('matrix.help_reboot'))
            .action(function() {
                Matrix.api.device.reboot(Matrix.config.device.identifier, function(err) {
                    console.log(t('matrix.reboot.rebooting') + '...');
                    process.exit();
                });
            });



        // Hidden in help output
        program.command('debug').description('list out configuration object')
            .action(function() {
                console.log(Matrix.config)
            });


        program.command('Apps');
        program.command('search', t('matrix.help_search').grey);
        program.command('install', t('matrix.help_install') + '\n[ app / sensor ] <name>. '.grey + t('matrix.help_install_default').grey)
        program.command('config', t('matrix.help_config'))



        // /** Matrix - In App - Uninstall **/
        program
            .command('uninstall <app>')
            .description(t('matrix.help_uninstall'), ' <app>')
            .action(function(name) {
                Matrix.api.app.uninstall(name, Matrix.config.device.identifier, function(err, resp) {
                    if (err) console.error(err);
                    console.log(t('matrix.uninstall.uninstalled') + ' ', name + '...');
                    process.exit();
                });
            });

        program.command('update', t('matrix.help_update') + '\n<appName> <version>'.grey)

        program
            .command('start [app]')
            .description(t('matrix.help_start'))
            .option('-a, --all')
            .action(function(app, options) {
                if (options.all) {
                    //FIXME: hacky
                    app = 'all-applications'
                }
                Matrix.api.device.setId(Matrix.config.device.identifier);
                console.log(t('matrix.start.starting_app') + ': ', app, Matrix.config.device.identifier);
                Matrix.api.app.start(app, Matrix.config.device.identifier, function(err, res) {
                    if (err) return console.log(err);
                    console.log(t('matrix.start.start_app_successfully') + ': ', app);
                    endIt();
                });
            });
        //
        program
            .command('stop [app]')
            .description(t('matrix.help_stop'))
            .option('-a, --all')
            .action(function(app, options) {
                console.log(t('matrix.stop.stopping_app') + ': ', app);
                if (options.all) {
                    //FIXME: hacky, passes this to server
                    app = 'all-applications'
                }
                Matrix.api.app.stop(app, Matrix.config.device.identifier, function(err) {
                    console.log(t('matrix.stop.stop_app_successfully') + ':', app);
                    endIt();
                });
            });
        //
        program
            .command('restart <app>')
            .description(t('matrix.help_restart'))
            .action(function(app) {
                console.log(t('matrix.restart.restarting_app') + ': ', app);
                Matrix.api.app.restart(app, function(err, res) {
                    console.log(t('matrix.restart.restart_app_successfully') + ':', app, res);
                    endIt();
                });
            });

        program.command('development');

        //
        /** App management **/
        program.command('create <app>', t('matrix.help_create'))
            //
            // // Run from current directory
        program.command('deploy <dir>', t('matrix.help_deploy'))
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
            .description(t('matrix.help_trigger'))
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
            .description(t('matrix.help_log'))
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
                    if (_.has(log, 'payload')) {
                        console.log(log.payload);
                    }
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
        _.pull(process.argv, ['-h', '--h', '--help']);

        // nonsensically complicated way to override the help text
        if (process.argv.length === 2 || commandList.indexOf(process.argv[2]) === -1) {

            // console.log(program)
            //
            // var helps = program.helpInformation().split('\n');
            //
            // // slice off remaining text + options
            // var help = helps.sliceSet (0, helps.length - (6 + program.options.length));
            // // // console.log(cake.join('\n'));
            // // console.log(helps);


            if (_.has(Matrix.config, 'environment.name')) {
                var env = ' - '.grey + Matrix.config.environment.name.grey;
            }

            console.log('\n')
            console.log(_.repeat(' ', 10), '_  _ ____ ___ ____ _ _  _')
            console.log(_.repeat(' ', 10), '|\\/| |__|  |  |__/ |  \\/   _ |', '[o]'.grey)
            console.log(_.repeat(' ', 10), '|  | |  |  |  |  \\ | _/\\_ |_ |_ |',
                'v'.grey + Matrix.version.grey, (env || ''));

            // console.log(_.repeat('[..]', 20))
            console.log('\n')

            var log = [];

            // TODO: Should we start with API? only if not logged in
            log.push(t('matrix.api_title').grey + ': '.grey + Matrix.options.apiUrl, t('matrix.streaming_title').grey + ': '.grey + Matrix.options.mxssUrl);


            if (!_.isEmpty(Matrix.config.user)) {
                log.push('\n' + t('matrix.user_title').grey + ':'.grey, Matrix.config.user.username);
            }
            if (!_.isEmpty(Matrix.config.device)) {
                log.push(t('matrix.device_title').grey + ':'.grey, Matrix.config.device.identifier);
            }

            log.push(t('matrix.locale_title').grey + ':'.grey, Matrix.config.locale);


            // TODO: add support for active group

            console.log(log.join(' '.blue));

            _.each(program.commands, function(c) {
                var command = c._name;
                var desc = c._description || '';



                if (command.match(/debug/)) {
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
                    (!_.isUndefined(subcommands)) ? console.log(_.repeat(' ', pad + command.length), ' ↳', subcommands.grey): null;
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
    });
}
