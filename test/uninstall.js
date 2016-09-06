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
    context('uninstall', function () {
      it('should show a log in warning', function (done) {
        var uninstallProc = run('matrix', ['uninstall']);
        var outputs = new Array();
        this.timeout(15000)
        uninstallProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        uninstallProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        uninstallProc.on('close', function (code) {
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
    context('uninstall', function () {
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
      context('No parameters specified', function () {
        it('should show command "uninstall" usage', function (done) {
          var uninstallProc = run('matrix', ['uninstall']);
          var outputs = new Array();
          this.timeout(15000)
          uninstallProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString())
            outputs.push(out.toString());
          })
          uninstallProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          uninstallProc.on('close', function (code) {
            // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.uninstall.application_unspecified')), 'stdout Fail, expecting "' + t('matrix.uninstall.application_unspecified') + '"')
            done();
          })

        });
      });

      context('Parameters specified', function () {
        context('specified app doesn\'t exist', function () {
          it('should show a "specified app doesn\'t exist" warning', function (done) {
            var uninstallProc = run('matrix', ['uninstall', 'XXXX']);
            var outputs = new Array();
            uninstallProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString());
            })
            uninstallProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            uninstallProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.uninstall.app_undefined')), 'stdout Fail, expecting "' + t('matrix.uninstall.app_undefined') + '"')
              done();
            })
          });
        });

        context('specified app exists', function () {

          context('device is offline', function () {
            it('should show a "device is offline" warning', function (done) {
              var uninstallProc = run('matrix', ['uninstall', 'myhealthapp']);
              var outputs = new Array();
              uninstallProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              uninstallProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              uninstallProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.uninstall.device_offline')), 'stdout Fail, expecting "' + t('matrix.uninstall.device_offline') + '"')
                done();
              })
            });
          });

          context('device is online', function () {
            it('should uninstall the specified app', function (done) {
              var uninstallProc = run('matrix', ['uninstall', 'MyHealthApp']);
              var outputs = new Array();
              uninstallProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              uninstallProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              uninstallProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.uninstall.uninstalled')), 'stdout Fail, expecting "' + t('matrix.uninstall.uninstalled') + '"')
                done();
              })
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
