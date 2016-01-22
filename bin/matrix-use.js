require('./matrix-init');
var program = require('commander');
program
  .parse(process.argv);
var cmd = program.args;

var targetDevice = cmd[0];
//TODO: exit if no targetDevice
//TODO: store device list locally
if (!_.isUndefined(targetDevice)) {

  Matrix.api.auth.device({
    deviceId: targetDevice
  }, function(state) {
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
      Matrix.helpers.saveConfig();
      process.exit();
    } else {
      console.error('Use Error', state);
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
