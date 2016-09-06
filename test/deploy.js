// ----- DEVELOPMENT -----
require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table');

describe('----DEVELOPMENT----', function () {
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
    context('deploy', function () {//pasa
      it('should show a log in warning', function (done) {
        var deployProc = run('matrix', ['deploy']);
        var outputs = new Array();
        this.timeout(15000)
        deployProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        deployProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        deployProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.deploy.help', { app: '<app>' })), 'stdout Fail, expecting "' + t('matrix.deploy.help', { app: '<app>' }) + '"')
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

    context('deploy', function () {
      context('No parameters specified', function () {
        it('should show commands "deploy" usage', function (done) {
          var deployProc = run('matrix', ['deploy']);
          var outputs = new Array();

          deployProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString())
            outputs.push(out.toString())
          })
          deployProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString())
          })
          deployProc.on('close', function (code) {
            // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.deploy.help',{app:'<app>'})), 'stdout Fail, expecting  "' + t('matrix.deploy.help',{app:'<app>'}) + '"')
            done()
          })
        });
      });

      context('parameters specified', function () {
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
          it.skip('should show an "parameter doesn\'t exist', function (done) {
            var deployProc = run('matrix', ['deploy', 'XXXXX']);
            var outputs = new Array();
            deployProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            deployProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            deployProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.deploy.app_undefined')), 'stdout Fail, expecting \n "' + t(' matrix.deploy.app_undefined') + '"')
              done()
            })
          });
        });
        context('name device correct', function () {
          it('Deploys an app to the active MatrixOS', function (done) {
            var deployProc = run('matrix', ['deploy', 'vehicle']);
            var outputs = new Array();

            deployProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            deployProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            deployProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.deploy.deploy_app_successfully')), 'stdout Fail, expecting "' + t('matrix.deploy.deploy_app_successfully') + '"')
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