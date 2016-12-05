var run = require('child_process').execSync;
function readConfig(){
return JSON.parse( require('fs').readFileSync(require('os').homedir() + '/.matrix/store.json') );
}

// make CLI methods available
require('../bin/matrix-init')

// save variables here
M = {};
_ = require('lodash');
should = require('should');

var Mocha = require('mocha');
var mocha = new Mocha();

// reusable test functions
fn = require('./_functions.js');

log=console.log;

// Instantiate a Mocha instance.

// log('Please ensure MatrixOS and Streaming Server are available.')
try {
  run('which matrix')
} catch(e) {
  console.log('`matrix` command is not installed. Run `npm link`.')
  process.exit(0);
} finally {
  console.log('========== Running MatrixOS CLI Tests!')
}

//
// setTimeout(function(){
//   Matrix.events.on('matrix-ready', function(){
//     var testDir = __dirname;
//
//     // Add each .js file to the mocha instance
//     fs.readdirSync(testDir).filter(function(file) {
//       // Only keep the .js files
//       return file.substr(-7) === 'test.js';
//
//     }).forEach(function(file) {
//       console.log(file);
//       mocha.addFile(
//         path.join(testDir, file)
//       );
//     });
//
//     // Run the tests.
//     mocha.run(function(failures) {
//       process.on('exit', function() {
//         process.exit(failures);
//       });
//     });
//   })
// }, 500 )
