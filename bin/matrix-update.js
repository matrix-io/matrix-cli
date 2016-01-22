require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);
var pkgs = program.args;

if (!pkgs.length) {
  showHelp();
}

var appName = pkgs[0];
var appVersion = pkgs[1];

if (appName === undefined) {
  if (version === undefined) {
    console.log('Upgrading to latest version of MATRIX OS');
    // TODO: update <appName> [version] - Upgrade to latest version of Matrix
  } else {
    console.log('Upgrading to', version, 'of', appName);
    // TODO: update <appName> [version] - Upgrade Matrix
  }
} else {
  if (version === undefined) {
    console.log('Upgrading to latest version of', appName);
    // TODO: update <appName> [version] - Upgrade to latest version of App
  } else {
    console.log('Upgrading to', version, 'of', appName);
    // TODO: update <app> [version] - Upgrade Matrix
  }
}

console.warn('not implemented yet');

function showHelp() {
  console.log('\n> matrix update ¬ \n');
  console.log('\t                 matrix update -', 'update software on active device'.grey)
  console.log('\t           matrix update <app> -', 'update application to latest'.grey)
  console.log('\t matrix update <app> <version> -', 'update application to specified version'.grey)
  console.log('\n')
  process.exit();
}
