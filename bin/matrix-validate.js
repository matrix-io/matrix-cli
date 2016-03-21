if ( _.isEmpty(Matrix.config.client.token)){
  console.error('No Active User Found\n', '\nmatrix login\n'.grey)
  process.exit();
}
if ( _.isEmpty(Matrix.config.device.token)){
  console.error('No Device Indicated\n', '\nmatrix list devices'.grey,' - > select a device id'.yellow, '\nmatrix use\n'.grey)
  process.exit();
}
