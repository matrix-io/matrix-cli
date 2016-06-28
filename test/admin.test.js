var run = require('child_process').spawn;
var exec = require('child_process').exec;

  describe('has admin functions', function(){
    before(function(done){
      //demo.admobilize@gmail.com // Password: admobdemo2016
      exec('matrix set env dev')
      done();
    })

    describe('can manage user state', function () {
      // it('`matrix register`')


      it('`matrix login`', function(done){
        this.timeout(15000)
        var loginProc = run('matrix', ['login']);
        var finished = false;
        loginProc.stdout.on('data', function(out){
          console.log(out.toString())
          if ( out.toString().indexOf('username') > -1 ){
            loginProc.stdin.write('demo.admobilize@gmail.com\n')
          } else if ( out.toString().indexOf('password') > -1){
            loginProc.stdin.write('admobdemo2016\n')
          } else {

          }

          if (finished === false && out.toString().indexOf('Login Successful') === 0){
            console.log(readConfig())
            finished = true;
            done();
            loginProc.kill();
          }
        })
        // console.log(readConfig())
          // if ( readConfig().user.hasOwnProperty( 'token' )) {
          //   done();
          // }
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
          var f = false;
          if (f === false && out.toString().indexOf('Env: local')){
            f = true;
            done();
          }
        })
      })
      it('`matrix set env production`', function(done){
        var loginProc = run('matrix', ['set','env','production'])
        loginProc.stdout.on('data', function(out){
          var f = false;
          if (f === false && out.toString().indexOf('Env: production')){
            f = true;
            done();
          }
        })
      })
      it('`matrix set env dev`', function(done){
        var loginProc = run('matrix', ['set','env','dev'])
        loginProc.stdout.on('data', function(out){
          var f = false;
          if (f === false && out.toString().indexOf('Env: dev')){
            f = true;
            done();
          }
        })
      })
    })
  })

function readConfig(){
  return JSON.parse( require('fs').readFileSync('./tmp/store.json') );
}
