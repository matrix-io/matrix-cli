//Check if a user is logged in
function user() {
  token();
  if (_.isEmpty(Matrix.config.user)) {
    Matrix.loader.stop();
    console.error(t('matrix.please_login').yellow);
    process.exit();
  }
}

//Check if a device is selected
function device() {
  if (_.isEmpty(Matrix.config.device) || _.isUndefined(Matrix.config.device.token)) {
    Matrix.loader.stop();
    console.error(t('matrix.validate.no_device') + '\n', '\nmatrix list devices'.grey,' - > '.yellow + t('matrix.validate.select_device_id').yellow, '\nmatrix use\n'.grey)
    process.exit();
  }
}

// Check if a token is current
function token(){
  var jwt = require('jsonwebtoken');
  var token = Matrix.config.user.token;
  if ( _.isUndefined(token) ){
    console.error(t('matrix.please_login').yellow);
    process.exit();
  } else {
    var decode = jwt.decode(token, { complete: true });
    if ( decode.payload.exp < Math.round( new Date().getTime() / 1000 ) ){
      debug('Token Expired.');
      console.error(t('matrix.please_login').yellow);
      process.exit();
    } else {
      debug('Token ok!'.green)
      return true;
    }
   }
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
    if(err.hasOwnProperty('code')){
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
  isCurrentDevice: isCurrentDevice,
  firebaseError: firebaseError
};
