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
    context('list', function () {//pasa
      it('should show a log in warning', function (done) {
        var listProc = run('matrix', ['list']);
        var outputs = new Array();
        this.timeout(15000)
        listProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        listProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        listProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.list.help_devices')), 'stdout Fail, expecting "' + t('matrix.list.help_devices') + '"')
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
    context('list', function () {

      context('No parameters specified', function () {
        it('Show "list" command usage', function (done) {
          var listProc = run('matrix', ['list', '']);
          var outputs = new Array();
          this.timeout(15000)
          listProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString());
            outputs.push(out.toString());
          })
          listProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString());
          })
          listProc.stdout.on('close', function (code) {
            // console.log('Close', outputs);
            outputs.should.matchAny(new RegExp(t('matrix.list.help_devices')), 'stdout Fail, expecting "' + t('matrix.list.help_devices') + '"')
            done();
          })
        });
      });

      context('Parameters specified', function () {
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
        context('devices', function () {
          it('display available devices', function (done) { //No se puede recibir la tabla de devices 
            var listProc = run('matrix', ['list', 'devices']);
            var outputs = new Array();
            this.timeout(15000);
            listProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString());
              outputs.push(out.toString());
            });
            listProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            listProc.on('close', function (code) {
              // console.log('close', outputs);
              outputs.should.matchAny(new RegExp(t('matrix.list.list_devices')), 'stdout Fail, expecting "' + t('matrix.list.list_devices') + '"')
              done();
            });
          });
        });




        context('groups', function () {
          it.skip('display groups of devices', function (done) {
            var groupsProc = run('matrix', ['list', 'groups'])
            var outputs = new Array();
            groupsProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            groupsProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            groupsProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.list.list_groups')), 'stdout Fail, expecting "' + t('matrix.list.list_groups') + '"')
              done()
            })
          });
        });

        context('apps', function () {
          it('display apps on current device', function (done) {
            var appsProc = run('matrix', ['list', 'apps'])
            var outputs = new Array();
            this.timeout(15000)
            appsProc.stdout.on('data', function (out) {
              //console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            appsProc.stderr.on('data', function (out) {
              //console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            appsProc.on('close', function (code) {
              //console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.list.list_apps')), 'stdout Fail, expecting "' + t('matrix.list.list_apps') + '"')
              done()
            })
          });
        });

        context('all', function () {
          it('display all devices with installed apps', function (done) {
            var allProc = run('matrix', ['list','all'])
            var outputs = new Array();
            this.timeout(15000)
            allProc.stdout.on('data', function (out) {
             console.log('stdout', out.toString());
             allProc.kill('SIGINT');
             outputs.push(out.toString())
              outputs.should.matchAny(new RegExp(t('matrix.list.list_all')), 'stdout Fail, expecting "' + t('matrix.list.list_all') + '"')
              done()
            })
            allProc.on('close', function (code) {
              outputs.should.matchAny(new RegExp(t('matrix.list.list_all')), 'stdout Fail, expecting "' + t('matrix.list.list_all') + '"')
              done()
            })
          });
        });

        context('Unknown parameter specified', function () {
          it('should display an "unknown parameter warning"', function (done) {

            var unknownProc = run('matrix', ['list', 'xxxxxx'])
            var outputs = new Array();
            this.timeout(15000)
            unknownProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            unknownProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            unknownProc.on('close', function (code) {
              // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.Unknown_parameter')), 'stdout Fail, expecting "' + t('matrix.Unknown_parameter') + '"')
              done()
            })
          });
        });
      });
    });
  })
});
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}