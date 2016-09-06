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
    context('logout', function () {
      it('should show a log in warning ', function (done) {
        var logoutProc = run('matrix', ['logout']);
        var outputs = new Array();
        this.timeout(15000)
        logoutProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        })
        logoutProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        })
        logoutProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        })
      });
    });
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

    context('logout', function () {
        it('should log out', function (done) {
          var logoutProc = run('matrix', ['logout']);
          var outputs = new Array();
          logoutProc.stdout.on('data', function (out) {
            outputs.push(out.toString());
          });
          logoutProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString());
          })
          logoutProc.on('close', function (code) {
            outputs.should.matchAny(new RegExp(t('matrix.logout.logout_success')), 'stdout Fail, expecting "' + t('matrix.logout.logout_success') + '"')
            done();
          });
        });
      }); // Finish Logout  
    });

  })
})
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}