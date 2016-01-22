require('./matrix-init');
var program = require('commander');

program
  .parse(process.argv);
var pkgs = program.args;

if (!pkgs.length) {
  console.log('\n> matrix search ¬\n');
  console.log('\t                 matrix search <app> -', 'find matrix apps'.grey)
  console.log('\n')
  process.exit(1);
}

if (pkgs[0] === 'search'){
  var needle = pkgs[1];
  console.warn('Search not implemented yet')
  Matrix.api.app.search(needle, function(err, results){
    if (err) return console.error(err);
    console.log(Matrix.helpers.appSearch);
    process.exit();

  })
}

var search = pkgs[0];
