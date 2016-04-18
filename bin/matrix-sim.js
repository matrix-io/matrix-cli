require( './matrix-init' );

var debug = debugLog( 'sim' );

var prompt = require( 'prompt' );
var program = require( 'commander' );
var p = require( 'child_process' );

program
  .parse( process.argv );

var pkgs = program.args;

var cmd = pkgs[ 0 ];

if ( _.isEmpty( cmd ) || showTheHelp ) {
  showHelp();
}

if ( _.isUndefined( Matrix.config.user.id ) ) {
  return console.log( 'Please', 'matrix login'.grey, 'before attempting to use the simulator' );
}


if ( cmd === 'init' ) {

  if ( _.has( Matrix.config, 'sim.id' ) ) {
    console.log( '\nYou already have a virtual device initialized.' );
    console.log( '\nTo target this device:\n' );
    console.log( 'matrix use %s'.grey, Matrix.config.sim.id,'\n' );
    process.exit();
  }
  // make sure device name, device id and userId are available
  var deviceId = 'sim-' + _.times( 24, function () {
    return Math.round( Math.random() * 16 ).toString( 16 )
  }).join( '' );

  debug( deviceId );


  prompt.delimiter = '';

  prompt.message = ['Please enter information for this virtual device\n'];
  prompt.start();

  prompt.get( [ 'name', 'description' ], function ( err, inputs ) {
    if ( err ) return console.error( err );

    // check for dupe name, note, this requires matrix list devices to have run

    _.each( Matrix.config.deviceMap, function ( d ) {
      if ( inputs.name === d.name ) {
        console.error( d.name, 'is already used' );
        process.exit();
      }
    });

    console.log( 'Creating', inputs.name, '[' + deviceId + ']' )
    var deviceObj = {
      deviceId: deviceId,
      deviceName: inputs.name,
      deviceDescription: inputs.description,
    };

    Matrix.api.device.create(deviceObj, function ( err, device ) {
      if ( err ) return console.error( 'Create Error', err );
      debug( 'Create Device:', device );
      Matrix.api.device.register(deviceObj.deviceId, function ( err, results ) {
        if ( err ) {
          if (err.status_code === 401){
            return console.error('Invalid Session. Please', 'matrix login'.grey, 'and', 'matrix use', deviceId );
          }
          return console.error( 'Register Error', err );
        }
        debug( results );
        // local config
        Matrix.config.sim = {
          token: results,
          id: deviceId
        }
        Matrix.helpers.saveConfig();

        console.log( 'Success'.green )
        console.log( '\nTo target this device:\n' );
        console.log( 'matrix use %s'.grey, Matrix.config.sim.id, '\n' );
      });
    });
  });

} else if ( cmd === 'start' ) {
  var option = pkgs[ 1 ];

  if ( !Matrix.config.hasOwnProperty('sim') ){
    return console.log('Matrix sim init first please')
  }
  if ( Matrix.config.device.identifier.indexOf('sim-') !== 0 ){
    return console.log('Device', Matrix.config.device.identifier, 'is not a virtual MatrixOS. Please `matrix sim init` and `matrix use`.')
  }

  if ( Matrix.config.sim.custom === true){

  }

  if (option === 'debug'){
    console.log('Debug mode on');
  }
  // TODO: abstract away docker machine?

  //test for docker
  checkDocker();

  var cmd = 'docker run ' + [
    // show debug if `matrix sim start debug`
    ( option === 'debug' ) ? '-e DEBUG=*' : '',
    // TODO: add NODE_ENV and options for local, dev, stage and prod
    '-e NODE_ENV=dev',
    '-e MATRIX_DEVICE_ID="' + Matrix.config.device.identifier + '"',
    '-e MATRIX_USERNAME="' + Matrix.config.user.username + '"',
    'admobilize/matrix-os' +
    ( ( _.get(Matrix.config, 'sim.custom' ) === true) ? ':custom' : ':latest')
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
    console.log( out );
  });

  console.log('MatrixOS Simulator Starting [', Matrix.config.device.identifier, ']', '\n Stop with ^C or matrix sim stop');

  proc.stdout.on( 'data', function ( data ) {
    console.log( data );
  });

  proc.stderr.on( 'data', function ( data ) {
    console.log('DEBUG'.green, data);
  });


} else if ( cmd.match( /restore|upgrade/ ) ) {
  checkDocker();

  console.log( 'Downloading latest MatrixOS image.' )

  var cmd = 'docker pull admobilize/matrix-os:latest';

  var proc = require( 'child_process' ).exec( cmd, {}, function ( err, out, stderr ) {
    if ( stderr ) console.error( 'ERROR'.red, stderr );
  })

  proc.stdout.on( 'data', function ( data ) {
    console.log( data );
  })

} else if ( cmd === 'save' ) {
  checkDocker();


  runDockerCmd( 'commit ' + getContainerId() + ' admobilize/matrix-os:custom' );

  Matrix.config.sim.custom = true;
  Matrix.helpers.saveConfig();

} else if ( cmd === 'clear' || cmd === 'reset' ) {
  Matrix.config.sim = null;
  Matrix.helpers.saveConfig();
  console.log('Simulation Cleared'.blue)

} else if ( cmd === 'ssh' ) {

  var lastDockerId = p.execSync( 'docker ps -q | head -n1' )
  p.spawn( 'docker exec -it ' + lastDockerId.toString().trim() + ' bash' )

} else if ( cmd === 'stop') {
  // find processes by Name
  var stopList = p.execSync('docker ps | grep admobilize/matrix-os').toString().substr(0,12);
  console.log(stopList);
  p.exec('docker stop ' + stopList, function (err) {
    if (err) console.error(err);
    console.log("Matrix Simulator Stopped")
  })
} else {
  showHelp();
}


function getContainerId() {
  var id = require( 'child_process' ).execSync( 'docker ps -q --filter "ancestor=admobilize/matrix-os"' );
  return id.toString().trim();
}

function runDockerCmd( cmd ) {
  log( cmd );
  var proc = require( 'child_process' ).exec( 'docker ' + cmd, {}, function ( err, out, stderr ) {
    if ( stderr ) console.error( 'ERROR'.red, stderr );
  })

  proc.stdout.on( 'data', function ( data ) {
    console.log( data );
  })
}


function showHelp() {
  console.log( '\n> matrix sim ¬\n' );
  console.log( '\t               matrix sim upgrade -', 'upgrade your simulator image'.grey )
  console.log( '\t               matrix sim restore -', 'reset your simulator'.grey )
  console.log( '\t                  matrix sim init -', 'initialize your simulator'.grey )
  console.log( '\t                 matrix sim start -', 'start MatrixOS virtual environment'.grey )
  console.log( '\t                  matrix sim save -', 'save MatrixOS state, use after deploy / install'.grey )
  console.log( '\t                 matrix sim clear -', 'remove simulation local data'.grey )
  console.log( '\n' )
  process.exit( 1 );
}

function checkDocker() {
  try {
    var proc = require( 'child_process' ).execSync( 'which docker', {
      stdio: [ null, null, null ]
    });
  } catch ( e ) {
    if ( e.toString().indexOf( 'Command failed' ) > -1 ) {
      console.error( 'Docker not found.'.red, '\nPlease install docker from https://docs.docker.com/engine/installation/' )

      console.eror( 'Then `docker-machine create --driver virtualbox matrix`' )
      process.exit( 1 );
    }
  }
}
