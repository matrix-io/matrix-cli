require('./matrix-init');

program
  .parse(process.argv);
var cmd = program.args;

var targetDevice = cmd[0];

Matrix.api.auth.device({
  deviceId: targetDevice
}, function(state) {
  console.log('matrix use --', targetDevice);
  // Save the device token
  Matrix.config.device = {}
  Matrix.config.device.identifier = targetDevice;
  Matrix.config.device.token = state.results.device_token;
  Matrix.helpers.saveConfig();
});
