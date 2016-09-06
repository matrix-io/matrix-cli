require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table');


describe('----SETUP----', function () {
  before(function (done) {
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () { })
    done();
  })
  describe('----Not logged In----', function () {
    before(function (done) {
      var loginProc = run('matrix', ['logout']);
      loginProc.stdout.on('data', function (out) {
        //console.log('stdout', out.toString());
      })
      loginProc.on('close', function (out) {
        done();
      })
    })
    context('use ', function () { //pasa
      it('should show a in warning', function (done) {
        var useProc = run('matrix', ['use']);
        var outputs = new Array();
        this.timeout(15000)
        useProc.stdout.on('data', function (out) {
          outputs.push(out.toString());

        });
        useProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });

        useProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.use.command_help')), 'stdout Fail, expecting "' + t('matrix.use.command_help') + '"')
          done();
        });
      });
    });
  })
  describe('----logged In----', function () {
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
    context('use', function () {
      context('No parameters specified ', function () {
        it('Show "use" command usage', function (done) {
          var useProc = run('matrix', ['use']);
          var outputs = new Array();
          useProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString())
            outputs.push(out.toString());
          });
          useProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString());
          })
          useProc.on('close', function (code) {
            outputs.should.matchAny(new RegExp(t('matrix.use.command_help')), 'stdout Fail, expecting "' + t('matrix.use.command_help') + '"')
            done();
          });
        });

      });

      context('Parameters specified', function () {

        context('Specified device doesn\'t exist', function () {
          it.skip('should show an "invalid device" warning', function (done) {
            var useDProc = run('matrix', ['use', 'xxxx']);
            var outputs = new Array();
            useDProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString());
            });
            useDProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString());
            })
            useDProc.on('close', function (code) {
              outputs.should.matchAny(new RegExp(t('matrix.use.device_not_found')), 'stdout Fail, expecting "' + t('matrix.use.device_not_found') + '"')
              done();
            });
          });

        });
        context('Current user doesn\'t have permission to use specified device', function () {
          it.skip('should show an "invalid device" warning', function (done) {
            var useProc = run('matrix', ['use', 'xxx']);
            var outputs = new Array();
            useProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString());
            });
            useProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString());
            })
            useProc.on('close', function (code) {
              outputs.should.matchAny(new RegExp(t('matrix.use.not_authorized')), 'stdout Fail, expecting "' + t('matrix.use.not_authorized') + '"')
              done();
            });
          });
        });
        context('Specified device exists', function () {
          it.skip('Show set device as current device', function (done) {
            var useProc = run('matrix', ['use', 'matrixSimulator']);
            var outputs = new Array();
            useProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString());
            });
            useProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString());
            })
            useProc.on('close', function (code) {
              outputs.should.matchAny(new RegExp(t('matrix.use.using_device_by_name')), 'stdout Fail, expecting "' + t('matrix.use.using_device_by_name') + '"')
              done();
            });

          });

        });
      });
    });
  })
})
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}