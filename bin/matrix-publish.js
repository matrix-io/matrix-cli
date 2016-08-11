require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);
var pkgs = program.args;
var name = pkgs[0];

if ( !_.isUndefined(name)){
  // check vs folder name
  // check vs config name
  // upload to firebase -> url
  // tell user to install url
}

function showHelp(){
  console.log('matrix publish <name>')
}
