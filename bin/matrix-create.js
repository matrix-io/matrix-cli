#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var fs = require('fs');
var tar = require('tar');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var i = Matrix.localization.get;
  program
    .parse(process.argv);

  var pkgs = program.args;

  var app = pkgs[0];

  if (_.isUndefined(app)) {
    return console.error(i('matrix.create.name_undefined'));
  }

  function onError(err) {
    console.error(i('matrix.create.error_creating') + ':', err);
  }

  function onEnd() {
    console.log(i('matrix.create.new_folder') + ':>'.grey, app.green + '/'.grey);
    console.log('        app.js'.grey, '-', i('matrix.create.description_app'))
    console.log('   config.json'.grey, '-', i('matrix.create.description_config'))
    console.log('  DEVELOPER.MD'.grey, '-', i('matrix.create.description_developer'))
    console.log('      index.js'.grey, '-', i('matrix.create.description_index'))
    console.log('  package.json'.grey, '-', i('matrix.create.description_package'))
  }

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
});