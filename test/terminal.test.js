require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var i;

describe('Matrix CLI Commands', function() {
    before(function(done) {
        Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function() {
            i = Matrix.localization.get;
        })
        done();
    })

    context('Not logged in', function(done) {
        before(function(done) {
            exec('matrix logout')
            console.log('cierra sesion'.magenta);
            done();
        })


        it.skip('should show a log in warning', function(done) {
                var notloggedProc = run('matrix');
                var outputs = new Array();
                notloggedProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                notloggedProc.stderr.on('data', function(out) {
                    //console.log('stderr', out.toString());
                })
                notloggedProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });

            }) //finish matrix
        it.skip('should request user credentials...', function(done) {
            this.timeout(15000);
            var loginProc = run('matrix', ['login']);
            var outputs = new Array();
            loginProc.stdout.on('data', function(out) {
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
                    // console.log(out.toString().red);
                    if (readConfig().user.hasOwnProperty('token')) {
                        //console.log('brayannn--', outputs.push(out.toString()));
                        //console.log(outputs.toString().red);

                    }
                }

            });

            loginProc.on('close', function(code) {
                outputs.should.matchAny(new RegExp(i('matrix.login.login_success')), 'stdout Fail, expecting "' + i('matrix.login.login_success') + '"')
                done();
            });

        }); //finish matrix `login`
        context('logout', function() {

            it.skip('should show a logout in warning ', function(done) {
                var logoutProc = run('matrix', ['logout']);
                var outputs = new Array();

                logoutProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                })
                logoutProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                })
                logoutProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.logout.logout_success')), 'stdout Fail, expecting "' + i('matrix.logout.logout_success') + '"')
                    done();
                })
            });
        }); // Finish  Logout
        context('use ', function() {
            it.skip('should show a in warning', function(done) {
                var useProc = run('matrix', ['use']);
                var outputs = new Array();

                useProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());

                });
                useProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });

                useProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); // Finish use

        context('sim', function() {
            it.skip('should show a log in warning', function(done) {
                var simProc = run('matrix', ['sim']);
                var outputs = new Array();

                simProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());

                });
                simProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });

                simProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); // Finish sim

        context('list', function() {
            it.skip('should show a log in warning', function(done) {
                var listProc = run('matrix', ['list']);
                var outputs = new Array();
                listProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                listProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                listProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); // Finish 
        context('set', function() {

            it.skip('should show a log in warning', function(done) {
                var setProc = run('matrix', ['set']);
                var outputs = new Array();
                setProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                setProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                setProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); // Finish set
        context('reboot', function() {
            it.skip('should show a log in warning', function(done) {
                var rebootProc = run('matrix', ['reboot']);
                var outputs = new Array();
                rebootProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                rebootProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                rebootProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); // Finish reboot
        context('install', function() {
            it.skip('should show a log in warning', function(done) {
                var installProc = run('matrix', ['install']);
                var outputs = new Array();
                installProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                installProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                installProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });

            });
        }); //Finish install 
        context('config', function() {
            it.skip('should show a log in warning', function(done) {
                var configProc = run('matrix', ['config']);
                var outputs = new Array();

                configProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                configProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                configProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); //Finish config
        context('uninstall', function() {
            it.skip('should show a log in warning', function(done) {
                var uninstallProc = run('matrix', ['uninstall']);
                var outputs = new Array();

                uninstallProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                uninstallProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                uninstallProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });

            });
        }); //Finish uninstall  
        context('update', function() {
            it.skip('should show a log in warning', function(done) {
                var updateProc = run('matrix', ['update']);
                var outputs = new Array();
                updateProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                updateProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                updateProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); //Finish update
        context('start', function() {
            it.skip('should show a log in warning', function(done) {
                var startProc = run('matrix', ['start']);
                var outputs = new Array();
                startProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                startProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                startProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); //Finish start
        context('stop', function() {
            it.skip('should show a log in warning', function(done) {
                var stopProc = run('matrix', ['stop']);
                var outputs = new Array();
                stopProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                stopProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                stopProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });


            });
        }); //Finish stop

        context('restart', function() {
            it.skip('should show a log in warning', function(done) {
                var restartProc = run('matrix', ['restart']);
                var outputs = new Array();
                restartProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                restartProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                restartProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });


            });
        }); //Finish restart 

        context('create', function() {
            it.skip('should show a log in warning', function(done) {
                var createProc = run('matrix', ['create']);
                var outputs = new Array();
                createProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                createProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                createProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); //Finish create 
        context('deploy', function() {
            it.skip('should show a log in warning', function(done) {
                var deployProc = run('matrix', ['deploy']);
                var outputs = new Array();
                deployProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                deployProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                deployProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });

            });
        }); //Finish deploy 

        context('trigger', function() {
            it.skip('should show a log in warning', function(done) {
                var triggerProc = run('matrix', ['trigger']);
                var outputs = new Array();
                triggerProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                triggerProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                triggerProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });

            });
        }); //Finish trigger 

        context('log }', function() {
            it.skip('should show a log in warning Log', function(done) {
                var logProc = run('matrix', ['log']);
                var outputs = new Array();
                logProc.stdout.on('data', function(out) {
                    outputs.push(out.toString());
                });
                logProc.stderr.on('data', function(out) {
                    outputs.push(out.toString());
                });
                logProc.on('close', function(code) {
                    outputs.should.matchAny(new RegExp(i('matrix.please_login')), 'stdout Fail, expecting "' + i('matrix.please_login') + '"')
                    done();
                });
            });
        }); //Finish log

        context('Logged in {', function() {
            before(function(done) {
                this.timeout(15000);
                var loginProc = run('matrix', ['login']);
                loginProc.stdout.on('data', function(out) {
                    if (out.toString().indexOf('username') > -1) {
                        loginProc.stdin.write('demo.admobilize@gmail.com\n')
                    } else if (out.toString().indexOf('password') > -1) {
                        loginProc.stdin.write('admobdemo2016\n')
                    } else if (out.toString().indexOf('Login Successful') > -1) {
                        // console.log(out.toString().red);
                        if (readConfig().user.hasOwnProperty('token')) {
                            console.log(out.toString().red);
                            // done();
                        }
                    }

                });
                loginProc.on('close', function(code) {
                    console.log('Inicia sesion'.magenta);
                    done();
                });

            })

            //NO DEVICE REQUIRED

            context('No parameters specified', function() {
                it.skip('should show the matrix command usage', function(done) {
                    var logProc = run('matrix', ['']);
                    var outputs = new Array();
                    logProc.stdout.on('data', function(out) {
                        console.log('stdout', out.toString())
                        outputs.push(out.toString());
                    });
                    logProc.stderr.on('data', function(out) {
                        console.log('stderr', out.toString());
                    })
                    logProc.on('close', function(code) {
                        console.log('close', outputs)
                        outputs.should.matchAny(/@/, 'stdout Fail, expecting "' + 'you user' + '"')
                        done();
                    });

                });
            }); // Finish matrix 
            context('Parameters specified', function() { //------------------------------------------------

                context('login_NDR', function() {
                    it.skip('should show an "already logged in" warning', function(done) {
                        var loginProc = run('matrix', ['login']);
                        var outputs = new Array();
                        loginProc.stdout.on('data', function(out) {
                            outputs.push(out.toString());
                            loginProc.kill('SIGINT');
                        });
                        loginProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString());
                        })
                        loginProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(i('matrix.login.already_login_warning')), 'stdout Fail, expecting "' + i('matrix.login.already_login_warning') + '"')
                            done();
                        });
                    });
                }); // Finish login


                context('logout', function() {
                    it.skip('should log out', function(done) {
                        var logoutProc = run('matrix', ['logout']);
                        var outputs = new Array();
                        logoutProc.stdout.on('data', function(out) {
                            outputs.push(out.toString());
                        });
                        logoutProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString());
                        })
                        logoutProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(i('matrix.logout.logout_success')), 'stdout Fail, expecting "' + i('matrix.logout.logout_success') + '"')
                            done();
                        });
                    });
                }); // Finish Logout

                context('use', function() {
                    context('No parameters specified ', function() {
                        it.skip('Show "use" command usage', function(done) {
                            var useProc = run('matrix', ['use']);
                            var outputs = new Array();
                            useProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString());
                            });
                            useProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString());
                            })
                            useProc.on('close', function(code) {
                                outputs.should.matchAny(new RegExp(i('matrix.use.command_help')), 'stdout Fail, expecting "' + i('matrix.use.command_help') + '"')
                                done();
                            });
                        });

                    }); // Finish use                       

                    context('Parameters specified', function() {

                        context('Specified device doesn\'t exist', function() {
                            it.skip('should show an "invalid device" warning', function(done) {
                                var useDProc = run('matrix', ['use', 'xx']);
                                var outputs = new Array();
                                useDProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                });
                                useDProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString());
                                })
                                useDProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(i('matrix.use.device_not_found')), 'stdout Fail, expecting "' + i('matrix.use.device_not_found') + '"')
                                    done();
                                });
                            });

                        }); //Finish use
                        context('Current user doesn\'t have permission to use specified device', function() {
                            it.skip('should show an "invalid device" warning', function(done) {
                                var useProc = run('matrix', ['use', 'xxx']);
                                var outputs = new Array();
                                useProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                });
                                useProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString());
                                })
                                useProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(i('matrix.use.not_authorized')), 'stdout Fail, expecting "' + i('matrix.use.not_authorized') + '"')
                                    done();
                                });
                            });
                        });
                        context('Specified device exists', function() {
                            it.skip('Show set device as current device', function(done) {
                                var useProc = run('matrix', ['use', 'matrixSimulator']);
                                var outputs = new Array();
                                useProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                });
                                useProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString());
                                })
                                useProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(i('matrix.use.using_device_by_name')), 'stdout Fail, expecting "' + i('matrix.use.using_device_by_name') + '"')
                                    done();
                                });

                            });

                        });
                    });
                }); // Finish use

                context('sim', function() {

                    context('No parameters specified ', function() {
                        it.skip('Show "sim" command usage', function(done) {
                            var simProc = run('matrix', ['sim', '']);
                            var outputs = new Array();
                            simProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString());
                            });
                            simProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString());

                            })

                            simProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(i('matrix.sim.command_help_sim')), 'stdout Fail, expecting "' + i('matrix.sim.command_help_sim') + '"')
                                done();
                            });
                        });
                    });
                    context('Parameters specified init ', function() {

                        context('init', function() { //pending  capture of data 
                            it('should request simulator settings', function(done) {
                                var simProc = run('matrix', ['sim', 'init']);
                                var outputs = new Array();
                                simProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString());
                                    simProc.stdin.write('Examsssple\n');
                                    outputs.push(out.toString());
                                });
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString());
                                })

                                simProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(i('matrix.sim.init.specify_data_for_init')), 'stdout Fail, expecting "' + i('') + '"')
                                    done();
                                });


                            });

                        });

                        context('Simulator hasn\'t been initialized', function() {

                            context('restore', function() { //pending for Error 
                                it.skip('should show an "initialize simulator" warning', function(done) {
                                    var simProc = run('matrix', ['sim', 'restore']);
                                    var outputs = new Array();
                                    simProc.stdout.on('data', function(out) {
                                        outputs.push(out.toString());
                                    });
                                    simProc.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_restore_warning));
                                        done();
                                    });
                                });
                            });

                            context('start', function() {
                                it.skip('should show an "initialize simulator" warning', function(done) {
                                    var simProc = run('matrix', ['sim', 'start']);
                                    var outputs = new Array();
                                    simProc.stdout.on('data', function(out) {
                                        outputs.push(out.toString());
                                    });

                                    simProc.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_not_init_warning));
                                        done();
                                    });

                                });
                            });

                            context('upgrade', function() {
                                it.skip('should show an "initialize simulator" warning', function(done) {
                                    var simProc = run('matrix', ['sim', 'upgrade']);
                                    var outputs = new Array();
                                    simProc.stdout.on('data', function(out) {
                                        outputs.push(out.toString());
                                    });
                                    simProc.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_not_init_warning));
                                        done();
                                    });
                                });
                            });

                            context('save', function() {
                                it.skip('should show an "initialize simulator" warning', function(done) {
                                    var simProc = run('matrix', ['sim', 'save']);
                                    var outputs = new Array();

                                    simProc.stderr.on('data', function(out) {
                                        outputs.push(out.toString());
                                    });
                                    simProc.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_not_init_warning))
                                        done();
                                    });

                                });
                            });

                            context('clear', function() {
                                it.skip('should show an "initialize simulator" warning', function(done) {
                                    var simProc = run('matrix', ['sim', 'init']);
                                    var outputs = new Array();

                                    simProc.stdout.on('data', function(out) {
                                        outputs.push(out.toString());
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_not_init_warning));
                                        done();
                                    });
                                });
                            });
                            context('init', function() { //pending  capture of data 
                                it.skip('should request simulator settings', function(done) {
                                    var simProc = run('matrix', ['sim', 'init']);
                                    var outputs = new Array();
                                    simProc.stdout.on('data', function(out) {
                                        out.should.matchAny(new RegExp(strings.sim.sim_init_request_credencials));
                                        done();
                                    });
                                });
                            });

                        });

                        context.skip('Simulator initialized', function() {

                            before(function(done) {
                                this.timeout(15000);
                                var simProc = run('matrix', ['sim', 'init']);
                                var outputs = new Array();
                                simProc.stdout.on('data', function(out) {
                                    simProc.stdin.write('Example\n');
                                    simProc.stdin.write('Example\n');
                                    outputs.push(out.toString());
                                    //done();
                                });
                                simProc.stdout.on('close', function(code) {
                                    done();
                                });

                            });

                            context('restore', function() {
                                it.skip('should reset the simulator', function(done) {
                                    var simProc = run('matrix', ['sim', 'restore']);
                                    var outputs = new Array();
                                    simProc.stdout.on('data', function(out) {
                                        outputs.push(out.toString());
                                    });

                                    simProc.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_restore_successfully));
                                        done();
                                    });
                                });
                            });

                            context('start', function() {
                                it.skip('should start MatrixOS virtual environment', function(done) {
                                    var startProc = run('matrix', ['sim', 'start']);
                                    var outputs = new Array();
                                    startProc.stderr.on('data', function(out) {
                                        outputs.push(out.toString());
                                    })
                                    startProc.stdout.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_start_sucessfully));
                                    })
                                });
                            });
                            context('stop', function() {
                                it.skip('should stop MatrixOS virtual environment', function(done) {
                                    var stopProc = run('matrix', ['sim', 'stop']);
                                    var outputs = new Array();
                                    stopProc.stderr.on('data', function(out) {
                                        outputs.push(out.toString());
                                    })
                                    stopProc.stdout.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_stop_sucessfully));
                                        done();
                                    })
                                });
                            });

                            context('save', function() {
                                it.skip('should save MatrixOS state, use after deploy / install', function(done) {
                                    var saveProc = run('matrix', ['sim', 'save']);
                                    var outputs = new Array();
                                    saveProc.stderr.on('data', function(out) {
                                        outputs.push(out.toString());
                                        //console.log('brayan1', out.toString(),'<<<<<<<');
                                    })
                                    saveProc.stdout.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_save_sucessfully));
                                        console.log('closeeee', outputs);
                                        done();
                                    })
                                });
                            });

                            context('clear', function() {
                                it.skip('should remove simulation local data', function(done) {
                                    var clearProc = run('matrix', ['sim', 'clear']);
                                    var outputs = new Array();
                                    clearProc.stdout.on('data', function(out) {
                                        outputs.push(out.toString());
                                    })
                                    clearProc.stdout.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(strings.sim.sim_clear_sucessfully));
                                        done();
                                    })
                                });
                            });

                        });

                        context('Unknown parameter specified', function() {
                            it.skip('should display an "unknown parameter warning"', function(done) {
                                var unkProc = run('matrix', ['sim', 'XXX']);
                                var outputs = new Array();
                                unkProc.stdout.on('data', function(out) {
                                    outputs.push(out.toString());
                                })
                                unkProc.stdout.on('close', function(code) {
                                    console.log('brayan', outputs);
                                    outputs.should.matchAny(new RegExp(strings.sim.sim_unknown_parameter_warning));
                                    done();
                                })
                            });
                        });
                    });
                }); //finish sim

                context('list', function() {

                    context('No parameters specified', function() {
                        it.skip('Show "list" command usage', function(done) {
                            var listProc = run('matrix', ['list', '']);
                            var outputs = new Array();
                            listProc.stdout.on('data', function(out) {
                                console.log('brayan', out.toString());
                                outputs.push(out.toString());
                            })
                            listProc.stdout.on('close', function(code) {
                                console.log('brayanClose', outputs);
                                outputs.should.matchAny(new RegExp(strings.list.list_usage_command));
                                done();
                            })
                        });
                    });

                    context('Parameters specified', function() { //pending
                        context('devices', function() {
                            it.skip('display available devices', function(done) {
                                this.timeout(15000);
                                var listProc = run('matrix', ['list', 'devices']);
                                var outputs = new Array();
                                listProc.stdout.on('data', function(out) {
                                    console.log('>>>>>    ', out.toString());
                                    //console.log('BRAYAN', JSON.stringify(out));

                                });

                                listProc.on('close', function(code) {
                                    // outputs.should.matchAny(strings.list.list_devices)
                                    console.log('>dsfds>>>', code.toString());
                                    done();
                                });
                            });
                        });




                        context('groups', function() {
                            it.skip('display groups of devices', function(done) {});
                        });

                        context('apps', function() {
                            it.skip('display apps on current device', function(done) {});
                        });

                        context('all', function() {
                            it.skip('display all devices with installed apps', function(done) {});
                        });

                        context('Unknown parameter specified', function() {
                            it.skip('should display an "unknown parameter warning"', function(done) {});
                        });
                    });
                }); //list

                //DEVICE REQUIRED

                context('set', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var setProc = run('matrix', ['set', '']);
                        var outputs = new Array();
                        setProc.stdout.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                        });

                        setProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            console.log('close', outputs)
                            done();
                        });
                    });
                }); //finish set


                context('reboot', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var rebootProc = run('matrix', ['reboot', '']);
                        var outputs = new Array();
                        rebootProc.stdout.on('data', function(out) {
                            outputs.push(out.toString());
                        })
                        rebootProc.on('close', function(code) {
                            console.log('CLOSE>>>>>>>>>>', outputs);
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));

                            done();
                        })
                    });
                }); // finish reboot

                context('search', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var searchProc = run('matrix', ['search']);
                        var outputs = new Array();
                        searchProc.stdout.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                        });

                        searchProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            console.log('close', outputs)
                            console.log(done);
                            done();
                        });
                    });
                }); // finish search

                context('install', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var installProc = run('matrix', ['install']);
                        var outputs = new Array();
                        installProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                        });

                        installProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        });
                    });
                }); // finish install

                context('config', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var configProc = run('matrix', ['config']);
                        var outputs = new Array();
                        configProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                        });

                        configProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        });
                    });
                }); // finish config

                context('uninstall', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var uninstallProc = run('matrix', ['uninstall']);
                        var outputs = new Array();
                        uninstallProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                        });

                        uninstallProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        });
                    });
                }); // finish uninstall

                context('update', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var updateProc = run('matrix', ['update']);
                        var outputs = new Array();
                        updateProc.stdout.on('data', function(out) {
                            outputs.push(out.toString());
                        });

                        updateProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        });
                    });
                }); // finish update


                context('start', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var startProc = run('matrix', ['start']);
                        var outputs = new Array();
                        startProc.stdout.on('data', function(out) {
                            console.log('Brayan', out.toString());
                            outputs.push(out.toString());
                            console.log(outputs, 'BrayanCLOSE')
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        });
                    });
                }); // finish start

                context('stop', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var stopProc = run('matrix', ['stop']);
                        var outputs = new Array();
                        stopProc.stdout.on('data', function(out) {
                            console.log('brayan', out.toString());
                            outputs.push(out.toString());
                            console.log('daniloo', outputs);
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        })
                    });
                }); //finish stop

                context('restart', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var restartProc = run('matrix', ['restart']);
                        var outputs = new Array();

                        restartProc.stderr.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                        });

                        restartProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            console.log('close', outputs)
                            done();
                        });
                    });
                }); // finish restart


                context('create', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var createProc = run('matrix', ['create']);
                        var outputs = new Array();

                        createProc.stderr.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                        });

                        createProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            console.log('close', outputs)
                            done();
                        });
                    });
                }); // finish create

                context('deploy', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var deployProc = run('matrix', ['deploy']);
                        var outputs = new Array();

                        deployProc.stderr.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                        });

                        deployProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            console.log('close', outputs)
                            done();
                        });
                    });
                }); // finish deploy

                context('trigger', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var triggerProc = run('matrix', ['trigger']);
                        var outputs = new Array();

                        triggerProc.stderr.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                        });

                        triggerProc.on('close', function(code) {
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            console.log('close', outputs)
                            done();
                        });
                    });
                }); // finish trigger

                context('log', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var logProc = run('matrix', ['log']);
                        var outputs = new Array();

                        logProc.stdout.on('data', function(out) {
                            console.log('>>>>', out.toString());
                            outputs.push(out.toString());
                            console.log('brayan', outputs);
                            outputs.should.matchAny(new RegExp(strings.deviceRequired.no_device_select_warning));
                            done();
                        });

                    });
                }); // finish log

            });

        })

    })

})

function readConfig() {
    return JSON.parse(require('fs').readFileSync('./tmp/store.json'));
}
