#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('search');
var firebase = require('matrix-firebase');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  program
    .parse(process.argv);
  var pkgs = program.args;

  if (!pkgs.length || showTheHelp) {
    console.log('\n> matrix search ¬\n');
    console.log('\t                 matrix search <app> -', t('matrix.search.help').grey)
    console.log('\n')
    process.exit(1);
  }
  debug(pkgs);
  var needle = pkgs[0];
  if (needle.length <= 2) {
    return console.error(t('matrix.search.small_needle') + '.')
  }
  // console.warn('Search not implemented yet')
  firebase.init(
    Matrix.config.user.id,
    Matrix.config.device.identifier,
    Matrix.config.user.token,
    function (err) {
      debug("Firebase Init");
      if (err) return console.error('Firebase Fail'.red, err);

      firebase.app.search(needle, function(data){
          if ( !_.isNull(data) ) {
            console.log( data )
          }
      });
      //Get app with name X
      //Get versionId of appId with version X
    }
  );
  // Matrix.api.app.search(needle, function (err, results) {
  //   if (err) return console.error(err);
  //   console.log(Matrix.helpers.displaySearch(results, needle));
  //   process.exit();
  //
  // })

  var search = pkgs[0];
})
