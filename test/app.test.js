var run = require('child_process').spawn;
var exec = require('child_process').exec;
var Matrix;


 describe('can manage apps', function () {
   this.timeout(15000);
   before(function(done){
     // fire up a matrix device -- fn.registerDevice must run before this
     var fs = require('fs');
     var admobModules = fs.readdirSync('../..');
     if ( admobModules.indexOf('matrix-os') < -1){
       done('No MATRIX OS found');
     } else {
       Matrix = require('child_process').fork('../matrix-os/index.js', {
         cwd: '../matrix-os/',
         env: {
           MATRIX_DEVICE_ID: M.DEVICE_ID || process.env.MATRIX_DEVICE_ID,
           MATRIX_DEVICE_SECRET: M.DEVICE_SECRET || process.env.MATRIX_DEVICE_SECRET,
           NO_UPGRADE: true,
           NODE_ENV: 'dev',
           TEST_MODE: true
         },
         stdio: 'ignore'
       })
       Matrix.on('message', function(msg){
         if ( msg['matrix-ready'] === true ){
           done();
           console.log('MatrixOS ready')
          }
       })
     }
   })

   before(fn.login);

   before(fn.useDevice);

   it('`matrix install`', function(done){
     fn.run('matrix install sensorTest', {
       responses: [
         ['OK to allow sensorTest', 'y\n']
       ],
       checks: ['SUCCESS']
     }, done)
   })

   it('`matrix list apps`', function(done){
     fn.run('matrix list apps', {
       checks: 'sensorTest'
     }, done)
   })

   it('`matrix start`', function(done){
     fn.run('matrix start sensorTest', {
       checks: ['Started:  sensorTest']
     }, done)
   })

   it('`matrix restart`', function(done){
     fn.run('matrix restart sensorTest', {
       checks: ['Restarted: sensorTest']
     }, done)
   })

   it('`matrix stop`', function(done){
     fn.run('matrix stop sensorTest', {
       checks: ['Stopped: sensorTest']
     }, done)
   })

   it('`matrix uninstall`', function (done) {
     fn.run('matrix uninstall sensorTest', {
       checks: 'Uninstall Progress:Uninstall sent to device...'
     }, done)
   })


   after(function (done) {
     Matrix.kill();
     done();
   })

   after(fn.logout)
    //
    // it('`matrix list apps`')
    // it('`matrix search`')
    // // it('`matrix search -s`')
    // it('`matrix install`')
    // // it('`matrix install sensor`')
    // it('`matrix uninstall`')
    // // it('`matrix update`')
    // it('`matrix start`', function(done){
    //   var proc = run('matrix', ['start','monitor'])
    //
    //   proc.stdout.on('data', function(out){
    //     if (out.toString().indexOf('error') > -1 ){
    //       done(new Error('error: ' + out.toString() ))
    //     } else if (out.toString().indexOf('Started:  monitor') > -1 ){
    //       done()
    //     }
    //   })
    // })
    //
    // it('`matrix stop`', function(done){
    //
    //     var proc = run('matrix', ['stop','monitor'])
    //     proc.stdout.on('data', function(out){
    //       console.log(out.toString())
    //       if (out.toString().indexOf('error') > -1){
    //         done(new Error('error: '+ out.toString() ))
    //       } else if (out.toString().indexOf('Stopped: monitor') > -1 ){
    //         done()
    //       }
    //     })
    // })
    // it('`matrix set config`')
    // it('`matrix set config app`')
    // it('`matrix set config app key`')
    // it('`matrix set config app key=value`')
  })

  // describe('has application development functions', function(){
  //   it('`matrix create`', function (done) {
  //     var name = 'matrixtestapp-' + _.map(Array(8), function(){
  //       return Math.round(Math.random()*16).toString(16)
  //     }).join('');
  //
  //     require('child_process').spawnSync('matrix', ['create', name ])
  //     var fs = require('fs');
  //     if ( fs.statSync( name ).isDirectory() ) {
  //       exec('rm -r '+ name);
  //       done();
  //     } else {
  //       done('Matrix Create Error')
  //     }
  //   })
  //   it('`matrix deploy`')
  //   it('`matrix trigger`')
  //   it('`matrix log`')
  // })
