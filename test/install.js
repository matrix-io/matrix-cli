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
    context('install', function () {
      it('should show a log in warning', function (done) {
        var installProc = run('matrix', ['install']);
        var outputs = new Array();
        this.timeout(15000)
        installProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        installProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        installProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.install.help_app', { app: '<app>' })), 'stdout Fail, expecting "' + t('matrix.install.help_app', { app: '<app>' }) + '"')
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

    context('install', function () {
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
        it('should show command "install" usage', function (done) {
          var installProc = run('matrix', ['install']);
          var outputs = new Array();
          installProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString());
            outputs.push(out.toString());
          })
          installProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          installProc.on('close', function (code) {
            // console.log('close', outputs);
            outputs.should.matchAny(new RegExp(t('matrix.install.command_help')), 'stdout Fail, expecting "' + t('matrix.install.command_help') + '"')
            done();
          })

        });
      });

      context('Parameters specified', function () {

        context('Invalid app/sensor name', function () {
          it('should show invalid "app/sensor" warning', function (done) {
            var installProc = run('matrix', ['install', 'XXXXXX'])
            var outputs = new Array();
            this.timeout(15000)
            installProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString());
              outputs.push(out.toString());
            })
            installProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            installProc.on('close', function (code) {
              // console.log('close', outputs);
              outputs.should.matchAny(new RegExp(t('matrix.install.app_not_found', { app: '<app>' })), 'stdout Fail, expecting "' + t('matrix.install.app_not_found', { app: '<app>' }) + '"')
              done();
            })
          });
        });

        context('Valid app/sensor name', function () {
          context('app is already installed', function () {
            it('should show warning app already installed', function (done) {
              var installProc = run('matrix', ['install', 'Test Ruben']);
              var outputs = new Array();
              this.timeout(15000);
              installProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString());
                installProc.kill('SIGINT');
                outputs.push(out.toString());
              })
              installProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              installProc.on('close', function (code) {
                // console.log('close', outputs);
                outputs.should.matchAny(new RegExp(t('matrix.install.installing')), 'stdout Fail, expecting "' + t('matrix.install.installing') + '"')
                done();
              })
            });
          });
          context('app isn\'t already installed', function () {
            it('should install the app or sensor specified to active MatrixOS device', function (done) {
              var installProc = run('matrix', ['install', 'hello1']);
              var outputs = new Array();
              this.timeout(15000);
              installProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              installProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              installProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.install.installing')), 'stdout Fail, expecting "' + t('matrix.install.installing') + '"')
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