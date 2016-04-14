require('./matrix-init');
var program = require('commander');
program
  .parse(process.argv);
var cmd = program.args;

var debug = debugLog('use');

if (showTheHelp){
  showHelp();
}
var targetDevice = cmd[0];
//TODO: exit if no targetDevice
//TODO: store device list locally
if (!_.isUndefined(targetDevice)) {

  Matrix.api.device.register(targetDevice, function(err, state) {
    if (state.status === "OK") {
      var name = Matrix.helpers.lookupDeviceName(targetDevice);

      if (!_.isUndefined(name)) {
        console.log('Now using device:'.grey, name);
      } else {
        console.log('Now using device id:'.grey, targetDevice);
      }

      // Save the device token
      Matrix.config.device = {}
      Matrix.config.device.identifier = targetDevice;
      Matrix.config.device.token = state.results.device_token;
      Matrix.helpers.saveConfig(process.exit);
    } else {
      debug('Matrix Use Error Object:', state);
      if ( state.error === 'access_token not valid.' ) {
        console.log('Not Authorized'.red, '\nYour token is invalid. Try'.grey, 'matrix login')
      } else {
        console.error('Error', state.status_code.red, state.error);
      }
    }

  });

} else {
  showHelp();
}

function showHelp() {
  console.log('\n> matrix use ¬ \n');
  console.log('\t                 matrix use <deviceid> -', 'set active device to device id'.grey)
  console.log('\n')
}
