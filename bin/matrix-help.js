#!/usr/bin/env node

var program = require('commander');

program
  .option('-f, --force', 'force installation')
  .parse(process.argv);

var pkgs = program.args;

if (!pkgs.length) {
  console.error('packages required');
  process.exit(1);
}

console.log('====', pkgs);

console.log();
if (program.force) console.log('  force: install');
pkgs.forEach(function(pkg){
  console.log('  install : %s', pkg);
});
console.log();
