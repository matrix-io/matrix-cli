var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table2');


describe('Matrix CLI Commands', function() {
  before(function(done) {
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, done);
  })

  describe('No login warnings', function() {
      this.timeout(15000)
      before(fn.logout)
      it.skip('matrix', function(done) {
        fn.run('matrix', {
          checks: t('matrix.no_user_message')
        }, done);
      });


      it.skip('logout', function(done) {

        fn.run('matrix logout', {
          checks: 'No user logged in'
        }, done);
      });

      it.skip('use', function(done) {
        fn.run('use 123', {
          checks: t('matrix.please_login')
        }, done);
      });

      it.skip('sim', function(done) {
        fn.run('sim init', {
          checks: t('matrix.please_login')
        }, done);
      });

      it('list', function(done) {
        fn.run('list all', {
          checks: t('matrix.please_login')
        }, done);
      });

      it.skip('set', function(done) {
        fn.run('set config', {
          checks: t('matrix.please_login')
        }, done);
      });

      it.skip('reboot', function(done) {
        fn.run('reboot', {
          checks: t('matrix.please_login')
        }, done);
      });

      it('install', function(done) {
        fn.run('install sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });

      it('config', function(done) {
        fn.run('config', {
          checks: t('matrix.please_login')
        }, done);
      });
      it('uninstall', function(done) {
        fn.run('uninstall sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });
      it('update', function(done) {
        fn.run('update sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });

      it('start', function(done) {
        fn.run('start sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });
      it('stop', function(done) {
        fn.run('stop sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });
      it('restart', function(done) {
        fn.run('restart sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });

      it('deploy', function(done) {
        fn.run('deploy sensortest', {
          checks: t('matrix.please_login')
        }, done);
      });

    }) // FINISH CONTEXT Not logged in

  describe('Logged in {', function() {
    this.timeout(60000);
    before(fn.login);

    before(fn.useDevice);

    // NOTE: This is for the whole test cycle, if you add other device requiring tests
    // Move this to after that. devices are created in admin.test.js
    after(fn.removeDevice);

    it('should show user and device info in `matrix`', function(done) {
      fn.run('matrix', {
        checks: ['testuser']
      }, done);
    })

    describe('use', function() {
      it('should show help if no params specified', function(done) {
        fn.run('use', {
          checks: t('matrix.use.command_help')
        }, done)
      })

      it('should fail on an invalid device', function(done) {
        fn.run('use xxx', {
          checks: t('matrix.use.invalid_nameid')
        }, done)
      })
    });

    describe('config', function() {
      it('can display application configuration', function(done) {
        fn.run('config matrix-test-app', {
          checks: ['matrix-test-app', 'description']
        }, done);
      })
      it('can change application configuration', function(done) {
        fn.showLogs = true;
        fn.run('config matrix-test-app description=foobar', {
          checks: ['update: foobar'],
          postCheck: function(done) {
            fn.run('config matrix-test-app', {
              checks: ['foobar']
            }, done);
          }
        }, done)
      })
    })
  });
});

/*



      describe('list', function () {

        describe('No parameters specified', function () {
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

        describe('Parameters specified', function () {
          describe('devices', function () {
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




          describe('groups', function () {
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

          describe('apps', function () {
            it('display apps on current device', function (done) {
              var appsProc = run('matrix', ['list', 'apps'])
              var outputs = new Array();
              this.timeout(15000)
              appsProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString());
                outputs.push(out.toString())
              })
              appsProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              appsProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.list.list_apps')), 'stdout Fail, expecting "' + t('matrix.list.list_apps') + '"')
                done()
              })
            });
          });

          describe('all', function () {
            it('display all devices with installed apps', function (done) {
              var allProc = run('matrix', ['list', 'all'])
              var outputs = new Array();
              this.timeout(20000)
              allProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString());
                outputs.push(out.toString())
              })
              allProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              allProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.list.list_all')), 'stdout Fail, expecting "' + t('matrix.list.list_all') + '"')
                done()
              })
            });
          });

          describe('Unknown parameter specified', function () {
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
                outputs.should.matchAny(new RegExp(t('matrix.list.no_results')), 'stdout Fail, expecting "' + t('matrix.list.no_results') + '"')
                done()
              })
            });
          });
        });
      }); // Finish list

      //DEVICE REQUIRED

      describe('set', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var setProc = run('matrix', ['set', '']);
          var outputs = new Array();
          setProc.stdout.on('data', function (out) {
           // console.log('>>>>', out.toString());
            outputs.push(out.toString());
          });
          setProc.stderr.on('data', function (out) {
           // console.log('stderr', out.toString())
          })
          setProc.on('close', function (code) {
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
           // console.log('close', outputs)
            done();
          });
        });
      }); //Finish set


      describe('reboot', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var rebootProc = run('matrix', ['reboot', '']);
          var outputs = new Array();
          rebootProc.stdout.on('data', function (out) {
           // console.log('close', out.toString())
            outputs.push(out.toString());
          })
          rebootProc.stderr.on('data', function (out) {
           // console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          rebootProc.on('close', function (code) {
           // console.log('close', outputs);
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
            done();
          })
        });
      }); // Finish reboot

      describe('search', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var searchProc = run('matrix', ['search']);
          var outputs = new Array();
          searchProc.stdout.on('data', function (out) {
           // console.log('stdout', out.toString());
            outputs.push(out.toString());
          });
          searchProc.stderr.on('data', function (out) {
           // console.log('stderr', out.toString())
            outputs.push(out.toString());
          })
          searchProc.on('close', function (code) {
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
           // console.log('close', outputs)
            done();
          });
        });
      }); // Finish search

      describe('install', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var installProc = run('matrix', ['install']);
          var outputs = new Array();
          installProc.stdout.on('data', function (out) {
           // console.log('stdout', out.toString());
            outputs.push(out.toString())
          })
          installProc.stderr.on('data', function (out) {
            outputs.push(out.toString());
           // console.log('stderr', out.toString())
          });
          installProc.on('close', function (code) {
           // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
            done();
          });
        });
      }); // Finish install

      describe('config', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var configProc = run('matrix', ['config']);
          var outputs = new Array();
          configProc.stdout.on('data', function (out) {
           // console.log('stdout', out.toString());
            outputs.push(out.toString())
          })
          configProc.stderr.on('data', function (out) {
            outputs.push(out.toString());
           // console.log('stderr', out.toString())
          });
          configProc.on('close', function (code) {
           // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
            done();
          });
        });
      }); // Finish config

      describe('uninstall', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var uninstallProc = run('matrix', ['uninstall']);
          var outputs = new Array();
          uninstallProc.stdout.on('data', function (out) {
           // console.log('stdout', out.toString());
            outputs.push(out.toString())
          })
          uninstallProc.stderr.on('data', function (out) {
            outputs.push(out.toString());
           // console.log('stderr', out.toString())
          });
          uninstallProc.on('close', function (code) {
           // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
            done();
          });
        });
      }); // Finish uninstall

      describe('update', function () {
        it.skip('should show a "Select a Device" warning', function (done) {
          var updateProc = run('matrix', ['update']);
          var outputs = new Array();
          updateProc.stdout.on('data', function (out) {
           // console.log('stdout', out.toString());
            outputs.push(out.toString())
          })
          updateProc.stderr.on('data', function (out) {
            outputs.push(out.toString());
           // console.log('stderr', out.toString())
          });
          updateProc.on('close', function (code) {
           // console.log('close', outputs)
            outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
            done();
          });
        }); // Finish update


        describe('start', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var startProc = run('matrix', ['start']);
            var outputs = new Array();
            startProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            startProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            startProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });
          });
        }); // Finish start

        describe('stop', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var stopProc = run('matrix', ['stop']);
            var outputs = new Array();
            stopProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            stopProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            stopProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });
          });
        }); //Finish stop

        describe('restart', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var restartProc = run('matrix', ['restart']);
            var outputs = new Array();

            restartProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            restartProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            restartProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });
          });
        }); // Finish restart


        describe('create', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var createProc = run('matrix', ['create']);
            var outputs = new Array();

            createProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            createProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            createProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });
          });
        }); // Finish create

        describe('deploy', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var deployProc = run('matrix', ['deploy']);
            var outputs = new Array();

            deployProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            deployProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            deployProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });
          });
        }); // Finish deploy

        describe('trigger', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var triggerProc = run('matrix', ['trigger']);
            var outputs = new Array();
            triggerProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            triggerProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            triggerProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });
          });
        }); // Finish trigger

        describe('log', function () {
          it.skip('should show a "Select a Device" warning', function (done) {
            var logProc = run('matrix', ['log']);
            var outputs = new Array();

            logProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString())
            })
            logProc.stderr.on('data', function (out) {
              outputs.push(out.toString());
             // console.log('stderr', out.toString())
            });
            logProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.validate.no_device')), 'stdout Fail, expecting "' + t('matrix.validate.no_device') + '"')
              done();
            });

          });
        }); // Finish log

      })
      describe('Device selected', function () { // danilo
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
        describe('set', function () {
          describe('No parameters specified', function () {
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


          describe('Parameters specified', function () {
            describe('env', function () {
              describe('No parameters specified', function () {
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
              describe('Parameters specified', function () {
                describe('sandbox', function () {
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
                describe('production', function () {
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
            describe('config', function () {
              describe('No parameters specified', function () {
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
                    outputs.should.matchAny(new RegExp(t('matrix.set.config.no_app')), 'stdout Fail, expecting "' + t('matrix.set.config.no_app') + '"')
                   // console.log('close', outputs)
                    done();
                  });
                });
              });
              describe('Parameters specified', function () {
                describe('Invalid app name', function () {
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
                describe('Valid app name', function () {
                  describe('Missing proper key value setting', function () {
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
                  describe('Valid key value setting', function () { //pending might be part of the `node-sdk`
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
            }); //finish set config
          });
        });
      }); //finish  set
      describe('reboot', function () {
        describe('device is not alive', function () {
          it.skip('should return an error', function (done) {
            var rebootProc = run('matrix', ['reboot']);
            var outputs = new Array();

            rebootProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString());
            });
            rebootProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })

            rebootProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.reboot.device_offline')), 'stdout Fail, expecting "' + t('matrix.reboot.device_offline') + '"')
              done();
            });
          });
        });
        describe('Device is alive', function () {
          it.skip('should reboot the current device', function (done) {
            var rebootProc = run('matrix', ['reboot']);
            var outputs = new Array();

            rebootProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString());
            });
            rebootProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })

            rebootProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.reboot.rebooted')), 'stdout Fail, expecting "' + t('matrix.reboot.rebooted') + '"')
              done();
            });
          });
        });
      }); //finish reboot Pending error tokens


      describe('search', function () {
        describe('No parameters specified', function () {
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

        describe('Parameters specified', function () {
          describe('search term has less than 2 characters', function () {
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

          describe('search term has more than 2 characters', function () {
            it('should list the results of an app search', function (done) {
              var searchProc = run('matrix', ['search', 'xxxx']);
              var outputs = new Array();

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

      describe('install', function () {
        describe('No parameters specified', function () {
          it('should show command "install" usage', function (done) {
            var installProc = run('matrix', ['install']);
            var outputs = new Array();
            installProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString());
              outputs.push(out.toString());
            })
            installProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            installProc.on('close', function (code) {
             // console.log('close', outputs);
              outputs.should.matchAny(new RegExp(t('matrix.install.command_help')), 'stdout Fail, expecting "' + t('matrix.install.command_help') + '"')
              done();
            })

          });
        });

        describe('Parameters specified', function () {

          describe('Invalid app/sensor name', function () {
            it.skip('should show invalid "app/sensor" warning', function (done) {
              var installProc = run('matrix', ['install', 'XXXX'])
              var outputs = new Array();
              installProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString());
                outputs.push(out.toString());
              })
              installProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              installProc.on('close', function (code) {
               // console.log('close', outputs);
                outputs.should.matchAny(new RegExp(t('matrix.install.app_not_found')), 'stdout Fail, expecting "' + t('matrix.install.app_not_found') + '"')
                done();
              })
            });
          });

          describe('Valid app/sensor name', function () {
            describe('app is already installed', function () {
              it.skip('should show warning app already installed', function (done) {
                var installProc = run('matrix', ['install', 'Test Ruben']);
                var outputs = new Array();
                this.timeout(15000);
                installProc.stdout.on('data', function (out) {
                 // console.log('stdout', out.toString());
                  installProc.kill('SIGINT');
                  outputs.push(out.toString());
                })
                installProc.stderr.on('data', function (out) {
                 // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                installProc.on('close', function (code) {
                 // console.log('close', outputs);
                  outputs.should.matchAny(new RegExp(t('matrix.install.installing')), 'stdout Fail, expecting "' + t('matrix.install.installing') + '"')
                  done();
                })
              });
            });
            describe('app isn\'t already installed', function () {
              it.skip('should install the app or sensor specified to active MatrixOS device', function (done) {
                var installProc = run('matrix', ['install', 'hello1']);
                var outputs = new Array();

                installProc.stdout.on('data', function (out) {
                 // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                installProc.stderr.on('data', function (out) {
                 // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                installProc.on('close', function (code) {
                 // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.install.installing')), 'stdout Fail, expecting "' + t('matrix.install.installing') + '"')
                  done();
                })

              });
            });
          });
        });


      }); // NO Finish install


      describe('config', function () { //pending by error tokens
        describe.skip('No parameters specified', function () {
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

        describe('Parameters specified', function () {

          describe('specified app doesn\'t exist', function () {
            it.skip('should show an "specified app doesn\'t exist" warning', function (done) {
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
          describe('specified app exists', function () { //danilo
            describe('app', function () {
              it.skip('should show application configurations', function (done) {

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

            describe('app key', function () {
              describe('specified key doesn\'t exist', function () {
                it.skip('should show a "specified key doesn\'t exist" warning', function (done) {
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

              describe('specified key exists', function () {
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

            describe('app key value', function () {
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
      }); //No Finish config


      describe('uninstall', function () {
        describe('No parameters specified', function () {
          it('should show command "uninstall" usage', function (done) {
            var uninstallProc = run('matrix', ['uninstall']);
            var outputs = new Array();
            this.timeout(15000)
            uninstallProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString());
            })
            uninstallProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            uninstallProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.uninstall.application_unspecified')), 'stdout Fail, expecting "' + t('matrix.uninstall.application_unspecified') + '"')
              done();
            })

          });
        });

        describe('Parameters specified', function () {
          describe('specified app doesn\'t exist', function () {
            it.skip('should show a "specified app doesn\'t exist" warning', function (done) {
              var uninstallProc = run('matrix', ['uninstall', 'XXXX']);
              var outputs = new Array();
              uninstallProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              uninstallProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              uninstallProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.uninstall.app_undefined')), 'stdout Fail, expecting "' + t('matrix.uninstall.app_undefined') + '"')
                done();
              })
            });
          });

          describe('specified app exists', function () {

            describe('device is offline', function () {
              it.skip('should show a "device is offline" warning', function (done) {
                var uninstallProc = run('matrix', ['uninstall', 'myhealthapp']);
                var outputs = new Array();
                uninstallProc.stdout.on('data', function (out) {
                 // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                uninstallProc.stderr.on('data', function (out) {
                 // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                uninstallProc.on('close', function (code) {
                 // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.uninstall.device_offline')), 'stdout Fail, expecting "' + t('matrix.uninstall.device_offline') + '"')
                  done();
                })
              });
            });

            describe('device is online', function () {
              it.skip('should uninstall the specified app', function (done) {
                var uninstallProc = run('matrix', ['uninstall', 'MyHealthApp']);
                var outputs = new Array();
                uninstallProc.stdout.on('data', function (out) {
                 // console.log('stdout', out.toString())
                  outputs.push(out.toString());
                })
                uninstallProc.stderr.on('data', function (out) {
                 // console.log('stderr', out.toString())
                  outputs.push(out.toString());
                })
                uninstallProc.on('close', function (code) {
                 // console.log('close', outputs)
                  outputs.should.matchAny(new RegExp(t('matrix.uninstall.uninstalled')), 'stdout Fail, expecting "' + t('matrix.uninstall.uninstalled') + '"')
                  done();
                })
              });
            });
          });
        });
      }); //finish  (error authenticate and acces token )uninstall

      describe('update', function () {

        describe('No parameters specified', function () {
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

        describe('Parameters specified', function () {
          describe('app', function () {
            describe('device doesn\'t have the app installed', function () {
              it.skip('should show a "device doesn\'t have the app installed"', function (done) {
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
                  outputs.should.matchAny(new RegExp(t('matrix.update.app_undefined')), 'stdout Fail, expecting "' + t('matrix.update.app_undefined') + '"')
                  done();
                })
              });
            });

            describe('device has the app installed', function () {
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

            describe('app version', function () {
              describe('version doesn\'t exist', function () {
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

              describe('version exists', function () {
                it('should update to that version', function (done) {
                  var updateProc = run('matrix', ['update', 'veryfirstapp', '0.7'])
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
                    outputs.should.matchAny(new RegExp(t('matrix.update.version_update_successfully')), 'stdout Fail, expecting "' + t('matrix.update.version_update_successfully') + '"')
                    done();
                  })
                });
              });
            });

            describe('unknown parameter', function () {
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
      }); // starFinish update  error

      describe('start', function () {

        describe('No parameters specified', function () {
          it.skip('should show command "start" usage', function (done) {
            var startProc = run('Matrix', ['start'])
            var outputs = new Array();

            startProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString());
            })
            startProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString());
            })
            startProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.start.application_unspecified')), 'stdout Fail, expecting "' + t('matrix.start.application_unspecified') + '"')
              done();
            })
          });
        });

        describe(' parameters specified', function () {
          describe('start', function () {
            it.skip('Starts an app running on the active MatrixOS', function (done) {
              var startProc = run('Matrix', ['start', 'vehicle'])
              var outputs = new Array();

              startProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              startProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              startProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.start.starting_app')), 'stdout Fail, expecting "' + t('matrix.start.starting_app') + '"')
                done();
              })
            });
          });
          describe('unknown parameter', function () {
            it.skip('should show an "parameter doesn\'t exist', function (done) {
              var startProc = run('Matrix', ['start', 'XXXX'])
              var outputs = new Array();
              startProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString());
              })
              startProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString());
              })
              startProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.start.app_undefined')), 'stdout Fail, expecting "' + t('matrix.start.app_undefined') + '"')
                done();
              })
            });
          });

        });
      }); // finish start error " client registration fail"

      describe('stop', function () {

        describe('No parameters specified', function () {
          it.skip('should show command "stop" usage', function (done) {
            var stopProc = run('matrix', ['stop'])
            var outputs = new Array();

            stopProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            stopProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            stopProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.stop.application_unspecified')), 'stdout Fail, expecting"' + t('matrix.stop.application_unspecified') + '"')
              done()
            })
          });
        });

        describe(' parameters specified', function () {
          describe('unknown parameter', function () {
            it.skip('should show an "parameter doesn\'t exist', function (done) {
              var stopProc = run('Matrix', ['stop', 'XXXX'])
              var outputs = new Array();

              stopProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              stopProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              stopProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.stop.app_undefined')), 'stdout Fail, expecting"' + t('matrix.stop.app_undefined') + '"')
                done()
              })
            });
          });
          describe('stop', function () {
            it.skip('Stops an app running on the active MatrixOS', function (done) {
              var stopProc = run('Matrix', ['stop', 'vehicle'])
              var outputs = new Array();
              stopProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              stopProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              stopProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.stop.stopping_app')), 'stdout Fail, expecting"' + t('matrix.stop.stopping_app') + '"')
                done()
              })
            });
          });
        });
      }); //finish stop ERROR FAIL AUTHENTICATE !!

      describe('restart', function () {

        describe('No parameters specified', function () {
          it.skip('should show command "restart" usage', function (done) {
            var restartProc = run('Matrix', ['restart']);
            var outputs = new Array();

            restartProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            restartProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            restartProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.restart.stopping_app')), 'stdout Fail, expecting"' + t('matrix.restart.stopping_app') + '"')
              done()
            })
          });
        });

        describe(' parameters specified', function () {
          describe('unknown parameter', function () {
            it.skip('should show an "parameter doesn\'t exist', function (done) {
              var restartProc = run('Matrix', ['restart', 'XXXX']);
              var outputs = new Array();


              restartProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              restartProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              restartProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.restart.app_undefined')), 'stdout Fail, expecting"' + t('matrix.restart.app_undefined') + '"')
                done()
              })
            });
          });

          describe('restart', function () {
            it.skip('Restarts an app running on the MatrixOS', function (done) {
              var restartProc = run('Matrix', ['restart', 'vehicle']);
              var outputs = new Array();


              restartProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              restartProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              restartProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.restart.stopping_app')), 'stdout Fail, expecting"' + t('matrix.restart.stopping_app') + '"')
                done()
              })
            });

          });
        });
      }); //No Finish restart ERROR (Application.restart(admatrix.config, cb);)

      describe('create', function () {

        describe('No parameters specified', function () {
          it('should show commands "create" usage', function (done) {
            var createProc = run('matrix', ['create'])
            var outputs = new Array();

            createProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            createProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            createProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.create.name_undefined')), 'stdout Fail, expecting"' + t('matrix.create.name_undefined') + '"')
              done()
            })
          });
        });

        describe('specified to name device create', function () {
          it('Creates a new scaffolding for a MatrixOS Application', function (done) {

            var createProc = run('matrix', ['create', 'test'])
            var outputs = new Array();

            createProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            createProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            createProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.create.new_folder')), 'stdout Fail, expecting"' + t('matrix.create.new_folder') + '"')
              done()
            })
          });
        });

      }); // Finish create

      describe('deploy', function () {
        describe('No parameters specified', function () {
          it.skip('should show commands "deploy" usage', function (done) {
            var deployProc = run('matrix', ['deploy']);
            var outputs = new Array();

            deployProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            deployProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            deployProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.deploy.application_unspecified')), 'stdout Fail, expecting"' + t('matrix.deploy.application_unspecified') + '"')
              done()
            })
          });
        });

        describe('parameters specified', function () {
          describe('unknown parameter', function () {
            it.skip('should show an "parameter doesn\'t exist', function (done) {

              var deployProc = run('matrix', ['deploy', 'XXXXX']);
              var outputs = new Array();

              deployProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              deployProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              deployProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.deploy.app_undefined')), 'stdout Fail, expecting"' + t('matrix.deploy.app_undefined') + '"')
                done()
              })

            });
          });
          describe('name device correct', function () {
            it.skip('Deploys an app to the active MatrixOS', function (done) {
              var deployProc = run('matrix', ['deploy', 'vehicle']);
              var outputs = new Array();

              deployProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              deployProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              deployProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.deploy.deploy_app_successfully')), 'stdout Fail, expecting"' + t('matrix.deploy.deploy_app_successfully') + '"')
                done()
              })
            });
          });

        });
      }); // No Finish deploy 'ERROR'

      describe('trigger', function () {
        describe('No parameters specified', function () {
          it('should show commands "trigger" usage', function (done) {
            var triggerProc = run('matrix', ['trigger']);
            var outputs = new Array();

            triggerProc.stdout.on('data', function (out) {
             // console.log('stdout', out.toString())
              outputs.push(out.toString())
            })
            triggerProc.stderr.on('data', function (out) {
             // console.log('stderr', out.toString())
              outputs.push(out.toString())
            })
            triggerProc.on('close', function (code) {
             // console.log('close', outputs)
              outputs.should.matchAny(new RegExp(t('matrix.trigger.no_specified_test')), 'stdout Fail, expecting"' + t('matrix.trigger.no_specified_test') + '"')
              done()
            })
          });
        });

        describe('parameters specified', function () {
          describe('unknown parameter specified  ', function () {
            it.skip('should show an "parameter doesn\'t exist', function (done) {
              var triggerProc = run('matrix', ['trigger', 'XXXXX']);
              var outputs = new Array();

              triggerProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              triggerProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              triggerProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.trigger.defined_test_doesn`t_exist')), 'stdout Fail, expecting"' + t('matrix.trigger.defined_test_doesn`t_exist') + '"')
                done()
              })
            });
          });
          describe(' parameter specified is trigger ', function () {
            it.skip('Runs a trigger test', function (done) {
              var triggerProc = run('matrix', ['trigger', 'test']);
              var outputs = new Array();
              triggerProc.stdout.on('data', function (out) {
               // console.log('stdout', out.toString())
                outputs.push(out.toString())
              })
              triggerProc.stderr.on('data', function (out) {
               // console.log('stderr', out.toString())
                outputs.push(out.toString())
              })
              triggerProc.on('close', function (code) {
               // console.log('close', outputs)
                outputs.should.matchAny(new RegExp(t('matrix.trigger.run_trigger_successfully')), 'stdout Fail, expecting"' + t('matrix.trigger.run_trigger_successfully') + '"')
                done()
              })


            });
          });

        });

      }); //No Finish trigger ERROR (client registration fail socket)

      describe('log', function () {
        describe('No parameters specified', function () {
          it.skip('should show commands "log" usage', function (done) {
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
              outputs.should.matchAny(new RegExp(t('matrix.log.app_not_select')), 'stdout Fail, expecting"' + t('matrix.log.app_not_select') + '"')
              done()
            })
          });
        });
        describe(' parameters specified', function () {

          describe(' device and app assigned', function () {

            describe('unknown device and app specified', function () {
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
            describe('log', function () {
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
      }); // finish log 'ERROR'

    })

  })

})

function readConfig() {
  return JSON.parse(require('fs').readFileSync('./tmp/store.json'));
}
*/