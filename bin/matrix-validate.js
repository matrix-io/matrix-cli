var i = Matrix.localization.get;
if (_.isEmpty(Matrix.config.device.token)) {
  console.error(i('matrix.validate.no_device') + '\n', '\nmatrix list devices'.grey,' - > '.yellow + i('matrix.validate.select_device_id').yellow, '\nmatrix use\n'.grey)
  process.exit();
}
