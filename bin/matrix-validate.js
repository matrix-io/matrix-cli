
if (_.isEmpty(Matrix.config.device.token)) {
  console.error(t('matrix.validate.no_device') + '\n', '\nmatrix list devices'.grey,' - > '.yellow + t('matrix.validate.select_device_id').yellow, '\nmatrix use\n'.grey)
  process.exit();
}
