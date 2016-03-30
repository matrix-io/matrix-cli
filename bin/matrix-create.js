#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');


var fs = require('fs');
var tar = require('tar');


program
  .parse(process.argv);

var pkgs = program.args;

var app = pkgs[0];

if (_.isUndefined(app)) {
  return console.error('Must specify app name');
}

function onError(err) {
  console.error('An error occurred:', err);
}

function onEnd() {
  console.log('New Folder:>'.grey, app.green + '/'.grey);
  console.log('        app.js'.grey, '-', 'this is your application logic')
  console.log('   config.json'.grey, '-', 'change variables, indicate sensors, configure dashboard')
  console.log('  DEVELOPER.MD'.grey, '-', 'information about developing Matrix apps')
  console.log('      index.js'.grey, '-', 'app entry point, do not modify')
  console.log('  package.json'.grey, '-', 'node.js information file, do not modify without knowledge')
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
