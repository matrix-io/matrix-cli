#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);
var pkgs = program.args;

if (!pkgs.length) {
  console.log('\n> matrix list ¬\n');
  console.log('\t   matrix list apps -', 'display apps on current device'.grey)
  console.log('\tmatrix list devices -', 'display available devices'.grey)
  console.log('\t matrix list groups -', 'display groups of devices'.grey)
  console.log('\n')
  process.exit(1);
}

if (pkgs.indexOf('app') > -1) {

  console.warn('list apps not implemented')
  Matrix.api.app.list(function(apps){
    console.log(Matrix.helpers.displayApps(apps));
  })

} else if (pkgs.indexOf('device') > -1) {

  var group = pkgs[2];
  /** do nothing if not device **/
  Matrix.helpers.getConfig();
  if (group !== undefined) {
    // Matrix.api.user.setToken(Matrix.config.user.token);
    var options = {
      group: group
    };
    Matrix.api.device.list(options, function(body) {
      //print device
      console.log(Matrix.helpers.displayDevices(body));
    });
  } else {
    Matrix.api.device.list({}, function(body) {
      //print device
      console.log(Matrix.helpers.displayDevices(body));
    });
  }

} else if (pkgs.indexOf('group') > -1) {

  /** do nothing if not device **/
  Matrix.helpers.getConfig();
  Matrix.api.group.list(function(body) {
    //print group
    console.log(Matrix.helpers.displayGroups(body));
  });

}

// TODO: support config <app>
