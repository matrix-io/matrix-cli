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
    context('config', function () {
      it('should show a log in warning', function (done) {
        var configProc = run('matrix', ['config']);
        var outputs = new Array();
        this.timeout(15000)
        configProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        configProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        configProc.on('close', function (code) {
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
    context('config', function () { //pending by error tokens
        context('No parameters specified', function () {
          it('should show device configurations', function (done) {
            var configProc = run('matrix', ['config']);
            var outputs = new Array();
            this.timeout(15000)
            configProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString())
              outputs.push(out.toString());
            })
            configProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            configProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.config.help')), 'stdout Fail, expecting "' + t('matrix.config.help') + '"')
              done();
            })
          });
        });

        context('Parameters specified', function () {

          context('specified app doesn\'t exist', function () {
            it('should show an "specified app doesn\'t exist" warning', function (done) {
              var configProc = run('matrix', ['config', 'XXXXX']);
              var outputs = new Array();

              configProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              configProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              configProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.config.specified_application_does_not_exist')), 'stdout Fail, expecting "' + t('matrix.config.specified_application_does_not_exist') + '"')
                done();
              })

            });
          });
          context('specified app exists', function () { //danilo
            context('app', function () {
              it('should show application configurations', function (done) {

                var configProc = run('matrix', ['config', 'clock', '']);
                var outputs = new Array();
                configProc.stdout.on('data', function (out) {
                  // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                configProc.stderr.on('data', function (out) {
                  // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                configProc.on('close', function (code) {
                  // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.config.specify_key')), 'stdout Fail, expecting "' + t('matrix.config.specify_key') + '"')
                  done();
                })
              });
            });

            context('app key', function () {
              context('specified key doesn\'t exist', function () {
                it('should show a "specified key doesn\'t exist" warning', function (done) {
                  var configProc = run('matrix', ['config', 'clock', 'XXXXX']);
                  var outputs = new Array();
                  configProc.stdout.on('data', function (out) {
                    // console.log('stdout', out.toString())
                    outputs.push(out.toString());
                  })
                  configProc.stderr.on('data', function (out) {
                    // console.log('stderr', out.toString())
                    outputs.push(out.toString());
                  })
                  configProc.on('close', function (code) {
                    // console.log('close', outputs)
                    outputs.should.matchAny(new RegExp(t('matrix.config.key_doesnt_exist')), 'stdout Fail, expecting "' + t('matrix.config.key_doesnt_exist') + '"')
                    done();
                  })
                });
              });

              context('specified key exists', function () {
                it.skip('should show application configuration key', function (done) {
                  var configProc = run('matrix', ['config', 'clock', 'name']);
                  var outputs = new Array();

                  configProc.stdout.on('data', function (out) {
                    // console.log('stdout', out.toString())
                    outputs.push(out.toString());
                  })
                  configProc.stderr.on('data', function (out) {
                    // console.log('stderr', out.toString())
                    outputs.push(out.toString());
                  })
                  configProc.on('close', function (code) {
                    // console.log('close', outputs)
                    outputs.should.matchAny(new RegExp(t('matrix.config.help_app_key')), 'stdout Fail, expecting "' + t('matrix.config.help_app_key') + '"')
                    done();
                  })
                });
              });
            });

            context('app key value', function () {
              it.skip('should set application configuration key value', function (done) {
                var configProc = run('matrix', ['config', 'clock', 'name=brayan']);
                var outputs = new Array();

                configProc.stdout.on('data', function (out) {
                  // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                configProc.stderr.on('data', function (out) {
                  // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                configProc.on('close', function (code) {
                  // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.config.key_value')), 'stdout Fail, expecting "' + t('matrix.config.key_value') + '"')
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
