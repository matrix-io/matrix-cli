var run = require('child_process').spawn;
var exec = require('child_process').exec;
var assert = require('assert');
var Matrix;

// make CLI methods available
require('../bin/matrix-init')

// save variables here
M = {};
_ = require('lodash');
should = require('should');

// reusable test functions
fn = require('./_functions.js');

describe('can do groups', function() {
  this.timeout(500000);

  before(fn.setDevEnv);

  before(fn.login);

  before(done => {
    fn.registerDevice(() => {
      M.GROUP_DEVICES = M.GROUP_DEVICES || [];
      M.GROUP_DEVICES.push({
        id: M.DEVICE_ID,
        secret: M.DEVICE_SECRET
      });
      done();
    });
  });

  before(done => {
    fn.registerDevice(() => {
      M.GROUP_DEVICES.push({
        id: M.DEVICE_ID,
        secret: M.DEVICE_SECRET
      });
      done();
    });
  });

  it('`matrix group create (success)`', function(done) {
    var seed = Math.round(Math.random() * 1000000);
    M.GROUP_NAME = 'test-group-'+seed;
    fn.run('matrix group create '+M.GROUP_NAME, {
      checks: ['Group created']
    }, done);
  });

  it('`matrix group create (already exists)`', function(done) {
    fn.run('matrix group create '+M.GROUP_NAME, {
      checks: ['Group already exists']
    }, done);
  });  

  it('`matrix group create (no name)`', function(done) {
    fn.run('matrix group create', {
      checks: ['No group name provided']
    }, done);
  });  

  it('`matrix group list (no group)`', function(done) {
    fn.run('matrix group list xxxx', {
      checks: ['No group named']
    }, done);
  });  


  it('`matrix group list (empty group)`', function(done) {
    fn.run('matrix group list '+M.GROUP_NAME, {
      checks: ['Empty Group']
    }, done);
  });  

  describe('can add and remove devices from group', function () {
    // create group must run before
    before(fn.useGroup);

    it('`matrix group add (add two devices)`', function(done) {
      var deviceIds = [M.GROUP_DEVICES[0].id, M.GROUP_DEVICES[1].id];
      fn.run('matrix group add '+deviceIds.join(' '), {
        checks: ['2', 'device(s)', 'added', 'to', 'group']
      }, done);
    });

    it('`matrix group add (don\'t add duplicate)`', function(done) {
      var deviceIds = [M.GROUP_DEVICES[0].id];
      fn.run('matrix group add '+deviceIds.join(' '), {
        checks: ['0', 'device(s)', 'added', 'to', 'group']
      }, done);
    }); 

    it('`matrix group add (don\'t add not registered device)`', function(done) {
      var deviceIds = ['xxxxxx'];
      fn.run('matrix group add '+deviceIds.join(' '), {
        checks: ['is', 'not', 'a', 'device'] 
      }, done);
    }); 

    it('`matrix group list (show devices)`', function(done) {
      fn.run('matrix group list '+M.GROUP_NAME, {
        checks: [
          'ID: ', M.GROUP_DEVICES[0].id,
          'ID: ', M.GROUP_DEVICES[1].id
      ]
      }, done);
    });  

    it('`matrix group remove (remove two devices)`', function(done) {
      var deviceIds = [M.GROUP_DEVICES[0].id, M.GROUP_DEVICES[1].id];
      fn.run('matrix group remove '+deviceIds.join(' '), {
        checks: ['2', 'device(s)', 'removed', 'from', 'group'] 
      }, done);
    }); 

    it('`matrix group clear (success)`', function(done) {
      fn.run('matrix group clear '+M.GROUP_NAME, {
        checks: ['Group', 'Removed']
      }, done);
    });  
  });

/*
  describe('appdev lifecycle', function() {
    this.timeout(15000)
    before(function(done) {
      require('child_process').exec('rm -rf matrix-test-app matrix-test-app2')
      done()
    })

    it('`matrix create`', function(done) {
      fn.run('matrix create', {
        responses: [
          ['App Name', 'matrix-test-app\n'],
          ['Description', 'description\n'],
          ['Keywords', 'foo,bar\n'],
        ],
        checks: ['matrix-test-app'],
        postCheck: function(done) {
          var config = require('js-yaml').safeLoad(require('fs').readFileSync('./matrix-test-app/config.yaml'));
          assert((config.name === 'matrix-test-app'));
          assert((config.description === 'description'));
          assert((config.keywords === 'foo,bar'));
          done();
        }
      }, done)
    });

    it('`matrix create app-name`', function(done) {
      fn.run('matrix create matrix-test-app2', {
        responses: [
          ['Description', 'description\n'],
          ['Keywords', 'foo,bar\n'],
        ],
        checks: 'New Folder',
        postCheck: function(done) {
          var config = require('js-yaml').safeLoad(require('fs').readFileSync('./matrix-test-app2/config.yaml'));
          assert((config.name === 'matrix-test-app2'));
          assert((config.description === 'description'));
          assert((config.keywords === 'foo,bar'));
          done();
        }
      }, done)
    })
    this.timeout(45000)
    it('`matrix deploy`', function(done) {
      fn.run('matrix deploy matrix-test-app', {
        checks: 'Application installation SUCCESS'
      }, done)
    })
    it('`matrix list apps`', function(done) {
      fn.run('matrix list apps', {
        checks: 'matrix-test-app'
      }, done)
    })

    after(function(done) {
      require('child_process').exec('rm -rf matrix-test-app matrix-test-app2')
      done();
    })
  })
  */

  /*
  after(function(done) {
    Matrix.kill();
    done();
  })
  */

  //  after(fn.logout)
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