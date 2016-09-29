#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('create');
var fs = require('fs');
var tar = require('tar');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    Matrix.stopLoader();
    return displayHelp();
  }
  Matrix.startLoader();
  var app = Matrix.pkgs[0];

  function onError(err) {
    Matrix.stopLoader();
    console.error(t('matrix.create.error_creating') + ':', err);
    process.exit(1);
  }


  function onEnd() {
    Matrix.stopLoader();
    console.log(t('matrix.create.new_folder') + ':>'.grey, app.green + '/'.grey);
    console.log('         app.js'.grey, '-', t('matrix.create.description_app'))
    console.log('    config.json'.grey, '-', t('matrix.create.description_config'))
    console.log('config-big.json'.grey, '-', t('matrix.create.description_config_big'))
    console.log('   DEVELOPER.MD'.grey, '-', t('matrix.create.description_developer'))
    console.log('       index.js'.grey, '-', t('matrix.create.description_index'))
    console.log('   package.json'.grey, '-', t('matrix.create.description_package'))
  }

  //TODO check if path already exists, refuse if so

  var extractor = tar.Extract({
    path: process.cwd() + "/" + app,
    strip: 1
  })
    .on('error', onError)
    .on('end', onEnd);

  fs.createReadStream(__dirname + "/../baseapp.tar")
    .on('error', onError)
    .pipe(extractor);
  // unzip baseApp.zip to named folder
  //


  function displayHelp() {
    console.log('\n> matrix create ¬\n');
    console.log('\t    matrix create <app> -', t('matrix.create.help', { app: '<app>'}).grey)
    console.log('\n')
    process.exit(1);
  }
});
