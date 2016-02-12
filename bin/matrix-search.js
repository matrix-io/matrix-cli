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
debug(pkgs);
  var needle = pkgs[0];
  if (needle.length <= 2){
    return console.error('Your needle is too small to find in our haystack.')
  }
  // console.warn('Search not implemented yet')
  Matrix.api.app.search(needle, function(err, results){
    if (err) return console.error(err);
    console.log(Matrix.helpers.displaySearch(results, needle));
    process.exit();

  })

var search = pkgs[0];
