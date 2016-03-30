#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);

var pkgs = program.args;

var app = pkgs[0];

if (_.isUndefined(app)) {
  return console.error('Must specify command');
}
