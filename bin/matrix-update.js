#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  
  program
    .parse(process.argv);
  var pkgs = program.args;

  if (!pkgs.length || showTheHelp) {
    showHelp();
  }

  var appName = pkgs[0];
  var appVersion = pkgs[1];

  if (appName === undefined) {
    if (appVersion === undefined) {
      console.log(t('matrix.update.upgrading_to') + ' ', t('matrix.update.latest_version'), ' ' + t('matrix.update.of') + ' MATRIX OS');
      // TODO: update <appName> [version] - Upgrade to latest version of Matrix
    } else {
      console.log(t('matrix.update.upgrading_to') + ' ', appVersion, ' ' + t('matrix.update.of') + ' ', appName);
      // TODO: update <appName> [version] - Upgrade Matrix
    }
  } else {
    if (appVersion === undefined) {
      console.log(t('matrix.update.upgrading_to') + ' ' + t('matrix.update.latest_version'), ' ' + t('matrix.update.of') + ' ', appName);
      // TODO: update <appName> [version] - Upgrade to latest version of App
    } else {
      console.log(t('matrix.update.upgrading_to') + ' ', appVersion + ' ' + t('matrix.update.of') + ' ' + appName);
      // TODO: update <app> [version] - Upgrade Matrix
    }
  }

  console.warn('not implemented yet');

  function showHelp() {
    console.log('\n> matrix update ¬ \n');
    console.log('\t                 matrix update -', t('matrix.update.help_update').grey)
    console.log('\t           matrix update <app> -', t('matrix.update.help_update_app').grey)
    console.log('\t matrix update <app> <version> -', t('matrix.update.help_update_app_version').grey)
    console.log('\n')
    process.exit();
  }
});