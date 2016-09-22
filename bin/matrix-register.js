#!/usr/bin/env node

require('./matrix-init');
var prompt = require('prompt');
var debug = debugLog('register');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  if (Matrix.pkgs.length > 0) {
    var command = Matrix.pkgs[0];
    if (command !== 'device') {
      console.warn('matrix register', command, 'is not a valid command');
      process.exit(1);
    } else {

      console.log(t('matrix.register.creating_device'))


      // do device Registration
      var deviceSchema = {
        properties: {
          name: {
            required: true,
            description: 'device name'
          },
          description: {
            description: 'device description'
          }
          // for when this is ready
          // serial: {
          //   required: true
          //   description: 'serial number'
          // }
        }
      };
      prompt.delimiter = '';
      prompt.message = 'Device Registration -- ';
      prompt.start();

      //TODO: Async this cascade
      prompt.get(deviceSchema, function (err, result) {

        // all of the below is untested - next line = matrix use
        // Matrix.config.device.identifier = result.deviceId;

        Matrix.helpers.saveConfig(function () {

          Matrix.firebaseInit(function () {
            debug('Firebase init passed');


            Matrix.firebase.user.getAllDevices(function (devices) {

              var deviceIds = _.keys(devices);

              debug('Existing Device Ids', deviceIds)


              var events = {
                error: function (err) {
                  console.log('Error creating device '.red + deviceObj.name.yellow + ': '.red, err);
                  // process.exit();
                },
                finished: function () {
                  console.log('Device registered succesfully');

                },
                start: function () {
                  console.log('Device registration request formed...');
                },
                progress: function () {
                  console.log('Registering device...');
                }
              };

              var deviceObj = {
                type: 'matrix',
                osVersion: '0',
                version: require(__dirname + '/../package.json').version,
                name: result.name,
                description: result.description,
              };

              // fire off worker
              Matrix.firebase.device.add(deviceObj, events)

              // wrap this up
              Matrix.firebase.user.watchForDeviceAdd(function(d){
                var deviceId = d.key;

                if ( !_.isEmpty(deviceId) && deviceIds.indexOf(deviceId) === -1 ){
                  debug('new device on user record!');
                  console.log('New Device'.green, deviceId);

                  // // add to local ref
                  // Matrix.config.device.appMap = _.merge({}, Matrix.config.device.appMap, d.val() );
                  // Matrix.helpers.saveConfig();


                  // fetch secret
                  // this part will be automated in the future. idk how.
                  Matrix.api.device.getSecret( deviceId, function(err, secret){
                    if (err) console.error('Secret Error:', err);
                    // return the secret
                    console.log('\nSet the following environment variables on your rpi before running MATRIX OS\n'.grey)
                    console.log('MATRIX_DEVICE_ID='+ deviceId);
                    console.log('MATRIX_DEVICE_SECRET='+ secret.results.deviceSecret )
                    console.log();
                    process.exit();
                  })
                }


              })
              // #watchDeviceAdd
              //
            });
            // #getAllDevices
            //
          })
          // ##firebaseInit

        });


      })
      // # prompt
    }
  } else {

    var schema = {
      properties: {
        username: {
          required: true,
          pattern: /\S+@\S+\.\S+/,
          message: 'Username must be a valid email',
          description: 'Username: '
        },
        password: {
          required: true,
          pattern: /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{6,}/,
          message: 'Password must be at least 6 characters long and should contain a lower case letter and a number',
          hidden: true,
          description: 'Password: '
        },
        confirmPassword: {
          hidden: true,
          description: 'Confirm Password: '
        }
      }
    };

    prompt.delimiter = '';
    prompt.message = 'Registration -- ';
    prompt.start();
    prompt.get(schema, function (err, result) {
      if (err) {
        if (err.toString().indexOf('canceled') > 0) {
          console.log('');
          process.exit();
        } else {
          console.log('Error: ', err);
          process.exit();
        }
      }
      if (result.password !== result.confirmPassword) {
        return console.error('Passwords didn\'t match');
      }

      /** set the creds **/
      Matrix.config.user = {
        username: result.username,
        password: result.password
      };

      Matrix.config.user.jwt_token = true;

      Matrix.config.client = {};
      debug('Client', Matrix.options);

      /*request.post(params, function(error, response, body) {
      };*/


      Matrix.api.register.user(result.username, result.password, Matrix.options.clientId, function (err, out) {
        /*500 server died
        400 bad request
          user exists
          missing parameter
        401*/
        if (err) {
          if (err.hasOwnProperty('status_code')) {
            if (err.status_code === 500) {
              console.log('Server unavailable, please try again later');
            } else if (err.status_code === 400) {
              console.log('Unable to create user ' + result.username + ', user already exists');
            } else {
              console.log('Unknown error (' + err.status_code + '): ', err);
            }
          } else {
            console.error('Unknown error: ', err);
          }
        } else {
          debug('User', Matrix.config.user, out);
          console.log('User ' + result.username + ' successfully created');
        }
        process.exit();
      });


    });
  }
});
