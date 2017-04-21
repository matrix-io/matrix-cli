/**
 *
 * @param {bool} refresh If a token refresh should be executted. Defaults to true
 * @returns {bool} 
 */
function user(refresh) {
  var result = false;
  if (_.isEmpty(Matrix.config.user)) {
    Matrix.loader.stop();
    console.log(t('matrix.please_login').yellow);
  } else {
    if (!token()) {
      if (refresh) {
        if (!_.isEmpty(Matrix.config.user.refreshToken)) {
          Matrix.api.refresh(Matrix.config.user.refreshToken, function (err, state) {
            Matrix.loader.stop();
            console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Token:', Matrix.config.user.refreshToken, 'Err:', err, 'State:', state);
          });
        } else {
          Matrix.loader.stop();
          console.log('Unable to refesh token!');
        } 
      }
    } else {
      result = true;
    }
  }

  if (!result) process.exit;
  return result;
}

//Check if a device is selected
function device() {
  if (_.isEmpty(Matrix.config.device) || _.isUndefined(Matrix.config.device.token)) {
    Matrix.loader.stop();
    console.error(t('matrix.validate.no_device') + '\n', '\nmatrix list devices'.grey, ' - > '.yellow + t('matrix.validate.select_device_id').yellow, '\nmatrix use\n'.grey)
    process.exit();
  }
}

/**
 * token - Verifies token integrity and expiration
 * returns {bool} Wether the token is valid or not
 */
function token() {
  if (_.isEmpty(refresh)) refresh = true;
  var jwt = require('jsonwebtoken');
  var token = Matrix.config.user.token;
  var result = false;
  if (_.isUndefined(token)) console.log(t('matrix.please_login').yellow);
  else {
    var decode = jwt.decode(token, { complete: true });
    
    if (_.isEmpty(decode)) debug('Incorrect token format');
    else {
      if (decode.payload.exp < Math.round(new Date().getTime() / 1000))
        debug('Token Expired.');
      else
        result = true;
    }
  }
  if (!result) console.log(t('matrix.please_login').yellow);
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
  config: function (config) {
    var configHelper = require('matrix-app-config-helper')
    return configHelper.validate(config);
  },
  isCurrentDevice: isCurrentDevice,
  firebaseError: firebaseError
};
