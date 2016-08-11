#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('sdk');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

program
.parse(process.argv);
var pkgs = program.args;

if (!pkgs.length || showTheHelp) {
  displayHelp();
}

var target = pkgs[0];

var firebase = require('matrix-firebase')

firebase.init(
  Matrix.config.user.id,
  Matrix.config.device.identifier,
  Matrix.config.user.token,
  function (err){
    if (err) return console.error(err);


    if (target.match(/all/)){
      Matrix.api.device.getAppList(Matrix.config.device.identifier, function(err, resp){
        if (err) return console.error('App List Error:', err);
        if (_.isEmpty(resp)) return console.error('No Results Found');
        debug('Device List>', resp);
        console.log( Matrix.helpers.displayDeviceApps(resp) );
      });

    } else if (target.match(/app/)) {

      firebase.app.list( function(err, apps){
        console.log(Matrix.helpers.displayApps(apps));
        process.exit();
      });

     } else if (target.match(/group/)) {

    /** do nothing if not device **/
    Matrix.api.group.list(function (body) {
      //print group
      console.log(Matrix.helpers.displayGroups(body));
      process.exit();
    });
  } else {
    displayHelp();
  }
});

  function displayHelp() {
    console.log('\n> matrix list ¬\n');
    console.log('\t    matrix list devices -', t('matrix.list.help_devices').grey)
    console.log('\t     matrix list groups -', t('matrix.list.help_groups').grey)
    console.log('\t       matrix list apps -', t('matrix.list.help_apps').grey)
    console.log('\t        matrix list all -', t('matrix.list.help_all').grey)
    console.log('\n')
    process.exit(1);
  }

  // TODO: support config <app>
});
