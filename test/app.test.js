var run = require('child_process').spawn;
var exec = require('child_process').exec;

function runMatrix(cmd, target, errors, cb){

  // support 3 args
  if ( arguments.length === 3 ){
    cb = errors;
  }

  var cmd = cmd.split(' ')
  var proc = run('matrix', cmd);
  proc.stdout.on('data', function(out){
    var out = out.toString();


  })

}

 describe('has application management functions', function () {
   this.timeout(15000)

   // remove this for integrated dev
   before(function(done){
     //demo.admobilize@gmail.com // Password: admobdemo2016
     exec('matrix set env local')
     done();
   })


    it('`matrix list apps`')
    it('`matrix search`')
    // it('`matrix search -s`')
    it('`matrix install`')
    // it('`matrix install sensor`')
    it('`matrix uninstall`')
    // it('`matrix update`')
    it('`matrix start`', function(done){
      var proc = run('matrix', ['start','monitor'])

      proc.stdout.on('data', function(out){
        if (out.toString().indexOf('error') > -1 ){
          done(new Error('error: ' + out.toString() ))
        } else if (out.toString().indexOf('Started:  monitor') > -1 ){
          done()
        }
      })
    })

    it('`matrix stop`', function(done){

        var proc = run('matrix', ['start','monitor'])
        proc.stdout.on('data', function(out){
          console.log(out.toString())
          if (out.toString().indexOf('error') > -1){
            done(new Error('error: '+ out.toString() ))
          } else if (out.toString().indexOf('Stopped: monitor') > -1 ){
            done()
          }
        })
    })
    it('`matrix set config`')
    it('`matrix set config app`')
    it('`matrix set config app key`')
    it('`matrix set config app key=value`')
  })

  describe('has application development functions', function(done){
    it('`matrix create`', function () {
      var name = _.map(Array(16), function(){
        return Math.round(Math.random()*16).toString(16)
      }).join('');

      run('matrix', ['create', name ])
      var fs = require('fs');
      if ( fs.stat( name ).isDirectory() ) {
        exec('rm -r '+ name);
        done();
      } else {
        done('Matrix Create Error')
      }
    })
    it('`matrix deploy`')
    it('`matrix trigger`')
    it('`matrix log`')
  })
