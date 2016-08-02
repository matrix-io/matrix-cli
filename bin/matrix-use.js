#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('use');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var i = Matrix.localization.get;
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

    Matrix.api.device.register(targetDevice, function(err, state) {
      if (state.status === "OK") {
        var name = Matrix.helpers.lookupDeviceName(targetDevice);

        if (!_.isUndefined(name)) {
          console.log(i('matrix.use.using_device_by_name').grey + ':', name);
        } else {
          console.log(i('matrix.use.using_device_by_id').grey + ':', targetDevice);
        }

        // Save the device token
        Matrix.config.device = {}
        Matrix.config.device.identifier = targetDevice;
        Matrix.config.device.token = state.results.device_token;
        Matrix.helpers.saveConfig(process.exit);
        
      } else {
        debug('Matrix Use Error Object:', state);
        if ( state.error === 'access_token not valid.' ) {
          console.log(i('matrix.use.not_authorized').red, '\n', i('matrix.use.invalid_token'), '. ' , i('matrix.use.try').grey, 'matrix login')
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
    console.log('\t                 matrix use <deviceid> -', i('matrix.use.command_help').grey)    
    console.log('\n')
  }
});
