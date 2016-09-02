#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('use');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  program
    .parse(process.argv);
  var cmd = program.args;


if (showTheHelp){
  showHelp();
}
var targetDevice = cmd[0];
//TODO: exit if no targetDevice
//TODO: store device list locally
if (!_.isUndefined(targetDevice)) {

  // still API dependent, TODO: depreciate to firebase
  Matrix.api.device.register(targetDevice, function(err, state) {

    if (err) return console.log(err);
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
        console.log(t('matrix.use.not_authorized').red, '\n', t('matrix.use.invalid_token'), '. ' , t('matrix.use.try').grey, 'matrix login')
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
    console.log('\t                 matrix use <deviceid> -', t('matrix.use.command_help').grey)
    console.log('\n')
  }
});
