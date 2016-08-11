#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var debug = debugLog('search');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  var i = Matrix.localization.get;
  program
    .parse(process.argv);
  var pkgs = program.args;

  if (!pkgs.length || showTheHelp) {
    console.log('\n> matrix search ¬\n');
    console.log('\t                 matrix search <app> -', i('matrix.search.help').grey)
    console.log('\n')
    process.exit(1);
  }
  debug(pkgs);
  var needle = pkgs[0];
  if (needle.length <= 2) {
    return console.error(i('matrix.search.small_needle') + '.')
  }
  // console.warn('Search not implemented yet')
  Matrix.api.app.search(needle, function (err, results) {
    if (err) return console.error(err);
    console.log(Matrix.helpers.displaySearch(results, needle));
    process.exit();

  })

  var search = pkgs[0];
})  
