// ---Setup
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
   context('Register', function () {//
      it('should request credentials of new user', function (done) {
        var loginProc = run('matrix', ['register']);
        var outputs = new Array();
        this.timeout(15000)
        loginProc.stdout.on('data', function (out) {
          loginProc.kill('SIGINT');
          outputs.push(out.toString())
        });
        loginProc.stderr.on('data', function (out) {
          console.log('stderr', out.toString());
        })
        loginProc.on('close', function (code) {
          outputs.should.matchAny(/Registration/), 'stdout Fail, expecting "' + ('matrix.login.login_success') + '"'
          done();
        });
      }); // Finish Register
    });
})