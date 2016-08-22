#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('use');


Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function() {

    program
        .parse(process.argv);
    var cmd = program.args;

    if (showTheHelp) {
        showHelp();
    }

    var targetDevice = cmd[0];



    //TODO: exit if no targetDevice
    //TODO: store device list locally
    if (!_.isUndefined(targetDevice)) {
        Matrix.api.device.list({}, function(body) {
            _.each([body], function(results) {
                var aux = JSON.parse(results);
                //var deviceId = new RegExp(targetDevice);
                //console.log('NEW EXPRE', aux.results);
                _.each(aux.results, function(device) {
                    //console.log('device*****',device)
                    //console.log("ID: ", device.deviceId);

                    if (device.deviceId === targetDevice) {                        
                        var name = Matrix.helpers.lookupDeviceName(targetDevice);
                        if (!_.isUndefined(name)) {                          
                            console.log(t('matrix.use.using_device_by_name').grey + ':', name);
                        } else {
                            console.log(t('matrix.use.using_device_by_id').grey + ':', targetDevice);
                            // Save the device token
                            Matrix.config.device = {}                            
                            Matrix.config.device.identifier = targetDevice;                            
                            Matrix.config.device.token = state.results.device_token;                            
                            Matrix.helpers.saveConfig(process.exit);
                        }

                    }

                });
                console.log('Device doesn`t exists'.yellow)

                /* if (results.match(deviceId)) {
                     console.log('aux.results type: ', typeof aux.results)
                     console.log('results type: ', typeof results)

                     if (!_.isUndefined(name)) {
                         console.log(t('matrix.use.using_device_by_name').grey + ':', name);
                     } else {
                         console.log(t('matrix.use.using_device_by_id').grey + ':', targetDevice);
                     }
                     // Save the device token
                     Matrix.config.device = {}
                     Matrix.config.device.identifier = targetDevice;
                     Matrix.config.device.token = state.results.device_token;
                     Matrix.helpers.saveConfig(process.exit);
                 } else {
                     console.log('Device doesn`t exists'.yellow)
                     debug('Matrix Use Error Object:', state);
                     if (state.error === 'access_token not valid.') {
                         console.log(t('matrix.use.not_authorized').red, '\n', t('matrix.use.invalid_token'), '. ', t('matrix.use.try').grey, 'matrix login')
                     } else {
                         console.error('Error', state.status_code.red, state.error);
                     }
                 }*/
            });



            // save device map to config
            Matrix.config.deviceMap = _.map(JSON.parse(body).results.name, function(d) {
                return { name: d.name, id: d.deviceId }
            });
            Matrix.helpers.saveConfig(function() {
            });
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
