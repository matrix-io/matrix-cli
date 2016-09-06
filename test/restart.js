// ----- APPS -----
require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table');

describe('----APPS----', function () {
  before(function (done) {
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () { })
    done();
  })
  describe('----No logged in----', function () {
    before(function (done) {
      this.timeout(15000)
      var loginProc = run('matrix', ['logout']);
      loginProc.stdout.on('data', function (out) {
        //console.log('stdout', out.toString());
      })
      loginProc.on('close', function (out) {
        done();
      })
    })
    context('restart', function () { //pasa
      it('should show a log in warning', function (done) {
        var restartProc = run('matrix', ['restart']);
        var outputs = new Array();
        this.timeout(15000)
        restartProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        restartProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        restartProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });
      });
    });
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
    context('restart', function () {

      context('No parameters specified', function () {
        it('should show command "restart" usage', function (done) {
          var restartProc = run('Matrix', ['restart']);
          var outputs = new Array();

          restartProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString())
            outputs.push(out.toString())
          })
          restartProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString())
          })
          restartProc.on('close', function (code) {
            // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting"' + t('matrix.validate.no_device') + '"')
            done()
          })
        });
      });

      context(' parameters specified', function () {
        before(function (done) {
          this.timeout(15000);
          var useProc = run('matrix', ['use', 'AdBeacon1']);
          var outputs = new Array();
          useProc.stdout.on('data', function (out) {
            outputs.push(out.toString());
          });
          useProc.on('close', function (code) {
            // console.log(outputs);
            done();
          });
        });
        context('unknown parameter', function () {
          it('should show an "parameter doesn\'t exist', function (done) {
            var restartProc = run('Matrix', ['restart', 'XXXX']);
            var outputs = new Array();


            restartProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            restartProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            restartProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.restart.restarting_app')), 'stdout Fail, expecting"' + t('matrix.restart.restarting_app') + '"')
              done()
            })
          });
        });

        context('restart', function () {
          it('Restarts an app running on the MatrixOS', function (done) {
            var restartProc = run('Matrix', ['restart', 'vehicle']);
            var outputs = new Array();


            restartProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            restartProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            restartProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.restart.restarting_app')), 'stdout Fail, expecting"' + t('matrix.restart.restarting_app') + '"')
              done()
            })
          });

        });
      });
    });
  })
})
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}