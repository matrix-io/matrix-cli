if ( _.isEmpty(Matrix.config.device.token)){
  console.error('No Device Indicated\n', '\nmatrix list devices'.grey,' - > select a device id'.yellow, '\nmatrix use\n'.grey)
  process.exit();
}
