#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);
var pkgs = program.args;

if (!pkgs.length || showTheHelp ) {
  showHelp();
}

var appName = pkgs[0];
var appVersion = pkgs[1];

if (appName === undefined) {
  if (version === undefined) {
    console.log(i('matrix.update.upgrading_to') + ' ', i('matrix.update.latest_version'), ' ' + i('matrix.update.of') + ' MATRIX OS');
    // TODO: update <appName> [version] - Upgrade to latest version of Matrix
  } else {
    console.log(i('matrix.update.upgrading_to') + ' ', version, ' ' + i('matrix.update.of') + ' ', appName);
    // TODO: update <appName> [version] - Upgrade Matrix
  }
} else {
  if (version === undefined) {
    console.log(i('matrix.update.upgrading_to') + ' ' + i('matrix.update.latest_version'), ' ' + i('matrix.update.of') + ' ', appName);
    // TODO: update <appName> [version] - Upgrade to latest version of App
  } else {
    console.log(i('matrix.update.upgrading_to') + ' ', version + ' ' + i('matrix.update.of') + ' ' + appName);
    // TODO: update <app> [version] - Upgrade Matrix
  }
}

console.warn('not implemented yet');

function showHelp() {
  console.log('\n> matrix update ¬ \n');
  console.log('\t                 matrix update -', i('matrix.update.help_update').grey)
  console.log('\t           matrix update <app> -', i('matrix.update.help_update_app').grey)
  console.log('\t matrix update <app> <version> -', i('matrix.update.help_update_app_version').grey)
  console.log('\n')
  process.exit();
}
