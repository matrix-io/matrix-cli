var run = require('child_process').spawn;
var exec = require('child_process').execSync;

var assert = require('assert');



 describe.only('appdev lifecycle', function(){
   this.timeout(5000)
   it.only('`matrix create`', function(done){
     var proc = run('matrix',  ['create'])
     proc.stdin.write( 'matrix-test-app\n' )
     proc.stdin.write( 'description' );
     proc.stdin.write( 'foo,bar');
     proc.stdout.on('data', function(out){ console.log(out.toString())});
     proc.on('close', function () {
       var config = require('js-yaml').safeLoad('./matrix-test-app/config.yaml');
       assert( config.name === 'matrix-test-app' );
       assert( config.description === 'description');
       assert( config.keywords === 'foo,bar');
       console.log(config)
       done();
     })
   });

   it('`matrix create app-name`', function(done){
     fn.run('matrix create matrix-test-app2', {
       responses: [
         ['matrix-test-app', '\n'],
         ['Description', 'description\n'],
         ['Keywords', 'foo,bar\n'],
       ],
       checks: 'matrix-test-app2',
       postCheck: function(done){
         var config = require('js-yaml').safeLoad('./matrix-test-app2/config.yaml');
         assert( config.name === 'matrix-test-app2' );
         assert( config.description === 'description');
         assert( config.keywords === 'foo,bar');
         done();
       }
     }, done)
   })
   it('`matrix deploy`')
   it('`matrix list apps`')


   after(function (done) {
     require('child_process').exec('rm -rf matrix-test-app matrix-test-app2')
   })
 })
