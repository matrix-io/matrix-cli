#!/usr/bin/env node

var program = require('commander');
var prompt = require('prompt');
var async = require('async');
var debug;

async.series([
  function(cb) {
    if (Matrix.config.environment.name === 'dev') {
      program.option('-b, --bulk [value]', 'Automatically generates multiple devices')
        .parse(process.argv);
    }
    cb();
  },
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('register');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  // basic register doesn't use firebase, and will login automatically
  handleBasicRegister,
  // user register does fb init for login, bad if we do that 2x
  function (cb) {
    Matrix.firebaseInit(cb);
  }
], function(err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  if (Matrix.pkgs.length > 0) {
    var command = Matrix.pkgs[0];
    if (command !== 'device') {
      Matrix.loader.stop();
      console.warn('matrix register', command, 'is not a valid command');
      process.exit(1);
    } else {
      Matrix.validate.userAsync(function (err) {
        if (err) {
          Matrix.loader.stop();
          console.error(err.message.red);
          debug('Error:', err.message);
          return process.exit(1);
        }
        Matrix.loader.stop();
        console.log(t('matrix.register.creating_device'));
        Matrix.loader.start();
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
        Matrix.loader.stop();
        prompt.delimiter = '';
        prompt.message = 'Device Registration -- ';
        prompt.start();

        //TODO: Async this cascade
        prompt.get(deviceSchema, function (err, result) {
          Matrix.loader.start();
          // all of the below is untested - next line = matrix use
          // Matrix.config.device.identifier = result.deviceId;

          Matrix.helpers.saveConfig(function () {

            Matrix.firebase.user.getAllDevices(function (devices) {

              var deviceIds = _.keys(devices);
              debug('Existing Device Ids', deviceIds)

              var deviceObj = {
                type: 'matrix',
                osVersion: '0',
                version: require(__dirname + '/../package.json').version,
                name: result.name,
                description: result.description
              };

              var events = {
                error: function (err) {
                  if (err.hasOwnProperty('state') && err.state == 'device-provisioning-in-progress') {
                    debug('Provisioning device step... ignore this')
                  } else {
                    Matrix.loader.stop();
                    console.log('Error creating device '.red + deviceObj.name.yellow + ': '.red, err);
                    process.exit();
                  }
                },
                finished: function () {
                  Matrix.loader.stop();
                  console.log('Device registered successfully');
                },
                start: function () {
                  Matrix.loader.stop();
                  console.log('Device registration request formed...');
                  Matrix.loader.start();
                },
                progress: function () {
                  Matrix.loader.stop();
                  console.log('Registering device...');
                  Matrix.loader.start();
                }
              };

              var deviceObj = {
                type: 'matrix',
                osVersion: '0',
                version: require(__dirname + '/../package.json').version,
                name: result.name,
                description: result.description,
              };

              var duplicateDevices = _.values(Matrix.config.deviceMap).filter(function(d) {
                return d.name === result.name;
              });

              if (duplicateDevices.length != 0){
                console.error('Device name should be unique!');
                process.exit(1);
              }

              // fire off worker
              Matrix.firebase.device.add(deviceObj, events);

              // wrap this up
              Matrix.firebase.user.watchForDeviceAdd(function (d) {
                var deviceId = d.key;
                if (!_.isEmpty(deviceId) && deviceIds.indexOf(deviceId) === -1) {
                  debug('new device on user record!');
                  Matrix.loader.stop();
                  console.log('New Device'.green, deviceId);
                  Matrix.helpers.trackEvent('device-register', { did: deviceId });

                  // // add to local ref
                  // Matrix.config.device.deviceMap = _.merge({}, Matrix.config.device.appMap, d.val() );
                  // Matrix.helpers.saveConfig();


                  // fetch secret
                  // this part will be automated in the future. idk how.
                  Matrix.loader.start();
                  Matrix.api.device.getSecret(deviceId, function (err, secret) {
                    Matrix.loader.stop();
                    if (err) {
                      console.error('Secret Error: ', err);
                      process.exit(1);
                    } else if (_.isUndefined(secret)) {
                      console.error('No secret found: ', secret);
                      process.exit(1);
                    }

                    // return the secret
                    console.log('\nSave your *device id* and *device secret*'.green)
                    console.log('You will not be able to see the secret for this device again'.grey)

                    console.log('\nSave the following to ~/.envrc on your Pi\n'.grey)
                    console.log('export MATRIX_DEVICE_ID=' + deviceId);
                    console.log('export MATRIX_DEVICE_SECRET=' + secret.results.deviceSecret)

                    console.log();
                    console.log('Make these available by running `source ~/.envrc` before running MATRIX OS'.grey);
                    console.log('\nSet up `matrix` CLI to target this device\n'.grey);
                    console.log('matrix use', deviceId);
                    console.log('or'.grey)
                    console.log('matrix use', result.name);
                    console.log();
                    Matrix.helpers.refreshDeviceMap(process.exit)
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

    processPromptData(function (err, userData) {
      if (err) {
        console.log('Error: ', err);
        process.exit();
      }
      if (userData.password !== userData.confirmPassword) {
        return console.error('Passwords didn\'t match');
      }
      /** set the creds **/
      Matrix.config.user = {
        username: userData.username,
        password: userData.password
      };

      Matrix.config.user.jwt_token = true;

      Matrix.config.client = {};
      debug('Client', Matrix.options);

      Matrix.loader.start();
      Matrix.api.register.user(userData.username, userData.password, Matrix.options.clientId, function (err, out) {
        /*500 server died
        400 bad request
          user exists
          missing parameter
        401*/
        if (err) {
          Matrix.loader.stop();
          if (err.hasOwnProperty('status_code')) {
            if (err.status_code === 500) {
              console.log('Server unavailable, please try again later');
            } else if (err.status_code === 400) {
              console.log('Unable to create user ' + userData.username + ', user already exists');
            } else {
              console.log('Unknown error (' + err.status_code + '): ', err);
            }
          } else {
            if (err.hasOwnProperty('code') && err.code == 'ENOTFOUND') {
              console.error('Unable to reach server, please try again later');
            } else {
              console.error('Unknown error: ', err);
            }
          }
          process.exit();
        } else {
          var userOptions = {
            username: userData.username,
            password: userData.password,
            trackOk: userData.profile.trackOk
          }

        login(userData, userOptions);
        }
      });
    });
  }
});

function processPromptData(cb) {
  Matrix.helpers.profile.prompt(function(err, profile) {
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
    prompt.message = 'User -- ';
    prompt.start();
    prompt.get(schema, function(err, result) {
      /*if (err && err.toString().indexOf('canceled') > 0) {
        err = new Error('User registration cancelled');
      } */
      result.profile = profile;
      cb(err, result);
    });
  });
}

function login(userData, userOptions){
  async.series([
    function(cb){
      Matrix.helpers.logout(function(){
        debug('Cleaning old data...');
      });
      cb(null);
    }, function(cb) {
      Matrix.helpers.login(userOptions, function (err) {
        if (err) {
          Matrix.loader.stop();
          cb('Unable to login, your account was created but the profile info couldn\'t be updated'.red);
        }

        Matrix.helpers.profile.update(userData.profile, function (err) {
          Matrix.loader.stop();
          debug('User', Matrix.config.user, out);
          if (err) {
            cb('Unable to update profile, your account was created but the profile information couldn\'t be updated'.yellow);
          }
          cb('User ' + userData.username + ' successfully created');
        });
        cb(null);
      });
    }
  ], function(err){
    if (err) console.log(err);
    process.exit(1);
  });
}

function handleBasicRegister(cb) {
  // continue flow
  if (Matrix.pkgs.length !== 0) return cb();

  processPromptData(function(err, userData) {
    if (err) {
      console.log('Error: ', err);
      process.exit();
    }

    if (userData.password !== userData.confirmPassword) {
      return console.error('Passwords didn\'t match');
    }
    /** set the creds **/
    Matrix.config.user = {
      username: userData.username,
      password: userData.password
    };

    Matrix.config.user.jwt_token = true;

    Matrix.config.client = {};
    debug('Client', Matrix.options);

    Matrix.loader.start();
    Matrix.api.register.user(userData.username, userData.password, Matrix.options.clientId, function(err, out) {
      /*500 server died
      400 bad request
        user exists
        missing parameter
      401*/
      if (err) {
        Matrix.loader.stop();
        if (err.hasOwnProperty('status_code')) {
          if (err.status_code === 500) {
            console.log('Server unavailable, please try again later');
          } else if (err.status_code === 400) {
            console.log('Unable to create user ' + userData.username + ', user already exists');
          } else {
            console.log('Unknown error (' + err.status_code + '): ', err);
          }
        } else {
          if (err.hasOwnProperty('code') && err.code == 'ENOTFOUND') {
            console.error('Unable to reach server, please try again later');
          } else {
            console.error('Unknown error: ', err);
          }
        }
        process.exit();
      } else {
        var userOptions = {
          username: userData.username,
          password: userData.password,
          trackOk: userData.profile.trackOk
        }

        //login does fb init :(
        login(userData, userOptions);
      }
    });
  });
}
