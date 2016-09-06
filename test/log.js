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

    context('log }', function () {
      it('should show a log in warning Log', function (done) {
        var logProc = run('matrix', ['log']);
        var outputs = new Array();
        this.timeout(15000)
        logProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        logProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        logProc.on('close', function (code) {
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
    context('log', function () {
      context('No parameters specified', function () {
        it('should show commands "log" usage', function (done) {
          var logProc = run('matrix', ['log']);
          var outputs = new Array();
          logProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString())
            outputs.push(out.toString())
          })
          logProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString())
          })
          logProc.on('close', function (code) {
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
        context(' device and app assigned', function () {
          context('unknown device and app specified', function () {
            it.skip('should show commands "log" usage', function (done) {
              var logProc = run('matrix', ['log', 'XXXXXXX', 'XXXXXXX']);
              var outputs = new Array();
              logProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              logProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              logProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.log.app_undefined')), 'stdout Fail, expecting"' + t('matrix.log.app_undefined') + '"')
                done()
              })
            });
          });
          context('log', function () {
            it.skip('Logs output from selected MatrixOS and applications', function (done) {
              var logProc = run('matrix', ['log', 'AdBeacon1', 'vehicle']);
              var outputs = new Array();

              logProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              logProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              logProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.log.logs_show')), 'stdout Fail, expecting"' + t('matrix.log.logs_show') + '"')
                done()
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