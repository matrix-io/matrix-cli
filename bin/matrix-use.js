require('./matrix-init');
var localization = require('../lib/localization');
var program = require('commander');
var text;

localization.init(__dirname + '/../config/locales', "en", function () {
  text = localization.get;
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
          console.log(text('matrix.use.using_device_by_name').grey, name);
        } else {
          console.log(text('matrix.use.using_device_by_id').grey, targetDevice);
        }

        // Save the device token
        Matrix.config.device = {}
        Matrix.config.device.identifier = targetDevice;
        Matrix.config.device.token = state.results.device_token;
        Matrix.helpers.saveConfig(process.exit);
        
      } else {
        debug('Matrix Use Error Object:', state);
        if ( state.error === 'access_token not valid.' ) {
          console.log(text('matrix.use.not_authorized').red, '\n', text('matrix.use.invalid_token'), ' ' , text('matrix.use.try').grey, 'matrix login')
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
    console.log('\t                 matrix use <deviceid> -', text('matrix.use.help').grey)    
    console.log('\n')
  }
});
