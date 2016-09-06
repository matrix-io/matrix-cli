//----- APPS -----
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
    context('search', function () {
      it('should show a "Select a Device" warning', function (done) {
        var searchProc = run('matrix', ['search']);
        var outputs = new Array();
        this.timeout(15000)
        searchProc.stdout.on('data', function (out) {
          // console.log('stdout', out.toString());
          outputs.push(out.toString());
        });
        searchProc.stderr.on('data', function (out) {
          // console.log('stderr', out.toString())
          outputs.push(out.toString());
        })
        searchProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.search.help')), 'stdout Fail, expecting "' + t('matrix.search.help') + '"')
          // console.log('close', outputs)
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

    context('search', function () {
      context('No parameters specified', function () {
        it('should show command "search" usage', function (done) {
          var searchProc = run('matrix', ['search']);
          var outputs = new Array();
          this.timeout(15000)
          searchProc.stdout.on('data', function (out) {
            // console.log('stdout', out.toString());
            outputs.push(out.toString());
          })
          searchProc.stderr.on('data', function (out) {
            // console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          searchProc.on('close', function (code) {
            // console.log('close', outputs);
            outputs.should.matchAny(new RegExp(t('matrix.search.help')), 'stdout Fail, expecting "' + t('matrix.search.help') + '"')
            done();
          })
        });
      });

      context('Parameters specified', function () {
        context('search term has less than 2 characters', function () {
          it.skip('should show a search term warning', function (done) {
            var searchProc = run('matrix', ['search', 'xx']);
            var outputs = new Array();
            searchProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString());
              outputs.push(out.toString());
            })
            searchProc.stderr.on('data', function (out) {
              // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            searchProc.on('close', function (code) {
              // console.log('close', outputs);
              outputs.should.matchAny(new RegExp(t('matrix.search.small_needle')), 'stdout Fail, expecting "' + t('matrix.search.small_needle') + '"')
              done();
            })

          });
        });

        context('search term has more than 2 characters', function () {
          it('should list the results of an app search', function (done) {
            var searchProc = run('matrix', ['search', 'xxxx']);
            var outputs = new Array();
            this.timeout(15000)
            searchProc.stdout.on('data', function (out) {
              // console.log('stdout', out.toString());
              outputs.push(out.toString());
            })
            searchProc.stderr.on('data', function (out) {
              // console.log('stderr', out);
              outputs.push(out.toString());
            })
            searchProc.on('close', function (code) {
              // console.log('close', outputs);
              outputs.should.matchAny(new RegExp(t('matrix.search.search_successfully')), 'stdout Fail, expecting "' + t('matrix.search.search_successfully') + '"')
              done();
            })
          });
        });
      });

    }); //Finish search 
  })

})
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}