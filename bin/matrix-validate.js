/**
 * user - Checks if a valid user is set along with a valid user token, if invalid it refreshes it
 * @param {bool} exit If the process should exit on failed user validation. Defaults to true
 * @returns {bool} 
 */
function user(exit) {
  var result = false;
  if (_.isEmpty(exit)) exit = true;
  if (_.isEmpty(Matrix.config.user)) {
    Matrix.loader.stop();
    debug('No user found');
  } else {
    if (!token()) {
      if (!_.isEmpty(Matrix.config.user.refreshToken)) {
        var tokenData = Matrix.helpers.syncRefreshToken(Matrix.config.user.refreshToken);
        if (!_.isUndefined(tokenData.err ||  _.isEmpty(tokenData.token))) {
          console.log('Token refresh failed!');
        } else {
          Matrix.config.user.token = tokenData.token;
          var err = Matrix.helpers.syncSaveConfig();
          if (!_.isEmpty(err)) console.error('Unable to save config file!'.red, err);
          else result = true;
        }
      } else {
        Matrix.loader.stop();
        console.log('Unable to refesh token!');
      }
    } else {
      result = true;
    }
  }

  if (!result) {
    debug('Invalid token and unable to refresh it');
    console.log(t('matrix.please_login').yellow);
    if (exit) process.exit(1);
  }
  return result;
}

/**
 * device - Checks if a device is properly set
 * @param {bool} exit If the process should exit on failed user validation. Defaults to true
 * @returns {bool} 
 */
function device(exit) {
  var result = true;
  if (_.isEmpty(exit)) exit = true;
  if (_.isEmpty(Matrix.config.device) || _.isUndefined(Matrix.config.device.token)) {
    Matrix.loader.stop();
    console.error(t('matrix.validate.no_device') + '\n', '\nmatrix list devices'.grey, ' - > '.yellow + t('matrix.validate.select_device_id').yellow, '\nmatrix use\n'.grey)
    result = false;
  }
  if (!result && exit) process.exit();
  return result;
}

/**
 * token - Verifies token integrity and expiration
 * returns {bool} Wether the token is valid or not
 */
function token(refresh) {
  if (_.isEmpty(refresh)) refresh = true;
  var jwt = require('jsonwebtoken');
  var token = Matrix.config.user.token;
  var result = false;
  if (!_.isUndefined(token)) {
    var decode = jwt.decode(token, { complete: true });

    if (_.isEmpty(decode)) debug('Incorrect token format');
    else {
      if (decode.payload.exp < Math.round(new Date().getTime() / 1000))
        debug('Token Expired.');
      else
        result = true;
    }
  }
  if (!result) debug('Invalid token!');
  else debug('Token ok!'.green);

  return result;
}

function isCurrentDevice(deviceId) {
  return (!_.isEmpty(Matrix.config.device) && Matrix.config.device.identifier === deviceId);
}

// 1 Invalid token
// 2 Unlisted error
// 3 Unknown error
// 4 Network timeout
//Returns a specific code for each case
function firebaseError(err) {
  if (err) {
    if (err.hasOwnProperty('code')) {
      if (err.code == 'auth/invalid-custom-token') {
        return 1;
      } else if (err.code == 'auth/network-request-failed') {
        return 4;
      } else {
        console.log('Authentication error (' + err.code + '): ', err.message);
        return 2;
      }
    } else {
      console.log('Authentication error: ', err);
      return 3;
    }
  } else {
    return 0;
  }
}

module.exports = {
  device: device,
  user: user,
  token: token,
  config: function(config) {
    var configHelper = require('matrix-app-config-helper')
    return configHelper.validate(config);
  },
  isCurrentDevice: isCurrentDevice,
  firebaseError: firebaseError,
  // stubs to replace later @diego
  deviceAsync: function(cb) { cb() },
  userAsync: function(cb) { cb() },
};