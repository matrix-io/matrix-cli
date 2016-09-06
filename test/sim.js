// ---MANAGEMENT
require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table');
describe('----MANAGEMENT----', function () {
  before(function (done) {
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () { })
    done();
  })
  describe('----No logged in----', function () {
    before(function (done) {
      var loginProc = run('matrix', ['logout']);
      loginProc.stdout.on('data', function (out) {
        //console.log('stdout', out.toString());
      })
      loginProc.on('close', function (out) {
        done();
      })
    })
    context('sim', function () {//pasa
      it('should show a log in warning', function (done) {
        var simProc = run('matrix', ['sim']);
        var outputs = new Array();
        this.timeout(15000)
        simProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        simProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });

        simProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.sim.help_upgrade')), 'stdout Fail, expecting "' + t('matrix.sim.help_upgrade') + '"')
          done();
        });
      });
    }); // Finish sim
  })
  describe('----logged in----', function () {
    before(function (done) {
      var loginProc = run('matrix', ['login']);
      var outputs = new Array();
      this.timeout(15000)
      loginProc.stdout.on('data', function (out) {
        outputs.push(out.toString());
        if (out.indexOf('username') > -1) {
          loginProc.stdin.write('demo.admobilize@gmail.com\n')
          //outputs.push(out.toString());
        } else if (out.toString().indexOf('password') > -1) {
          loginProc.stdin.write('admobdemo2016\n')
        } else if (out.toString().indexOf('Login Successful') > -1) {
          //console.log(out.toString().red);
          if (readConfig().user.hasOwnProperty('token')) {
            //console.log(outputs.toString().red);
          }
        }
      })
      loginProc.on('close', function (out) {
        done();
      })
    })
    context('No parameters specified ', function () {
      it('Show "sim" command usage', function (done) {
        var simProc = run('matrix', ['sim', '']);
        var outputs = new Array();
        simProc.stdout.on('data', function (out) {
           console.log('stdout', out.toString());
          outputs.push(out.toString());
        });
        simProc.stderr.on('data', function (out) {
           console.log('stderr', out.toString());

        })

        simProc.on('close', function (code) {
          // console.log('close', outputs)
          outputs.should.matchAny(new RegExp(t('matrix.sim.help_upgrade')), 'stdout Fail, expecting "' + t('matrix.sim.help_upgrade') + '"')
          done();
        });
      });
    });
    context('Parameters specified init ', function () {

      context('init', function () { //pending  capture of data 
        it('should request simulator settings', function (done) {
          var simProc = run('matrix', ['sim', 'init']);
          var outputs = new Array();
          simProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString());
            //simProc.stdin.write('Examsssple\n');
            simProc.kill('SIGINT');
            outputs.push(out.toString());
          });
          simProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString());
          })

          simProc.on('close', function (code) {
            // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.sim.init.specify_data_for_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.specify_data_for_init') + '"')
            done();
          });


        });

      });

      context('Simulator hasn\'t been initialized', function () {

        context('restore', function () { //pending for Error 
          it('should show an "initialize simulator" warning', function (done) {
            var simProc = run('matrix', ['sim', 'restore']);
            var outputs = new Array();
            this.timeout(15000)
            simProc.stdout.on('data', function (out) {
              outputs.push(out.toString());
            });
            simProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
            })
            simProc.on('close', function (code) {
              outputs.should.matchAny(new RegExp(t('matrix.sim.restore.downloading_image')), 'stdout Fail, expecting "' + t('matrix.sim.restore.downloading_image') + '"')
              done();
            });
          });
        });
      })
    });
  });
});
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}