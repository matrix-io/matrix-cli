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
  describe('----Not Logged In ----', function () {
    context('login', function () {//pasa
      it('should request user credentials', function (done) {
        this.timeout(15000);
        var loginProc = run('matrix', ['login']);
        var outputs = new Array();
        this.timeout(15000)
        loginProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
          if (out.indexOf('username') > -1) {
            loginProc.stdin.write('demo.admobilize@gmail.com\n')
            //outputs.push(out.toString());
            //console.log('brayan111', outputs);
          } else if (out.toString().indexOf('password') > -1) {
            loginProc.stdin.write('admobdemo2016\n')
            //console.log('brayan222--', outputs);
          } else if (out.toString().indexOf('Login Successful') > -1) {
            //console.log('brayannn--', outputs);
            //console.log(out.toString().red);
            if (readConfig().user.hasOwnProperty('token')) {
              //console.log('brayannn--', outputs.push(out.toString()));
              //console.log(outputs.toString().red);
            }
          }
        });
        loginProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.login.login_success')), 'stdout Fail, expecting "' + t('matrix.login.login_success') + '"')
          done();
        });
      }); // Finish login
    });
  })
  describe('----Logged In----', function () {
    context('login', function () {
      it('should show an "already logged in" warning', function (done) {
        var loginProc = run('matrix', ['login']);
        var outputs = new Array();
        this.timeout(15000)
        loginProc.stdout.on('data', function (out) {
          // console.log('stdout', out.toString())
          outputs.push(out.toString());
          loginProc.kill('SIGINT');
        });
        loginProc.stderr.on('data', function (out) {
          // console.log('stderr', out.toString());
          outputs.push(out.toString());
        })
        loginProc.on('close', function (code) {
          // console.log('stdout', outputs)
          outputs.should.matchAny(new RegExp(t('matrix.already_login')), 'stdout Fail, expecting "' + t('matrix.already_login') + '"')
          done();
        });
      });
    }); // Finish login
  })
});

function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}