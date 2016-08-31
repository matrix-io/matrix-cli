var run = require('child_process').spawn;
var exec = require('child_process').exec;

  describe('has admin functions', function(){
    this.timeout(15000)
    before(function(done){
      //demo.admobilize@gmail.com // Password: admobdemo2016
      exec('matrix set env dev')
      done();
    })

    describe('can manage user state', function () {
      // it('`matrix register`')


      it('`matrix login`', function(done){
        var loginProc = run('matrix', ['login']);
        loginProc.stdout.on('data', function(out){
          // console.log(out.toString())
          if ( out.toString().indexOf('username') > -1 ){
            loginProc.stdin.write('demo.admobilize@gmail.com\n')
          } else if ( out.toString().indexOf('password') > -1){
            loginProc.stdin.write('admobdemo2016\n')
          } else if ( out.toString().indexOf('Login Successful') > -1){
            // console.log(readConfig())
            if ( readConfig().user.hasOwnProperty( 'token' )) {
              done();
              loginProc.kill();
            }
          }


        })
        // console.log(readConfig())
      })

      it('`matrix use`', function (done) {
        var useProc = run('matrix', ['use 123456']);
        useProc.stdout.on('data', function (out) {
          var out = out.toString();

          if ( out.indexOf('demo') > -1 ){
            done();
          }
        })
      })

      // after('`matrix logout`', function (done) {
      //   var loginProc = run('matrix', ['logout'])
      //   loginProc.stdout.on('data', function(out){
      //     // console.log(out.toString())
      //     var f = false;
      //     if (f === false && out.toString().indexOf('Logged Out Successfully')){
      //       f = true;
      //       done();
      //       loginProc.kill();
      //     }
      //   })
      // })
    })
    describe('can set an environment', function () {
      it('`matrix set env local`', function(done){
        var loginProc = run('matrix', ['set','env','local'])
        loginProc.stdout.on('data', function(out){
          if (out.toString().indexOf('Env: local') > -1 ){
            done();
            loginProc.kill();
          }
        })
      })
      it('`matrix set env production`', function(done){
        var loginProc = run('matrix', ['set','env','production'])
        loginProc.stdout.on('data', function(out){
          if (out.toString().indexOf('Env: production') > -1){
            done();
            loginProc.kill();
          }
        })
      })
      it('`matrix set env dev`', function(done){
        var loginProc = run('matrix', ['set','env','dev'])
        loginProc.stdout.on('data', function(out){
          if (out.toString().indexOf('Env: dev') > -1){
            done();
            loginProc.kill();
          }
        })
      })
    })
  })

function readConfig(){
  return JSON.parse( require('fs').readFileSync('./store.json') );
}
