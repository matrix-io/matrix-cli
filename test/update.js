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
    context('update', function () {
      it('should show a log in warning', function (done) {
        var updateProc = run('matrix', ['update']);
        var outputs = new Array();
        this.timeout(15000)
        updateProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        updateProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        updateProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.update.help_update')), 'stdout Fail, expecting "' + t('matrix.update.help_update') + '"')
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

    context('update', function () {
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
        it('should show command "update" usage', function (done) {
          var updateProc = run('matrix', ['update']);
          var outputs = new Array();
          this.timeout(15000)
          updateProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString())
            outputs.push(out.toString());
          })
          updateProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          updateProc.on('close', function (code) {
            // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.update.help_update')), 'stdout Fail, expecting "' + t('matrix.update.help_update') + '"')
            done();
          })
        });
      });

      context('Parameters specified', function () {
        context('app', function () {
          context('device doesn\'t have the app installed', function () {
            it('should show a "device doesn\'t have the app installed"', function (done) {
              var updateProc = run('matrix', ['update', 'vehicle'])
              var outputs = new Array();

              updateProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              updateProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              updateProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.update.latest_version')), 'stdout Fail, expecting "' + t('matrix.update.latest_version') + '"')
                done();
              })
            });
          });

          context('device has the app installed', function () {
            it('should update the application to its latest version', function (done) {
              var updateProc = run('matrix', ['update', 'vehicle'])
              var outputs = new Array();
              updateProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              updateProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              updateProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.update.app_update_successfully')), 'stdout Fail, expecting "' + t('matrix.update.app_update_successfully') + '"')
                done();
              })
            });
          });

          context('app version', function () {
            context('version doesn\'t exist', function () {
              it.skip('should show a version doesn\'t exist warning', function (done) {
                var updateProc = run('matrix', ['update', 'vehicle', 'versionFake']);
                var outputs = new Array();
                updateProc.stdout.on('data', function (out) {
                  // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                updateProc.stderr.on('data', function (out) {
                  // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                updateProc.on('close', function (code) {
                  // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.update.version_undefined')), 'stdout Fail, expecting "' + t('matrix.update.version_undefined') + '"')
                  done();
                })
              });
            });

            context('version exists', function () {
              it('should update to that version', function (done) {
                var updateProc = run('matrix', ['update', 'veryfirstapp', '0.7'])
                var outputs = new Array();
                this.timeout(15000)
                updateProc.stdout.on('data', function (out) {
                  // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                updateProc.stderr.on('data', function (out) {
                  // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                updateProc.on('close', function (code) {
                  // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.update.upgrading_to')), 'stdout Fail, expecting "' + t('matrix.update.upgrading_to') + '"')
                  done();
                })
              });
            });
          });

          context('unknown parameter', function () {
            it.skip('should show a "parameter doesn\'t exist "', function (done) {
              var updateProc = run('matrix', ['update', 'veryfirstapp', 'XXXXX'])
              var outputs = new Array();
              updateProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              updateProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              updateProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.update.version_doesnt_exist')), 'stdout Fail, expecting "' + t('matrix.update.version_doesnt_exist') + '"')
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