//Check if a user is logged in
function user() { 
  if (_.isEmpty(Matrix.config.user)) {
    console.error(t('matrix.please_login').yellow);
    process.exit();
  } 
}

//Check if a device is selected
function device() {
  if (_.isEmpty(Matrix.config.device) || _.isUndefined(Matrix.config.device.token)) {
    console.error(t('matrix.validate.no_device') + '\n', '\nmatrix list devices'.grey,' - > '.yellow + t('matrix.validate.select_device_id').yellow, '\nmatrix use\n'.grey)
    process.exit();
  } 
}

function firebaseError(err) {
  if (err) {
    if(err.hasOwnProperty('code')){
      if(err.code == 'auth/invalid-custom-token'){
        console.log("Invalid token, please login");
        return 1;
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
  firebaseError: firebaseError
};
