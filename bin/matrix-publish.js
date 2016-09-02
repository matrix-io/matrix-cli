#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('publish');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }  
  
  Matrix.validate.user();
  var app = Matrix.pkgs[0];

  Matrix.firebaseInit(function () {
    // check vs folder name
    // check vs config name
    // upload to firebase -> url
    // tell user to install url

    //or

    //TODO Change app state from approved to published    
  });

  function displayHelp() {
    console.log('\n> matrix publish ¬\n');
    console.log('\t    matrix publish <app> -', t('matrix.publish.help').grey, {app: '<app>'})
    console.log('\n')
    process.exit(1);
  }
  
});