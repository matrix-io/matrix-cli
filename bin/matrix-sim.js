require('./matrix-init');

var debug = debugLog('sim');

var prompt = require('prompt');
var program = require('commander');

program
  .parse(process.argv);

var pkgs = program.args;

var cmd = pkgs[0];

if (_.isEmpty(cmd)) {
  showHelp();
}

if ( _.isUndefined( Matrix.config.user.id )){
  return console.log('Please','matrix login'.grey, 'before attempting to use the simulator');
}


if (cmd === 'init') {

  if ( _.has( Matrix.config, 'sim.id' )){
    console.log('You already have a virtual device initialized.');
    console.log('\nTo target this device:\n');
    console.log('matrix use %s'.grey, Matrix.config.sim.id);
    process.exit();
  }
  // make sure device name, device id and userId are available
  var deviceId = 'sim-' + _.times(24, function() {
    return Math.round(Math.random() * 16).toString(16)
  }).join('');

  debug(deviceId);


  prompt.delimiter = '';

  prompt.message = 'Please enter information for this virtual device\n';
  prompt.start();

  prompt.get(['name', 'description'], function(err, results) {
    if (err) return console.error(err);

    // check for dupe name, note, this requires matrix list devices to have run

    _.each( Matrix.config.deviceMap, function (d) {
        if (results.name === d.name ){
          console.error(d.name ,'is already used');
          process.exit();
        }
    })

    results.deviceId = deviceId;
    console.log('Creating', results.name, '[' + deviceId + ']')
    Matrix.api.device.create(results, function(err, results) {
      if (err) return console.error('Create Error', err);
      console.log('Device Created'.blue)
      debug(results);
      Matrix.api.device.register( deviceId, function(err, results){
        if (err) return console.error('Register Error', err);
        console.log('Device Registered'.blue)
        debug(results);
        Matrix.config.sim = {
          token: results.results.device_token,
          id: deviceId
        }
        Matrix.helpers.saveConfig();

        console.log('Success'.green)
        console.log('\nTo target this device:\n');
        console.log('matrix use %s'.grey, Matrix.config.sim.id);
      });
    });
  });

} else if (cmd === 'start') {
  var option = pkgs[1];

  // TODO: abstract away docker machine?

  //test for docker

  checkDocker();

  // MATRIX_DEVICE_ID='12:23:34:45:56' -e MATRIX_DEVICE_NAME='really. go away' -e DEBUG='*,-engine*' -e 'MATRIX_USER=brian@rokk3rlabs.com'  admobilize/matrix-os

  var cmd = 'docker run ' + [
    // show debug if `matrix sim start debug`
    ( option === 'debug' ) ? '-e DEBUG="*,-engine*"' : '',
    '-e MATRIX_DEVICE_ID="' + Matrix.config.device.identifier + '"',
    '-e MATRIX_USER="' + Matrix.config.user.username + '"',
    'admobilize/matrix-os' + ( Matrix.config.sim.custom ) ? ':custom' : ':latest'
  ].join(' ');

  debug(cmd);
  var proc = require('child_process').exec(cmd, {}, function(err, out, stderr) {
    // if (err) console.error('ERROR'.red, err);
    if (stderr) {
      console.error('ERROR'.red, stderr);
      if (stderr.indexOf('Cannot connect to the Docker daemon.') > -1){
        console.log('Please `docker-machine start matrix`. Then `eval $(docker-machine env matrix)`. If you have a different machine name, use that.')
      }
    }
    console.log(out);
  })


  proc.stdout.on('data', function(data) {
    console.log(data);
  });

  proc.stderr.on('data', function(data) {
    // console.log('ERROR'.red, data);
  });

  proc.on('error', function(err) {
    // console.error('ERROR'.red, err, proc);
  })
} else if (cmd.match(/restore|upgrade/)){
  checkDocker();

  console.log('Downloading latest MatrixOS image.')

  var cmd = 'docker pull admobilize/matrix-os:latest';

  var proc = require('child_process').exec(cmd, {}, function(err, out,stderr){
    if (stderr) console.error('ERROR'.red, stderr);
  })

  proc.stdout.on('data', function (data) {
    console.log(data);
  })

} else if ( cmd === 'save'){
  checkDocker();


  runDockerCmd('commit '+ getContainerId() + ' admobilize/matrix-os:custom');

  Matrix.config.sim.custom = true;
  Matrix.helpers.saveConfig();

} else if ( cmd === 'clear'){
  Matrix.config.sim = null;
  Matrix.helpers.saveConfig();
} else if ( cmd === 'ssh' ){
  var p = require('child_process');
  var lastDockerId = p.execSync('docker ps -q | head -n1')
  p.spawn('docker exec -it '+ lastDockerId +  ' bash')
} else {
  showHelp();
}


function getContainerId(){
  var id = require('child_process').execSync('docker ps -q --filter "ancestor=admobilize/matrix-os"');
  return id.toString().trim();
}

function runDockerCmd(cmd){
  log(cmd);
  var proc = require('child_process').exec('docker ' + cmd, {}, function(err, out,stderr){
    if (stderr) console.error('ERROR'.red, stderr);
  })

  proc.stdout.on('data', function (data) {
    console.log(data);
  })
}


function showHelp(){
  console.log('\n> matrix sim ¬\n');
  console.log('\t               matrix sim upgrade -', 'initialize your MatrixOS simulator'.grey)
  console.log('\t               matrix sim restore -', 'initialize your MatrixOS simulator'.grey)
  console.log('\t                  matrix sim init -', 'initialize your MatrixOS simulator'.grey)
  console.log('\t                 matrix sim start -', 'start MatrixOS virtual environment'.grey)
  console.log('\t                  matrix sim save -', 'save MatrixOS state, use after deploy / install'.grey)
  console.log('\t                 matrix sim clear -', 'remove simulation local data'.grey)
  console.log('\n')
  process.exit(1);
}

function checkDocker(){
  try {
    var proc = require('child_process').execSync('which docker', {
      stdio: [null, null, null]
    });
  } catch (e) {
    if (e.toString().indexOf('Command failed') > -1) {
      console.error('Docker not found.'.red, '\nPlease install docker from https://docs.docker.com/engine/installation/')

      console.eror('Then `docker-machine create --driver virtualbox matrix`')
      process.exit(1);
    }
  }
}
