#!/usr/bin/env node

var prompt = require('prompt');
var p = require('child_process');

var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function(cb) {
    debug = debugLog('sim');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync
], function(err) {
  if (err) return console.error(err);

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var cmd = Matrix.pkgs[0];

  Matrix.validate.user(); //Make sure the user has logged in

  // matrix sim init
  if (cmd === 'init') {

    if (_.has(Matrix.config, 'sim.id')) {
      console.log('\n' + t('matrix.sim.init.device_already_initialized') + '.');
      console.log('\n' + t('matrix.sim.init.target_device') + ':\n');
      console.log('matrix use %s'.grey, Matrix.config.sim.id, '\n');
      process.exit();
    }
    Matrix.loader.start();
    // make sure device name, device id and userId are available
    var deviceId = 'sim-' + _.times(24, function() {
      return Math.round(Math.random() * 16).toString(16)
    }).join('');

    debug(deviceId);

    prompt.delimiter = '';
    prompt.message = [t('matrix.sim.init.specify_data_for_init') + '\n'];
    Matrix.loader.stop();
    prompt.start();
    prompt.get(['name', 'description'], function(err, inputs) {
      if (err) {
        if (err.toString().indexOf('canceled') > 0) {
          console.log('');
          process.exit();
        } else {
          console.log("Error: ", err);
          process.exit();
        }
      }
      //TODO Probably need to adjust this later
      // check for dupe name, note, this requires matrix list devices to have run

      _.each(Matrix.config.deviceMap, function(d) {
        if (inputs.name === d.name) {
          console.error(d.name, ' ' + t('matrix.sim.init.device_is_already_used'));
          process.exit();
        }
      });

      console.log(t('matrix.sim.init.creating_device') + ' ', inputs, '[' + deviceId + ']')
      Matrix.loader.start();
      var deviceObj = {
        type: 'matrix',
        osVersion: 'sim',
        version: require(__dirname + '/../package.json').version,
        name: inputs.name,
        description: inputs.description,
        hardwareId: deviceId
      };

      Matrix.firebaseInit(function() {
        debug('Firebase init passed');

        var events = {
          error: function(err) {
            Matrix.loader.stop();
            console.log('Error creating device '.red + deviceObj.name.yellow + ': '.red, err);
            process.exit();
          },
          finished: function() {
            Matrix.loader.stop();
            console.log('Device registered succesfuly');

            Matrix.config.sim = {
              token: Matrix.config.user.token,
              id: deviceId
            }

            Matrix.helpers.saveConfig(function() {
              console.log(t('matrix.sim.init.success').green)
              console.log('\n' + t('matrix.sim.init.to_target_device') + ':\n');
              console.log('matrix use %s'.grey, Matrix.config.sim.id, '\n');
              process.exit();
            });
          },
          start: function() {
            Matrix.loader.stop();
            console.log('Device registration request formed...');
            Matrix.loader.start();
          },
          progress: function() {
            Matrix.loader.stop();
            console.log('Registering device...');
            Matrix.loader.start();
          }
        };

        Matrix.firebase.device.add(deviceObj, events);
      });

      /*
      Matrix.api.device.create(deviceObj, function (err, device) {
        if (err) return console.error(t('matrix.sim.init.error_creating_device'), err);
        debug('Create Device:', device);
        Matrix.api.device.register(deviceObj.deviceId, function (err, results) {
          if (err) {
            if (err.status_code === 401) {
              return console.error(t('matrix.sim.init.invalid_session') + '. ' + t('matrix.sim.init.please') + ', ' + 'matrix login'.grey, ' ' + t('matrix.sim.init.and') + ' ', 'matrix use', deviceId);
            }
            return console.error(t('matrix.sim.init.register_error'), err);
          }
          debug(results);
          // local config
          Matrix.config.sim = {
            token: results,
            id: deviceId
          }
          Matrix.helpers.saveConfig();

          console.log(t('matrix.sim.init.success').green)
          console.log('\n' + t('matrix.sim.init.to_target_device') + ':\n');
          console.log('matrix use %s'.grey, Matrix.config.sim.id, '\n');
        });
      });*/
    });

  } else if (cmd === 'start') {
    var option = Matrix.pkgs[1];

    if (!Matrix.config.hasOwnProperty('sim')) {
      return console.log('matrix sim init'.grey + ' ' + t('matrix.sim.start.before_message'))
    }
    if (Matrix.config.device.identifier.indexOf('sim-') !== 0) {
      return console.log(t('matrix.sim.start.device') + ' ', Matrix.config.device.identifier, ' ' + t('matrix.sim.start.not_a_virtual_device') + ' ' + '`matrix sim init`'.grey + t('matrix.sim.start.and') + '`matrix use`'.grey + '.')
    }

    if (Matrix.config.sim.custom === true) {
      console.log(t('matrix.sim.start.custom_image_detected').grey + '...'.grey)
    }

    if (option === 'debug') {
      console.log(t('matrix.sim.start.debug_on'));
    }
    // TODO: abstract away docker machine?

    //test for docker
    checkDocker();

    var cmd = 'docker run ' + [
      // show debug if `matrix sim start debug`
      (option === 'debug') ? '-e DEBUG=*' : '',
      // TODO: add NODE_ENV and options for local, dev, stage and prod
      '-e NODE_ENV=dev',
      '-e MATRIX_DEVICE_ID="' + Matrix.config.device.identifier + '"',
      '-e MATRIX_USERNAME="' + Matrix.config.user.username + '"',
      'admobilize/matrix-os' +
      ((_.get(Matrix.config, 'sim.custom') === true) ? ':custom' : ':latest')
    ].join(' ');

    debug(cmd);
    var proc = require('child_process').exec(cmd, {}, function(err, out, stderr) {
      // if (err) console.error('ERROR'.red, err);
      if (stderr) {
        console.error(t('matrix.sim.start.error').red, stderr);
        if (stderr.indexOf('Cannot connect to the Docker daemon.') > -1) {
          console.log(t('matrix.sim.please') + ' `docker-machine start matrix`. ' + t('matrix.sim.start.then') + ' `eval $(docker-machine env matrix)`. ' + t('matrix.sim.start.if_different_name') + '.')
        }
      }
      console.log(out);
    });

    console.log(t('matrix.sim.start.starting_sim') + ' [', Matrix.config.device.identifier, ']', '\n ' + t('matrix.sim.start.stop_with') + ' matrix sim stop'.grey);

    proc.stdout.on('data', function(data) {
      console.log(data);
    });

    proc.stderr.on('data', function(data) {
      console.log('DEBUG'.green, data);
    });


  } else if (cmd.match(/restore|upgrade/)) {
    checkDocker();

    console.log('Downloading latest MatrixOS image.')

    var cmd = 'docker pull admobilize/matrix-os:latest';

    var proc = require('child_process').exec(cmd, {}, function(err, out, stderr) {
      if (stderr) console.error(t('matrix.sim.start.error').red, stderr);
    })

    proc.stdout.on('data', function(data) {
      console.log('stdout', data);
    })

    if (Matrix.config.hasOwnProperty('sim')) {
      Matrix.config.sim.custom = false;
    }

    Matrix.helpers.saveConfig();

    //matrix sim save
  } else if (cmd === 'save') {
    checkDocker();


    runDockerCmd('commit ' + getContainerId() + ' admobilize/matrix-os:custom');

    Matrix.config.sim.custom = true;
    Matrix.helpers.saveConfig();
    console.log(t('matrix.sim.save.state_saved').blue)

  } else if (cmd === 'clear' || cmd === 'reset') {
    Matrix.config.sim = {};
    Matrix.helpers.saveConfig();
    console.log(t('matrix.sim.clear.simulation_cleared').blue)

  } else if (cmd === 'ssh') {

    var lastDockerId = p.execSync('docker ps -q | head -n1 | tr "\n" " "')
    var ssh = p.spawn('docker exec -it ' + lastDockerId + ' bash', { shell: true });
    ssh.stdout.on('data', console.log)
    ssh.stderr.on('data', console.log)
  } else if (cmd === 'stop') {
    // find processes by Name
    var stopList = p.execSync('docker ps | grep admobilize/matrix-os').toString().substr(0, 12);
    console.log(stopList);
    p.exec('docker stop ' + stopList, function(err) {
      if (err) console.error(err);
      console.log(t('matrix.sim.stop.sim_stopped'))
    })
  } else {
    showHelp();
  }


  function getContainerId() {
    var id = require('child_process').execSync('docker ps -q --filter "ancestor=admobilize/matrix-os"');
    return id.toString().trim();
  }

  function runDockerCmd(cmd) {
    log(cmd);
    var proc = require('child_process').exec('docker ' + cmd, {}, function(err, out, stderr) {
      if (stderr) console.error('ERROR'.red, stderr);
    })

    proc.stdout.on('data', function(data) {
      console.log(data);
    })
  }

  function checkDocker() {
    try {
      var proc = require('child_process').execSync('which docker', {
        stdio: [null, null, null]
      });
    } catch (e) {
      if (e.toString().indexOf('Command failed') > -1) {
        console.error(t('matrix.sim.docker.docker_not_found') + '.'.red, '\n' + t('matrix.sim.docker.install_from') + ' https://docs.docker.com/engine/installation/')

        console.error(t('matrix.sim.docker.then') + ' `docker-machine create --driver virtualbox matrix`'.grey)
        process.exit(1);
      }
    }
  }

  function displayHelp() {
    console.log('\n> matrix sim ¬\n');
    console.log('\t               matrix sim upgrade -', t('matrix.sim.help_upgrade').grey)
    console.log('\t               matrix sim restore -', t('matrix.sim.help_restore').grey)
    console.log('\t                  matrix sim init -', t('matrix.sim.help_init').grey)
    console.log('\t                 matrix sim start -', t('matrix.sim.help_start').grey)
    console.log('\t                  matrix sim save -', t('matrix.sim.help_save').grey)
    console.log('\t                 matrix sim clear -', t('matrix.sim.help_clear').grey)
    console.log('\n')
    process.exit(1);
  }
});