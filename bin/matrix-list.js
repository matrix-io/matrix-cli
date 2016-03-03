#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);
var pkgs = program.args;

if (!pkgs.length) {
  displayHelp();
}

var target = pkgs[0];


if (target.match(/all/)){
  Matrix.api.device.getAppList(Matrix.config.device.identifier, function(err, resp){
    if (err) return console.error('App List Error:', err);
    if (_.isEmpty(resp)) return console.error('No Results Found');
    debug('Device List>', resp);
    console.log( Matrix.helpers.displayDeviceApps(resp) );
  });

} else if (target.match(/app/)) {

  Matrix.api.app.list(function(apps){
    console.log(Matrix.helpers.displayApps(apps));
    process.exit();
  });

} else if (target.match(/device/)) {

  var group = pkgs[1];
  /** do nothing if not device **/
  if (group !== undefined) {
    // Matrix.api.user.setToken(Matrix.config.user.token);
    var options = {
      group: group
    };
    Matrix.api.device.list(options, function(body) {
      //print device
      console.log(Matrix.helpers.displayDevices(body));
      process.exit();
    });
  } else {
    Matrix.api.device.list({}, function(body) {
      //print device
      console.log(Matrix.helpers.displayDevices(body));
      // save device map to config
      Matrix.config.deviceMap = _.map(JSON.parse(body).results, function(d){
        return { name: d.name, id: d.deviceId }
      });
      Matrix.helpers.saveConfig(function(){
        process.exit();
      });

    });
  }

} else if (target.match(/group/)) {

  /** do nothing if not device **/
  Matrix.api.group.list(function(body) {
    //print group
    console.log(Matrix.helpers.displayGroups(body));
    process.exit();
  });
} else {
  displayHelp();
}

function displayHelp(){
  console.log('\n> matrix list ¬\n');
  console.log('\t    matrix list devices -', 'display available devices'.grey)
  console.log('\t     matrix list groups -', 'display groups of devices'.grey)
  console.log('\t       matrix list apps -', 'display apps on current device'.grey)
  console.log('\t        matrix list all -', 'display all devices with installed apps'.grey)
  console.log('\n')
  process.exit(1);
}

// TODO: support config <app>
