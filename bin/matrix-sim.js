#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('sim');
var prompt = require('prompt');
var p = require('child_process');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var i = Matrix.localization.get;
  program
    .parse(process.argv);
  var pkgs = program.args;
  var cmd = pkgs[0];

  if (_.isEmpty(cmd) || showTheHelp) {
    showHelp();
  }

  if (_.isUndefined(Matrix.config.user.id)) {
    return console.log(i('matrix.sim.please') + ', ' + 'matrix login'.grey +  ' ' + i('matrix.sim.before_using_sim'));
  }

  // matrix sim init
  if (cmd === 'init') {

    if (_.has(Matrix.config, 'sim.id')) {
      console.log('\n' + i('matrix.sim.init.device_already_initialized') + '.');
      console.log('\n' + i('matrix.sim.init.target_device') + ':\n');
      console.log('matrix use %s'.grey, Matrix.config.sim.id, '\n');
      process.exit();
    }
    // make sure device name, device id and userId are available
    var deviceId = 'sim-' + _.times(24, function () {
      return Math.round(Math.random() * 16).toString(16)
    }).join('');

    debug(deviceId);


    prompt.delimiter = '';

    prompt.message = [i('matrix.sim.init.virtual_device_info') + '\n'];
    prompt.start();

    prompt.get(['name', 'description'], function (err, inputs) {
      if (err) return console.error(err);

      // check for dupe name, note, this requires matrix list devices to have run

      _.each(Matrix.config.deviceMap, function (d) {
        if (inputs.name === d.name) {
          console.error(d.name, ' ' + i('matrix.sim.init.device_is_already_used'));
          process.exit();
        }
      });

      console.log(i('matrix.sim.init.creating_device') + ' ', inputs.name, '[' + deviceId + ']')
      var deviceObj = {
        deviceId: deviceId,
        deviceName: inputs.name,
        deviceDescription: inputs.description,
        user: Matrix.config.user.id,
      };

      Matrix.api.device.create(deviceObj, function (err, device) {
        if (err) return console.error(i('matrix.sim.init.error_creating_device'), err);
        debug('Create Device:', device);
        Matrix.api.device.register(deviceObj.deviceId, function (err, results) {
          if (err) {
            if (err.status_code === 401) {
              return console.error(i('matrix.sim.init.invalid_session') + '. ' + i('matrix.sim.init.please') + ', ' + 'matrix login'.grey, ' ' + i('matrix.sim.init.and') + ' ', 'matrix use', deviceId);
            }
            return console.error(i('matrix.sim.init.register_error'), err);
          }
          debug(results);
          // local config
          Matrix.config.sim = {
            token: results,
            id: deviceId
          }
          Matrix.helpers.saveConfig();

          console.log(i('matrix.sim.init.success').green)
          console.log('\n' + i('matrix.sim.init.to_target_device') + ':\n');
          console.log('matrix use %s'.grey, Matrix.config.sim.id, '\n');
        });
      });
    });

  } else if (cmd === 'start') {
    var option = pkgs[1];

    if (!Matrix.config.hasOwnProperty('sim')) {
      return console.log('matrix sim init'.grey + ' ' + i('matrix.sim.start.before_message'))
    }
    if (Matrix.config.device.identifier.indexOf('sim-') !== 0) {
      return console.log(i('matrix.sim.start.device') + ' ', Matrix.config.device.identifier, ' ' + i('matrix.sim.start.not_a_virtual_device') + ' ' + '`matrix sim init`'.grey + i('matrix.sim.start.and') + '`matrix use`'.grey + '.')
    }

    if (Matrix.config.sim.custom === true) {
      console.log( i('matrix.sim.start.custom_image_detected').grey + '...'.grey)
    }

    if (option === 'debug') {
      console.log(i('matrix.sim.start.debug_on'));
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
    var proc = require('child_process').exec(cmd, {}, function (err, out, stderr) {
      // if (err) console.error('ERROR'.red, err);
      if (stderr) {
        console.error(i('matrix.sim.start.error').red, stderr);
        if (stderr.indexOf('Cannot connect to the Docker daemon.') > -1) {
          console.log(i('matrix.sim.please') + ' `docker-machine start matrix`. ' + i('matrix.sim.start.then') + ' `eval $(docker-machine env matrix)`. ' + i('matrix.sim.start.if_different_name') + '.')
        }
      }
      console.log(out);
    });

    console.log(i('matrix.sim.start.starting_sim') + ' [', Matrix.config.device.identifier, ']', '\n ' + i('matrix.sim.start.stop_with') + ' matrix sim stop'.grey);

    proc.stdout.on('data', function (data) {
      console.log(data);
    });

    proc.stderr.on('data', function (data) {
      console.log('DEBUG'.green, data);
    });


  } else if (cmd.match(/restore|upgrade/)) {
    checkDocker();

    console.log('Downloading latest MatrixOS image.')

    var cmd = 'docker pull admobilize/matrix-os:latest';

    var proc = require('child_process').exec(cmd, {}, function (err, out, stderr) {
      if (stderr) console.error(i('matrix.sim.start.error').red, stderr);
    })

    proc.stdout.on('data', function (data) {
      console.log(data);
    })

  if ( Matrix.config.hasOwnProperty('sim')) {
    Matrix.config.sim.custom = false;
  }

  Matrix.helpers.saveConfig();

    //matrix sim save
  } else if (cmd === 'save') {
    checkDocker();


    runDockerCmd('commit ' + getContainerId() + ' admobilize/matrix-os:custom');

    Matrix.config.sim.custom = true;
    Matrix.helpers.saveConfig();
    console.log(i('matrix.sim.save.state_saved').blue)

  } else if (cmd === 'clear' || cmd === 'reset') {
    Matrix.config.sim = {};
    Matrix.helpers.saveConfig();
    console.log(i('matrix.sim.clear.simulation_cleared').blue)

  } else if (cmd === 'ssh') {

    var lastDockerId = p.execSync('docker ps -q | head -n1 | tr "\n" " "')
    var ssh = p.spawn('docker exec -it ' + lastDockerId + ' bash', { shell: true });
    ssh.stdout.on('data', console.log)
    ssh.stderr.on('data', console.log)
  } else if (cmd === 'stop') {
    // find processes by Name
    var stopList = p.execSync('docker ps | grep admobilize/matrix-os').toString().substr(0, 12);
    console.log(stopList);
    p.exec('docker stop ' + stopList, function (err) {
      if (err) console.error(err);
      console.log(i('matrix.sim.stop.sim_stopped'))
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
    var proc = require('child_process').exec('docker ' + cmd, {}, function (err, out, stderr) {
      if (stderr) console.error('ERROR'.red, stderr);
    })

    proc.stdout.on('data', function (data) {
      console.log(data);
    })
  }


  function showHelp() {
    console.log('\n> matrix sim ¬\n');
    console.log('\t               matrix sim upgrade -', i('matrix.sim.help_upgrade').grey)
    console.log('\t               matrix sim restore -', i('matrix.sim.help_restore').grey)
    console.log('\t                  matrix sim init -', i('matrix.sim.help_init').grey)
    console.log('\t                 matrix sim start -', i('matrix.sim.help_start').grey)
    console.log('\t                  matrix sim save -', i('matrix.sim.help_save').grey)
    console.log('\t                 matrix sim clear -', i('matrix.sim.help_clear').grey)
    console.log('\n')
    process.exit(1);
  }

  function checkDocker() {
    try {
      var proc = require('child_process').execSync('which docker', {
        stdio: [null, null, null]
      });
    } catch (e) {
      if (e.toString().indexOf('Command failed') > -1) {
        console.error(i('matrix.sim.docker.docker_not_found') + '.'.red, '\n' + i('matrix.sim.docker.install_from') + ' https://docs.docker.com/engine/installation/')

        console.error(i('matrix.sim.docker.then') + ' `docker-machine create --driver virtualbox matrix`'.grey)
        process.exit(1);
      }
    }
  }
});