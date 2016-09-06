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

    context('set', function () {
      it('should show a log in warning', function (done) {
        var setProc = run('matrix', ['set']);
        var outputs = new Array();
        this.timeout(15000)
        setProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        setProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        setProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.set.help_device')), 'stdout Fail, expecting "' + t('matrix.set.help_device') + '"')
          done();
        });
      });
    });
  })
  describe('---- logged In----', function () {
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
    context('set', function () {
          context('No parameters specified', function () {
            it('should command "set" usage', function (done) {
              var setProc = run('matrix', ['set']);
              var outputs = new Array();
              setProc.stdout.on('data', function (out) {
                // console.log('stdout', out.toString())
                outputs.push(out.toString());
              });
              setProc.stderr.on('data', function (out) {
                // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              setProc.on('close', function (code) {
                // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.set.help_device')), 'stdout Fail, expecting "' + t('matrix.set.help_device') + '"')
                done();
              });
            });
          }); // finish set No parameters specified


          context('Parameters specified', function () {
            context('env', function () {
              context('No parameters specified', function () {
                it('should show command "set env" usage', function (done) {
                  var setProc = run('matrix', ['set', 'env']);
                  var outputs = new Array();
                  setProc.stdout.on('data', function (out) {
                    // console.log('stdout', out.toString())
                    outputs.push(out.toString());
                  })
                  setProc.stderr.on('data', function (out) {
                    // console.log('stderr', out.toString());
                    outputs.push(out.toString());
                  });

                  setProc.on('close', function (code) {
                    // console.log('close', outputs)
                    outputs.should.matchAny(new RegExp(t('matrix.set.env.valid_environments')), 'stdout Fail, expecting "' + t('matrix.set.env.valid_environments') + '"')
                    done();
                  });

                });
              });
              context('Parameters specified', function () {
                context('sandbox', function () {
                  it.skip('should set the device environment to sandbox', function (done) {
                    var setProc = run('matrix', ['set', 'env', 'sandbox']);
                    var outputs = new Array();

                    setProc.stdout.on('data', function (out) {
                      // console.log('stdout', out.toString())
                      outputs.push(out.toString());
                    });
                    setProc.stderr.on('data', function (out) {
                      // console.log('stderr', out.toString())
                    })

                    setProc.on('close', function (code) {
                      // console.log('close', outputs)
                      outputs.should.matchAny(new RegExp(t('matrix.set.env.env')), 'stdout Fail, expecting "' + t('matrix.set.env.env') + '"')
                      done();
                    });

                  });
                });
                context('production', function () {
                  it('should set the device environment to production', function (done) {
                    var setProc = run('matrix', ['set', 'env', 'production']);
                    var outputs = new Array();
                    setProc.stdout.on('data', function (out) {
                      // console.log('stdout', out.toString())
                      outputs.push(out.toString());
                    });
                    setProc.stderr.on('data', function (out) {
                      // console.log('stderr', out.toString())
                    })

                    setProc.on('close', function (code) {
                      // console.log('close', outputs)
                      outputs.should.matchAny(new RegExp(t('matrix.set.env.env')), 'stdout Fail, expecting "' + t('matrix.set.env.env') + '"')
                      done();
                    });
                  });
                });
              });
            });
            context('config', function () {
              context('No parameters specified', function () {
                it('should show command "set config" usage', function (done) {
                  var setProc = run('matrix', ['set', 'config']);
                  var outputs = new Array();
                  setProc.stdout.on('data', function (out) {
                    // console.log('stdout', out.toString())
                    outputs.push(out.toString());
                  })
                  setProc.stderr.on('data', function (out) {
                    // console.log('>>>>', out.toString());
                    outputs.push(out.toString());
                  });

                  setProc.on('close', function (code) {
                    outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
                    // console.log('close', outputs)
                    done();
                  });
                });
              });
              context('Parameters specified', function () {
                context('Invalid app name', function () {
                  it('should show an "invalid app" warning', function (done) {
                    var setProc = run('matrix', ['set', 'config', 'invalid']);
                    var outputs = new Array();
                    this.timeout(15000)
                    setProc.stdout.on('data', function (out) {
                      // console.log('stdout', out.toString())
                      outputs.push(out.toString());
                    })
                    setProc.stderr.on('data', function (out) {
                      // console.log('stderr', out.toString());
                      outputs.push(out.toString());
                    });
                    setProc.on('close', function (code) {
                      // console.log('close', outputs)
                      outputs.should.matchAny(new RegExp(t('matrix.set.config.invalid_key_value')), 'stdout Fail, expecting "' + t('matrix.set.config.invalid_key_value') + '"')
                      done();
                    });
                  });
                });
                context('Valid app name', function () {
                  context('Missing proper key value setting', function () {
                    it.skip('should show command "set config" usage', function (done) {
                      var setProc = run('matrix', ['set', 'config', 'vehicle']);
                      var outputs = new Array();
                      setProc.stdout.on('data', function (out) {
                        // console.log('stdout', out.toString())
                       outputs.push(out.toString());
                      })
                      setProc.stderr.on('data', function (out) {
                        // console.log('stderr', out.toString());
                        outputs.push(out.toString());
                      });
                      setProc.on('close', function (code) {
                        // console.log('close', outputs)
                        outputs.should.matchAny(new RegExp(t('matrix.set.config.no_key_value')), 'stdout Fail, expecting "' + t('matrix.set.config.no_key_value') + '"')
                        done()
                      })
                    });
                  });
                  context('Valid key value setting', function () { //pending might be part of the `node-sdk`
                    it.skip('should set the configuration value for the specified key', function (done) {
                      var setProc = run('matrix', ['set', 'config', 'vehicle', 'name=brayan']);
                      var outputs = new Array();
                      this.timeout(15000)
                      setProc.stdout.on('data', function (out) {
                        // console.log('stdout', out.toString())
                        outputs.push(out.toString());
                      })
                      setProc.stderr.on('data', function (out) {
                        // console.log('stderr', out.toString());
                        outputs.push(out.toString());
                      });
                      setProc.stdout.on('close', function (code) {
                        // console.log('close', outputs)
                        outputs.should.matchAny(new RegExp(t('matrix.set.config.use')), 'stdout Fail, expecting "' + t('matrix.set.config.use') + '"')
                        done();
                      })
                    });

                  });
                });
              });
            }); 
          });
        });
      }); 
  })
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}