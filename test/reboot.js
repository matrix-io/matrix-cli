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
        console.log('Cierra sesion'.magenta, out.toString());
        done();
      })
    })
    context('reboot', function () {
      it('should show a log in warning', function (done) {
        var rebootProc = run('matrix', ['reboot']);
        var outputs = new Array();
        this.timeout(15000)
        rebootProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        rebootProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        rebootProc.on('close', function (code) {
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
    context('reboot', function () {
        it('should show a "Select a Device" warning', function (done) {
          var rebootProc = run('matrix', ['reboot']);
          var outputs = new Array();
          this.timeout(15000)
          rebootProc.stdout.on('data', function (out) {
             //console.log('stdout', out.toString())
            outputs.push(out.toString());
          })
          rebootProc.stderr.on('data', function (out) {
             //console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          rebootProc.on('close', function (code) {
             //console.log('close', outputs);
            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
            done();
          })
        });
      }); 

  })  
})
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}
