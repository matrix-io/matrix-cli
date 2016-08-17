require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table');

describe('Matrix CLI Commands', function() {
    before(function(done) {
        Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function() {})
        done();
    })

    context('Not logged in{', function(done) {
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                    outputs.should.matchAny(new RegExp(t('matrix.login.login_success')), 'stdout Fail, expecting "' + t('matrix.login.login_success') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.logout.logout_success')), 'stdout Fail, expecting "' + t('matrix.logout.logout_success') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
                        done();
                    });
                });
            }); //Finish log
        }) // FINISH CONTEXT Not logged in 

    context('Logged in {', function() {
        before(function(done) {
            this.timeout(15000);
            var loginProc = run('matrix', ['login']);
            loginProc.stdout.on('data', function(out) {
                if (out.toString().indexOf('username') > -1) {
                    console.log('stdout', out.toString());
                    loginProc.stdin.write('demo.admobilize@gmail.com\n')
                } else if (out.toString().indexOf('password') > -1) {
                    console.log('stdout', out.toString());
                    loginProc.stdin.write('admobdemo2016\n')
                } else if (out.toString().indexOf('Login Successful') > -1) {
                    console.log('stdout', out.toString());
                    if (readConfig().user.hasOwnProperty('token')) {
                        console.log('stdout', out.toString());
                        console.log(out.toString().red);
                    }
                }

            });
            loginProc.stderr.on('data', function(out) {
                console.log('stderr', out.toString())
            })
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
                        outputs.should.matchAny(new RegExp(t('matrix.login.already_login_warning')), 'stdout Fail, expecting "' + t('matrix.login.already_login_warning') + '"')
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
                        outputs.should.matchAny(new RegExp(t('matrix.logout.logout_success')), 'stdout Fail, expecting "' + t('matrix.logout.logout_success') + '"')
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
                            outputs.should.matchAny(new RegExp(t('matrix.use.command_help')), 'stdout Fail, expecting "' + t('matrix.use.command_help') + '"')
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
                                outputs.should.matchAny(new RegExp(t('matrix.use.device_not_found')), 'stdout Fail, expecting "' + t('matrix.use.device_not_found') + '"')
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
                                outputs.should.matchAny(new RegExp(t('matrix.use.not_authorized')), 'stdout Fail, expecting "' + t('matrix.use.not_authorized') + '"')
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
                                outputs.should.matchAny(new RegExp(t('matrix.use.using_device_by_name')), 'stdout Fail, expecting "' + t('matrix.use.using_device_by_name') + '"')
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
                            outputs.should.matchAny(new RegExp(t('matrix.sim.command_help_sim')), 'stdout Fail, expecting "' + t('matrix.sim.command_help_sim') + '"')
                            done();
                        });
                    });
                });
                context('Parameters specified init ', function() {

                    context('init', function() { //pending  capture of data 
                        it.skip('should request simulator settings', function(done) {
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
                                outputs.should.matchAny(new RegExp(t('matrix.sim.init.specify_data_for_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.specify_data_for_init') + '"')
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
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                })
                                simProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.init.warning_sim_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.warning_sim_init') + '"')
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
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                })
                                simProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.init.warning_sim_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.warning_sim_init') + '"')
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
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                })
                                simProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.init.warning_sim_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.warning_sim_init') + '"')
                                    done();
                                });
                            });
                        });

                        context('save', function() {
                            it.skip('should show an "initialize simulator" warning', function(done) {
                                var simProc = run('matrix', ['sim', 'save']);
                                var outputs = new Array();

                                simProc.stdout.on('data', function(out) {
                                    outputs.push(out.toString());
                                });
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                })
                                simProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.init.warning_sim_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.warning_sim_init') + '"')
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
                                });
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                })
                                simProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.init.warning_sim_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.warning_sim_init') + '"')
                                    done();
                                });
                            });
                        });
                        context('init', function() { //pending  capture of data 
                            it.skip('should request simulator settings', function(done) {
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
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.init.specify_data_for_init')), 'stdout Fail, expecting "' + t('matrix.sim.init.specify_data_for_init') + '"')
                                    done();
                                });
                            });
                        });

                    });

                    context('Simulator initialized', function() {

                        /*abefore(function(done) {
                             this.timeout(15000);
                             var simProc = run('matrix', ['sim', 'init']);
                             var outputs = new Array();
                             simProc.stdout.on('data', function(out) {
                                 console.log('stdout',out.toString())
                                 simProc.stdin.write('vvvv\n');
                                 simProc.stdin.write('vvv\n');
                                 outputs.push(out.toString());
                                 console.log(outputs,'outputs')

                             });
                             simProc.stderr.on('data',function(out){
                                 console.log('stderr', out.toString())
                             })
                             simProc.on('close', function(code) {
                                 console.log('Simulator initialized'.magenta,outputs);
                                 done();
                             });

                         });*/

                        context('restore', function() {
                            it.skip('should reset the simulator', function(done) {
                                var simProc = run('matrix', ['sim', 'restore']);
                                var outputs = new Array();
                                simProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString());
                                    outputs.push(out.toString());
                                });
                                simProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                })
                                simProc.on('close', function(code) {
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.restore.downloading_image')), 'stdout Fail, expecting "' + t('matrix.sim.restore.downloading_image') + '"')
                                    done();
                                });
                            });
                        });

                        context('start', function() {
                            it.skip('should start MatrixOS virtual environment', function(done) {
                                var startProc = run('matrix', ['sim', 'start']);
                                var outputs = new Array();
                                startProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString());
                                })
                                startProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString());
                                    outputs.push(out.toString());
                                })
                                startProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.start.starting_sim')), 'stdout Fail, expecting "' + t('matrix.sim.start.starting_sim') + '"')
                                    done();
                                })
                            });
                        });

                        context('stop', function() {
                            it.skip('should stop MatrixOS virtual environment', function(done) {
                                var stopProc = run('matrix', ['sim', 'stop']);
                                var outputs = new Array();
                                stopProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                stopProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                stopProc.on('close', function(code) {
                                    console,
                                    log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.stop.sim_stopped')), 'stdout Fail, expecting "' + t('matrix.sim.stop.sim_stopped') + '"')
                                    done();
                                })
                            });
                        });

                        context('save', function() {
                            it.skip('should save MatrixOS state, use after deploy / install', function(done) {
                                var saveProc = run('matrix', ['sim', 'save']);
                                var outputs = new Array();
                                saveProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                })
                                saveProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                saveProc.on('close', function(code) {
                                    console.log('closeeee', outputs);
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.save.state_saved')), 'stdout Fail, expecting "' + t('matrix.sim.save.state_saved') + '"')
                                    done();
                                })
                            });
                        });

                        context('clear', function() {
                            it.skip('should remove simulation local data', function(done) {
                                var clearProc = run('matrix', ['sim', 'clear']);
                                var outputs = new Array();
                                clearProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                clearProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                clearProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.sim.clear.simulation_cleared')), 'stdout Fail, expecting "' + t('matrix.sim.clear.simulation_cleared') + '"')
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
                            unkProc.on('close', function(code) {
                                console.log('brayan', outputs);
                                outputs.should.matchAny(new RegExp(t('matrix.sim.unknowm_parameter')), 'stdout Fail, expecting "' + t('matrix.sim.unknowm_parameter') + '"')
                                done();
                            })
                        });
                    });
                });
            }); //Finish sim

            context('list', function() {

                context('No parameters specified', function() {
                    it.skip('Show "list" command usage', function(done) {
                        var listProc = run('matrix', ['list', '']);
                        var outputs = new Array();
                        listProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString());
                        })
                        listProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString());
                        })
                        listProc.stdout.on('close', function(code) {
                            console.log('brayanClose', outputs);
                            outputs.should.matchAny(new RegExp(t('matrix.list.help_devices')), 'stdout Fail, expecting "' + t('matrix.list.help_devices') + '"')
                            done();
                        })
                    });
                });

                context('Parameters specified', function() {
                    context('devices', function() {
                        it.skip('display available devices', function(done) { //No se puede recibir la tabla de devices 
                            this.timeout(15000);
                            var listProc = run('matrix', ['list', 'devices']);
                            var outputs = new Array();
                            listProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString());
                            });
                            listProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            listProc.on('close', function(code) {
                                console.log('close', outputs);
                                outputs.should.matchAny(new RegExp(t('matrix.list.list_devices')), 'stdout Fail, expecting "' + t('matrix.list.list_devices') + '"')
                                done();
                            });
                        });
                    });




                    context('groups', function() {
                        it.skip('display groups of devices', function(done) {
                            var groupsProc = run('matrix', ['list', 'groups'])
                            var outputs = new Array();
                            groupsProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString())
                            })
                            groupsProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            groupsProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.list.list_groups')), 'stdout Fail, expecting "' + t('matrix.list.list_groups') + '"')
                                done()
                            })
                        });
                    });

                    context('apps', function() {
                        it.skip('display apps on current device', function(done) {
                            var appsProc = run('matrix', ['list', 'apps'])
                            var outputs = new Array();
                            appsProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString())
                            })
                            appsProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            appsProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.list.list_apps')), 'stdout Fail, expecting "' + t('matrix.list.list_apps') + '"')
                                done()
                            })
                        });
                    });

                    context('all', function() {
                        it.skip('display all devices with installed apps', function(done) {
                            var allProc = run('matrix', ['list', 'all'])
                            var outputs = new Array();
                            appsProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString())
                            })
                            appsProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            appsProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.list.list_all')), 'stdout Fail, expecting "' + t('matrix.list.list_all') + '"')
                                done()
                            })
                        });
                    });

                    context('Unknown parameter specified', function() {
                        it.skip('should display an "unknown parameter warning"', function(done) {

                            var unknownProc = run('matrix', ['list', 'XXXXX'])
                            var outputs = new Array();
                            unknownProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString())
                            })
                            unknownProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            unknownProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.list.no_results')), 'stdout Fail, expecting "' + t('matrix.list.no_results') + '"')
                                done()
                            })
                        });
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
                    setProc.stderr.on('data', function(out) {
                        console.log('stderr', out.toString())
                    })
                    setProc.on('close', function(code) {
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        console.log('close', outputs)
                        done();
                    });
                });
            }); //Finish set


            context('reboot', function() {
                it.skip('should show a "Select a Device" warning', function(done) {
                    var rebootProc = run('matrix', ['reboot', '']);
                    var outputs = new Array();
                    rebootProc.stdout.on('data', function(out) {
                        console.log('close', out.toString())
                        outputs.push(out.toString());
                    })
                    rebootProc.stderr.on('data', function(out) {
                        console.log('stderr', out.toString())
                        outputs.push(out.toString());
                    })
                    rebootProc.on('close', function(code) {
                        console.log('close', outputs);
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        done();
                    })
                });
            }); // Finish reboot

            context('search', function() {
                it.skip('should show a "Select a Device" warning', function(done) {
                    var searchProc = run('matrix', ['search']);
                    var outputs = new Array();
                    searchProc.stdout.on('data', function(out) {
                        console.log('stdout', out.toString());
                        outputs.push(out.toString());
                    });
                    searchProc.stderr.on('data', function(out) {
                        console.log('stderr', out.toString())
                        outputs.push(out.toString());
                    })
                    searchProc.on('close', function(code) {
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        console.log('close', outputs)
                        done();
                    });
                });
            }); // Finish search

            context('install', function() {
                it.skip('should show a "Select a Device" warning', function(done) {
                    var installProc = run('matrix', ['install']);
                    var outputs = new Array();
                    installProc.stdout.on('data', function(out) {
                        console.log('stdout', out.toString());
                        outputs.push(out.toString())
                    })
                    installProc.stderr.on('data', function(out) {
                        outputs.push(out.toString());
                        console.log('stderr', out.toString())
                    });
                    installProc.on('close', function(code) {
                        console.log('close', outputs)
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        done();
                    });
                });
            }); // Finish install

            context('config', function() {
                it.skip('should show a "Select a Device" warning', function(done) {
                    var configProc = run('matrix', ['config']);
                    var outputs = new Array();
                    configProc.stdout.on('data', function(out) {
                        console.log('stdout', out.toString());
                        outputs.push(out.toString())
                    })
                    configProc.stderr.on('data', function(out) {
                        outputs.push(out.toString());
                        console.log('stderr', out.toString())
                    });
                    configProc.on('close', function(code) {
                        console.log('close', outputs)
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        done();
                    });
                });
            }); // Finish config

            context('uninstall', function() {
                it.skip('should show a "Select a Device" warning', function(done) {
                    var uninstallProc = run('matrix', ['uninstall']);
                    var outputs = new Array();
                    uninstallProc.stdout.on('data', function(out) {
                        console.log('stdout', out.toString());
                        outputs.push(out.toString())
                    })
                    uninstallProc.stderr.on('data', function(out) {
                        outputs.push(out.toString());
                        console.log('stderr', out.toString())
                    });
                    uninstallProc.on('close', function(code) {
                        console.log('close', outputs)
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        done();
                    });
                });
            }); // Finish uninstall

            context('update', function() {
                it.skip('should show a "Select a Device" warning', function(done) {
                    var updateProc = run('matrix', ['update']);
                    var outputs = new Array();
                    updateProc.stdout.on('data', function(out) {
                        console.log('stdout', out.toString());
                        outputs.push(out.toString())
                    })
                    updateProc.stderr.on('data', function(out) {
                        outputs.push(out.toString());
                        console.log('stderr', out.toString())
                    });
                    updateProc.on('close', function(code) {
                        console.log('close', outputs)
                        outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                        done();
                    });
                }); // Finish update


                context('start', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var startProc = run('matrix', ['start']);
                        var outputs = new Array();
                        startProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        startProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        startProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });
                    });
                }); // Finish start

                context('stop', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var stopProc = run('matrix', ['stop']);
                        var outputs = new Array();
                        stopProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        stopProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        stopProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });
                    });
                }); //Finish stop

                context('restart', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var restartProc = run('matrix', ['restart']);
                        var outputs = new Array();

                        restartProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        restartProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        restartProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });
                    });
                }); // Finish restart


                context('create', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var createProc = run('matrix', ['create']);
                        var outputs = new Array();

                        createProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        createProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        createProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });
                    });
                }); // Finish create

                context('deploy', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var deployProc = run('matrix', ['deploy']);
                        var outputs = new Array();

                        deployProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        deployProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        deployProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });
                    });
                }); // Finish deploy

                context('trigger', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var triggerProc = run('matrix', ['trigger']);
                        var outputs = new Array();
                        triggerProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        triggerProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        triggerProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });
                    });
                }); // Finish trigger

                context('log', function() {
                    it.skip('should show a "Select a Device" warning', function(done) {
                        var logProc = run('matrix', ['log']);
                        var outputs = new Array();

                        logProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString())
                        })
                        logProc.stderr.on('data', function(out) {
                            outputs.push(out.toString());
                            console.log('stderr', out.toString())
                        });
                        logProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.set.warning_device_required')), 'stdout Fail, expecting "' + t('matrix.set.warning_device_required') + '"')
                            done();
                        });

                    });
                }); // Finish log

            })
            context('Device selected', function() { //.........................
                before(function(done) {
                    this.timeout(15000);
                    var useProc = run('matrix', ['use', 'AdBeacon1']);
                    var outputs = new Array();
                    useProc.stdout.on('data', function(out) {
                        outputs.push(out.toString());
                    });
                    useProc.on('close', function(code) {
                        console.log(outputs);
                        done();
                    });
                });
                context('set', function() {
                    context('No parameters specified', function() {
                        it.skip('should command "set" usage', function(done) {
                            var setProc = run('matrix', ['set']);
                            var outputs = new Array();
                            setProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString());
                            });
                            setProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            setProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.set.help_device')), 'stdout Fail, expecting "' + t('matrix.set.help_device') + '"')
                                done();
                            });
                        });
                    }); // finish set No parameters specified


                    context('Parameters specified', function() {
                        context('env', function() {
                            context('No parameters specified', function() {
                                it.skip('should show command "set env" usage', function(done) {
                                    var setProc = run('matrix', ['set', 'env']);
                                    var outputs = new Array();
                                    setProc.stdout.on('data', function(out) {
                                        console.log('stdout', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    setProc.stderr.on('data', function(out) {
                                        console.log('stderr', out.toString());
                                        outputs.push(out.toString());
                                    });

                                    setProc.on('close', function(code) {
                                        console.log('close', outputs)
                                        outputs.should.matchAny(new RegExp(t('matrix.set.env.valid_environments')), 'stdout Fail, expecting "' + t('matrix.set.env.valid_environments') + '"')
                                        done();
                                    });

                                });
                            });
                            context('Parameters specified', function() {
                                context('sandbox', function() {
                                    it.skip('should set the device environment to sandbox', function(done) {
                                        var setProc = run('matrix', ['set', 'env', 'sandbox']);
                                        var outputs = new Array();

                                        setProc.stdout.on('data', function(out) {
                                            console.log('stdout', out.toString())
                                            outputs.push(out.toString());
                                        });
                                        setProc.stderr.on('data', function(out) {
                                            console.log('stderr', out.toString())
                                        })

                                        setProc.on('close', function(code) {
                                            console.log('close', outputs)
                                            outputs.should.matchAny(new RegExp(t('matrix.set.env.env')), 'stdout Fail, expecting "' + t('matrix.set.env.env') + '"')
                                            done();
                                        });

                                    });
                                });
                                context('production', function() {
                                    it.skip('should set the device environment to production', function(done) {
                                        var setProc = run('matrix', ['set', 'env', 'production']);
                                        var outputs = new Array();
                                        setProc.stdout.on('data', function(out) {
                                            console.log('stdout', out.toString())
                                            outputs.push(out.toString());
                                        });
                                        setProc.stderr.on('data', function(out) {
                                            console.log('stderr', out.toString())
                                        })

                                        setProc.on('close', function(code) {
                                            console.log('close', outputs)
                                            outputs.should.matchAny(new RegExp(t('matrix.set.env.env')), 'stdout Fail, expecting "' + t('matrix.set.env.env') + '"')
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                        context('config', function() {
                            context('No parameters specified', function() {
                                it.skip('should show command "set config" usage', function(done) {
                                    var setProc = run('matrix', ['set', 'config']);
                                    var outputs = new Array();
                                    setProc.stdout.on('data', function(out) {
                                        console.log('stdout', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    setProc.stderr.on('data', function(out) {
                                        console.log('>>>>', out.toString());
                                        outputs.push(out.toString());
                                    });

                                    setProc.on('close', function(code) {
                                        outputs.should.matchAny(new RegExp(t('matrix.set.config.no_app')), 'stdout Fail, expecting "' + t('matrix.set.config.no_app') + '"')
                                        console.log('close', outputs)
                                        done();
                                    });
                                });
                            });
                            context('Parameters specified', function() {
                                context('Invalid app name', function() {
                                    it.skip('should show an "invalid app" warning', function(done) {
                                        var setProc = run('matrix', ['set', 'config', 'invalid']);
                                        var outputs = new Array();
                                        setProc.stdout.on('data', function(out) {
                                            console.log('stdout', out.toString())
                                            outputs.push(out.toString());
                                        })
                                        setProc.stderr.on('data', function(out) {
                                            console.log('stderr', out.toString());
                                            outputs.push(out.toString());
                                        });
                                        setProc.on('close', function(code) {
                                            console.log('close', outputs)
                                            outputs.should.matchAny(new RegExp(t('matrix.set.config.invalid_key_value')), 'stdout Fail, expecting "' + t('matrix.set.config.invalid_key_value') + '"')
                                            done();
                                        });
                                    });
                                });
                                context('Valid app name', function() {
                                    context('Missing proper key value setting', function() {
                                        it.skip('should show command "set config" usage', function(done) {
                                            var setProc = run('matrix', ['set', 'config', 'vehicle']);
                                            var outputs = new Array();
                                            setProc.stdout.on('data', function(out) {
                                                console.log('stdout', out.toString())
                                                outputs.push(out.toString());
                                            })
                                            setProc.stderr.on('data', function(out) {
                                                console.log('stderr', out.toString());
                                                outputs.push(out.toString());
                                            });
                                            setProc.on('close', function(code) {
                                                console.log('close', outputs)
                                                outputs.should.matchAny(new RegExp(t('matrix.set.config.no_key_value')), 'stdout Fail, expecting "' + t('matrix.set.config.no_key_value') + '"')
                                                done()
                                            })
                                        });
                                    });
                                    context('Valid key value setting', function() { //pending might be part of the `node-sdk`
                                        it.skip('should set the configuration value for the specified key', function(done) {
                                            var setProc = run('matrix', ['set', 'config', 'vehicle', 'name=brayan']);
                                            var outputs = new Array();
                                            this.timeout(15000)
                                            setProc.stdout.on('data', function(out) {
                                                console.log('stdout', out.toString())
                                                outputs.push(out.toString());
                                            })
                                            setProc.stderr.on('data', function(out) {
                                                console.log('stderr', out.toString());
                                                outputs.push(out.toString());
                                            });
                                            setProc.stdout.on('close', function(code) {
                                                console.log('close', outputs)
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
            context('reboot', function() {
                context('device is not alive', function() {
                    it.skip('should return an error', function(done) {
                        var rebootProc = run('matrix', ['reboot']);
                        var outputs = new Array();

                        rebootProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString());
                        });
                        rebootProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })

                        rebootProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.reboot.device_offline')), 'stdout Fail, expecting "' + t('matrix.reboot.device_offline') + '"')
                            done();
                        });
                    });
                });
                context('Device is alive', function() {
                    it.skip('should reboot the current device', function(done) {
                        var rebootProc = run('matrix', ['reboot']);
                        var outputs = new Array();

                        rebootProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString());
                        });
                        rebootProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })

                        rebootProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.reboot.rebooted')), 'stdout Fail, expecting "' + t('matrix.reboot.rebooted') + '"')
                            done();
                        });
                    });
                });
            }); //finish reboot Pending error tokens 


            context('search', function() {
                context('No parameters specified', function() {
                    it.skip('should show command "search" usage', function(done) {
                        var searchProc = run('matrix', ['search']);
                        var outputs = new Array();
                        searchProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString());
                        })
                        searchProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })
                        searchProc.on('close', function(code) {
                            console.log('close', outputs);
                            outputs.should.matchAny(new RegExp(t('matrix.search.help')), 'stdout Fail, expecting "' + t('matrix.search.help') + '"')
                            done();
                        })
                    });
                });

                context('Parameters specified', function() {
                    context('search term has less than 2 characters', function() {
                        it.skip('should show a search term warning', function(done) {
                            var searchProc = run('matrix', ['search', 'xx']);
                            var outputs = new Array();
                            searchProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString());
                            })
                            searchProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            searchProc.on('close', function(code) {
                                console.log('close', outputs);
                                outputs.should.matchAny(new RegExp(t('matrix.search.small_needle')), 'stdout Fail, expecting "' + t('matrix.search.small_needle') + '"')
                                done();
                            })

                        });
                    });

                    context('search term has more than 2 characters', function() {
                        it.skip('should list the results of an app search', function(done) {
                            var searchProc = run('matrix', ['search', 'xxxx']);
                            var outputs = new Array();
                            searchProc.stdout.on('data', function(out) {
                                console.log('BRAYAN>>>>', out.toString());
                                console.log("Instance: ", out instanceof Array);
                                console.log("OUT Type: ", typeof out);
                                console.log('stdout', out.toString());
                                outputs.push(out.toString());
                            })
                            searchProc.stderr.on('data', function(out) {
                                console.log('BRAYAN>>>>', out);
                                var arr = Object.keys(out).map(function(key) { console.log("RES: ", out[key]) });
                                console.log("ARR: ", arr.toString());
                                console.log("Instance: ", out instanceof Array);
                                console.log("ERR Type: ", typeof out);
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            searchProc.on('close', function(code) {
                                console.log('close', outputs);
                                outputs.should.matchAny(new RegExp(t('matrix.search.search_successfully')), 'stdout Fail, expecting "' + t('matrix.search.search_successfully') + '"')
                                done();
                            })
                        });
                    });
                });

            }); //finish search pending (matrix search XXX) by return on a table ! 

            context('install', function() {
                context('No parameters specified', function() {
                    it('should show command "install" usage', function(done) {
                        var installProc = run('matrix', ['install']);
                        var outputs = new Array();
                        installProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString());
                            outputs.push(out.toString());
                        })
                        installProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })
                        installProc.on('close', function(code) {
                            console.log('close', outputs);
                            outputs.should.matchAny(new RegExp(t('matrix.install.command_help')), 'stdout Fail, expecting "' + t('matrix.install.command_help') + '"')
                            done();
                        })

                    });
                });

                context('Parameters specified', function() {
                    context('Invalid app/sensor name', function() {
                        it.skip('should show invalid "app/sensor" warning', function(done) {
                            var installProc = run('matrix', ['install', 'XXXX'])
                            var outputs = new Array();
                            installProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString());
                                outputs.push(out.toString());
                            })
                            installProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            installProc.on('close', function(code) {
                                console.log('close', outputs);
                                outputs.should.matchAny(new RegExp(t('matrix.install.app_not_found')), 'stdout Fail, expecting "' + t('matrix.install.app_not_found') + '"')
                                done();
                            })
                        });
                    });

                    context('Valid app/sensor name', function() {
                        context('app is already installed', function() {
                            it.skip('should show warning app already installed', function(done) {
                                var installProc = run('matrix', ['install', 'Test Ruben']);
                                var outputs = new Array();
                                installProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString());
                                    outputs.push(out.toString());
                                })
                                installProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                installProc.on('close', function(code) {
                                    console.log('close', outputs);
                                    outputs.should.matchAny(new RegExp(t('matrix.install.app_installed')), 'stdout Fail, expecting "' + t('matrix.install.app_installed') + '"')
                                    done();
                                })
                            });
                        });
                        context('app isn\'t already installed', function() {
                            it.skip('should install the app or sensor specified to active MatrixOS device', function(done) {
                                var installProc = run('matrix', ['install', 'hello1']);
                                var outputs = new Array();

                                installProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                installProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                installProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.install.installing')), 'stdout Fail, expecting "' + t('matrix.install.installing') + '"')
                                    done();
                                })

                            });
                        });
                    });
                });


            }); //finish install  


            context('config', function() { //pending by error tokens 
                context('No parameters specified', function() {
                    it.skip('should show device configurations', function(done) {
                        var configProc = run('matrix', ['config']);
                        var outputs = new Array();
                        configProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString());
                        })
                        configProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })
                        configProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('')), 'stdout Fail, expecting "' + t('') + '"')
                            done();
                        })
                    });
                });

                context('Parameters specified', function() {

                    context('specified app doesn\'t exist', function() {
                        it.skip('should show an "specified app doesn\'t exist" warning', function(done) {
                            var configProc = run('matrix', ['config', 'XXXXX']);
                            var outputs = new Array();

                            configProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString());
                            })
                            configProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            configProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.config.specified_application_does_not_exist')), 'stdout Fail, expecting "' + t('matrix.config.specified_application_does_not_exist') + '"')
                                done();
                            })

                        });
                    });
                    context('specified app exists', function() {
                        context('app', function() {
                            it.skip('should show application configurations', function(done) {

                                var configProc = run('matrix', ['config', 'clock', '']);
                                var outputs = new Array();
                                configProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                configProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                configProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.config.specify_key')), 'stdout Fail, expecting "' + t('matrix.config.specify_key') + '"')
                                    done();
                                })
                            });
                        });

                        context('app key', function() {
                            context('specified key doesn\'t exist', function() {
                                it.skip('should show a "specified key doesn\'t exist" warning', function(done) {
                                    var configProc = run('matrix', ['config', 'clock', 'XXXXX']);
                                    var outputs = new Array();
                                    configProc.stdout.on('data', function(out) {
                                        console.log('stdout', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    configProc.stderr.on('data', function(out) {
                                        console.log('stderr', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    configProc.on('close', function(code) {
                                        console.log('close', outputs)
                                        outputs.should.matchAny(new RegExp(t('matrix.config.key_doesnt_exist')), 'stdout Fail, expecting "' + t('matrix.config.key_doesnt_exist') + '"')
                                        done();
                                    })
                                });
                            });

                            context('specified key exists', function() {
                                it.skip('should show application configuration key', function(done) {
                                    var configProc = run('matrix', ['config', 'clock', 'name']);
                                    var outputs = new Array();

                                    configProc.stdout.on('data', function(out) {
                                        console.log('stdout', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    configProc.stderr.on('data', function(out) {
                                        console.log('stderr', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    configProc.on('close', function(code) {
                                        console.log('close', outputs)
                                        outputs.should.matchAny(new RegExp(t('matrix.config.help_app_key')), 'stdout Fail, expecting "' + t('matrix.config.help_app_key') + '"')
                                        done();
                                    })
                                });
                            });
                        });

                        context('app key value', function() {
                            it.skip('should set application configuration key value', function(done) {
                                var configProc = run('matrix', ['config', 'clock', 'name=brayan']);
                                var outputs = new Array();

                                configProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                configProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                configProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.config.key_value')), 'stdout Fail, expecting "' + t('matrix.config.key_value') + '"')
                                    done();
                                })
                            });
                        });
                    });
                });
            }); //finish config   with errors


            context('uninstall', function() {
                context('No parameters specified', function() {
                    it.skip('should show command "uninstall" usage', function(done) {
                        var uninstallProc = run('matrix', ['uninstall']);
                        var outputs = new Array();
                        uninstallProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString());
                        })
                        uninstallProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })
                        uninstallProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.uninstall.application_unspecified')), 'stdout Fail, expecting "' + t('matrix.uninstall.application_unspecified') + '"')
                            done();
                        })

                    });
                });

                context('Parameters specified', function() {
                    context('specified app doesn\'t exist', function() {
                        it.skip('should show a "specified app doesn\'t exist" warning', function(done) {
                            var uninstallProc = run('matrix', ['uninstall', 'XXXX']);
                            var outputs = new Array();
                            uninstallProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString());
                            })
                            uninstallProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            uninstallProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.uninstall.app_undefined')), 'stdout Fail, expecting "' + t('matrix.uninstall.app_undefined') + '"')
                                done();
                            })
                        });
                    });

                    context('specified app exists', function() {

                        context('device is offline', function() {
                            it.skip('should show a "device is offline" warning', function(done) {
                                var uninstallProc = run('matrix', ['uninstall', 'myhealthapp']);
                                var outputs = new Array();
                                uninstallProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                uninstallProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                uninstallProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.uninstall.device_offline')), 'stdout Fail, expecting "' + t('matrix.uninstall.device_offline') + '"')
                                    done();
                                })
                            });
                        });

                        context('device is online', function() {
                            it.skip('should uninstall the specified app', function(done) {
                                var uninstallProc = run('matrix', ['uninstall', 'MyHealthApp']);
                                var outputs = new Array();
                                uninstallProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                uninstallProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                uninstallProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.uninstall.uninstalled')), 'stdout Fail, expecting "' + t('matrix.uninstall.uninstalled') + '"')
                                    done();
                                })
                            });
                        });
                    });
                });
            }); //finish  (error authenticate and acces token )uninstall 

            context('update', function() {

                context('No parameters specified', function() {
                    it.skip('should show command "update" usage', function(done) {
                        var updateProc = run('matrix', ['update']);
                        var outputs = new Array();
                        updateProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString());
                        })
                        updateProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })
                        updateProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.update.help_update')), 'stdout Fail, expecting "' + t('matrix.update.help_update') + '"')
                            done();
                        })
                    });
                });

                context('Parameters specified', function() {
                    context('app', function() {
                        context('device doesn\'t have the app installed', function() {
                            it.skip('should show a "device doesn\'t have the app installed"', function(done) {
                                var updateProc = run('matrix', ['update', 'vehicle'])
                                var outputs = new Array();

                                updateProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                updateProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                updateProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.update.app_undefined')), 'stdout Fail, expecting "' + t('matrix.update.app_undefined') + '"')
                                    done();
                                })
                            });
                        });

                        context('device has the app installed', function() {
                            it.skip('should update the application to its latest version', function(done) {
                                var updateProc = run('matrix', ['update', 'vehicle'])
                                var outputs = new Array();
                                updateProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                updateProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                updateProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.update.app_update_successfully')), 'stdout Fail, expecting "' + t('matrix.update.app_update_successfully') + '"')
                                    done();
                                })
                            });
                        });

                        context('app version', function() {
                            context('version doesn\'t exist', function() {
                                it.skip('should show a version doesn\'t exist warning', function(done) {
                                    var updateProc = run('matrix', ['update', 'vehicle', 'versionFake']);
                                    var outputs = new Array();
                                    updateProc.stdout.on('data', function(out) {
                                        console.log('stdout', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    updateProc.stderr.on('data', function(out) {
                                        console.log('stderr', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    updateProc.on('close', function(code) {
                                        console.log('close', outputs)
                                        outputs.should.matchAny(new RegExp(t('matrix.update.version_undefined')), 'stdout Fail, expecting "' + t('matrix.update.version_undefined') + '"')
                                        done();
                                    })
                                });
                            });

                            context('version exists', function() {
                                it.skip('should update to that version', function(done) {
                                    var updateProc = run('matrix', ['update', 'veryfirstapp', '0.7'])
                                    var outputs = new Array();

                                    updateProc.stdout.on('data', function(out) {
                                        console.log('stdout', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    updateProc.stderr.on('data', function(out) {
                                        console.log('stderr', out.toString())
                                        outputs.push(out.toString());
                                    })
                                    updateProc.on('close', function(code) {
                                        console.log('close', outputs)
                                        outputs.should.matchAny(new RegExp(t('matrix.update.version_update_successfully')), 'stdout Fail, expecting "' + t('matrix.update.version_update_successfully') + '"')
                                        done();
                                    })
                                });
                            });
                        });

                        context('unknown parameter', function() {
                            it.skip('should show a "parameter doesn\'t exist "', function(done) {
                                var updateProc = run('matrix', ['update', 'veryfirstapp', 'XXXXX'])
                                var outputs = new Array();
                                updateProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString());
                                })
                                updateProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString());
                                })
                                updateProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.update.version_doesnt_exist')), 'stdout Fail, expecting "' + t('matrix.update.version_doesnt_exist') + '"')
                                    done();
                                })
                            });
                        });
                    });
                });
            }); // finish update  error 

            context('start', function() {

                context('No parameters specified', function() {
                    it.skip('should show command "start" usage', function(done) {
                        var startProc = run('Matrix', ['start'])
                        var outputs = new Array();

                        startProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString());
                        })
                        startProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString());
                        })
                        startProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.start.application_unspecified')), 'stdout Fail, expecting "' + t('matrix.start.application_unspecified') + '"')
                            done();
                        })
                    });
                });

                context(' parameters specified', function() {
                    context('start', function() {
                        it.skip('Starts an app running on the active MatrixOS', function(done) {
                            var startProc = run('Matrix', ['start', 'vehicle'])
                            var outputs = new Array();

                            startProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString());
                            })
                            startProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            startProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.start.starting_app')), 'stdout Fail, expecting "' + t('matrix.start.starting_app') + '"')
                                done();
                            })
                        });
                    });
                    context('unknown parameter', function() {
                        it.skip('should show an "parameter doesn\'t exist', function(done) {
                            var startProc = run('Matrix', ['start', 'XXXX'])
                            var outputs = new Array();
                            startProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString());
                            })
                            startProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString());
                            })
                            startProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.start.app_undefined')), 'stdout Fail, expecting "' + t('matrix.start.app_undefined') + '"')
                                done();
                            })
                        });
                    });

                });
            }); // finish start error " client registration fail"

            context('stop', function() {

                context('No parameters specified', function() {
                    it.skip('should show command "stop" usage', function(done) {
                        var stopProc = run('matrix', ['stop'])
                        var outputs = new Array();

                        stopProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        stopProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        stopProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.stop.application_unspecified')), 'stdout Fail, expecting"' + t('matrix.stop.application_unspecified') + '"')
                            done()
                        })
                    });
                });

                context(' parameters specified', function() {
                    context('unknown parameter', function() {
                        it.skip('should show an "parameter doesn\'t exist', function(done) {
                            var stopProc = run('Matrix', ['stop', 'XXXX'])
                            var outputs = new Array();

                            stopProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            stopProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            stopProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.stop.app_undefined')), 'stdout Fail, expecting"' + t('matrix.stop.app_undefined') + '"')
                                done()
                            })
                        });
                    });
                    context('stop', function() {
                        it.skip('Stops an app running on the active MatrixOS', function(done) {
                            var stopProc = run('Matrix', ['stop', 'vehicle'])
                            var outputs = new Array();
                            stopProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            stopProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            stopProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.stop.stopping_app')), 'stdout Fail, expecting"' + t('matrix.stop.stopping_app') + '"')
                                done()
                            })
                        });
                    });
                });
            }); //finish stop ERROR FAIL AUTHENTICATE !! 

            context('restart', function() {

                context('No parameters specified', function() {
                    it.skip('should show command "restart" usage', function(done) {
                        var restartProc = run('Matrix', ['restart']);
                        var outputs = new Array();

                        restartProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        restartProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        restartProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.restart.stopping_app')), 'stdout Fail, expecting"' + t('matrix.restart.stopping_app') + '"')
                            done()
                        })
                    });
                });

                context(' parameters specified', function() {
                    context('unknown parameter', function() {
                        it.skip('should show an "parameter doesn\'t exist', function(done) {
                            var restartProc = run('Matrix', ['restart', 'XXXX']);
                            var outputs = new Array();


                            restartProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            restartProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            restartProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.restart.app_undefined')), 'stdout Fail, expecting"' + t('matrix.restart.app_undefined') + '"')
                                done()
                            })
                        });
                    });

                    context('restart', function() {
                        it.skip('Restarts an app running on the MatrixOS', function(done) {
                            var restartProc = run('Matrix', ['restart', 'vehicle']);
                            var outputs = new Array();


                            restartProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            restartProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            restartProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.restart.stopping_app')), 'stdout Fail, expecting"' + t('matrix.restart.stopping_app') + '"')
                                done()
                            })
                        });

                    });
                });
            }); //finish restart ERROR (Application.restart(admatrix.config, cb);)

            context('create', function() {

                context('No parameters specified', function() {
                    it('should show commands "create" usage', function(done) {
                        var createProc = run('matrix', ['create'])
                        var outputs = new Array();

                        createProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        createProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        createProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.create.name_undefined')), 'stdout Fail, expecting"' + t('matrix.create.name_undefined') + '"')
                            done()
                        })
                    });
                });

                context('specified to name device create', function() {
                    it('Creates a new scaffolding for a MatrixOS Application', function(done) {

                        var createProc = run('matrix', ['create', 'test'])
                        var outputs = new Array();

                        createProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        createProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        createProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.create.new_folder')), 'stdout Fail, expecting"' + t('matrix.create.new_folder') + '"')
                            done()
                        })
                    });
                });

            }); // finish create 'ERROR' 

            context('deploy', function() {
                context('No parameters specified', function() {
                    it.skip('should show commands "deploy" usage', function(done) {
                        var deployProc = run('matrix', ['deploy']);
                        var outputs = new Array();

                        deployProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        deployProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        deployProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.deploy.application_unspecified')), 'stdout Fail, expecting"' + t('matrix.deploy.application_unspecified') + '"')
                            done()
                        })
                    });
                });

                context('parameters specified', function() {
                    context('unknown parameter', function() {
                        it.skip('should show an "parameter doesn\'t exist', function(done) {

                            var deployProc = run('matrix', ['deploy', 'XXXXX']);
                            var outputs = new Array();

                            deployProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            deployProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            deployProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.deploy.app_undefined')), 'stdout Fail, expecting"' + t('matrix.deploy.app_undefined') + '"')
                                done()
                            })

                        });
                    });
                    context('name device correct', function() {
                        it.skip('Deploys an app to the active MatrixOS', function(done) {
                            var deployProc = run('matrix', ['deploy', 'vehicle']);
                            var outputs = new Array();

                            deployProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            deployProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            deployProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.deploy.deploy_app_successfully')), 'stdout Fail, expecting"' + t('matrix.deploy.deploy_app_successfully') + '"')
                                done()
                            })
                        });
                    });

                });
            }); // finish deploy 'ERROR'

            context('trigger', function() {
                context('No parameters specified', function() {
                    it.skip('should show commands "trigger" usage', function(done) {
                        var triggerProc = run('matrix', ['trigger']);
                        var outputs = new Array();

                        triggerProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        triggerProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        triggerProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.trigger.no_specified_test')), 'stdout Fail, expecting"' + t('matrix.trigger.no_specified_test') + '"')
                            done()
                        })
                    });
                });

                context('parameters specified', function() {
                    context('unknown parameter specified  ', function() {
                        it.skip('should show an "parameter doesn\'t exist', function(done) {
                            var triggerProc = run('matrix', ['trigger', 'XXXXX']);
                            var outputs = new Array();

                            triggerProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            triggerProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            triggerProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.trigger.defined_test_doesn`t_exist')), 'stdout Fail, expecting"' + t('matrix.trigger.defined_test_doesn`t_exist') + '"')
                                done()
                            })
                        });
                    });
                    context(' parameter specified is trigger ', function() {
                        it.skip('Runs a trigger test', function(done) {
                            var triggerProc = run('matrix', ['trigger', 'test']);
                            var outputs = new Array();
                            triggerProc.stdout.on('data', function(out) {
                                console.log('stdout', out.toString())
                                outputs.push(out.toString())
                            })
                            triggerProc.stderr.on('data', function(out) {
                                console.log('stderr', out.toString())
                                outputs.push(out.toString())
                            })
                            triggerProc.on('close', function(code) {
                                console.log('close', outputs)
                                outputs.should.matchAny(new RegExp(t('matrix.trigger.run_trigger_successfully')), 'stdout Fail, expecting"' + t('matrix.trigger.run_trigger_successfully') + '"')
                                done()
                            })


                        });
                    });

                });

            }); //finish trigger ERROR (client registration fail)

            context('log', function() {
                context('No parameters specified', function() {
                    it.skip('should show commands "log" usage', function(done) {
                        var logProc = run('matrix', ['log']);
                        var outputs = new Array();

                        logProc.stdout.on('data', function(out) {
                            console.log('stdout', out.toString())
                            outputs.push(out.toString())
                        })
                        logProc.stderr.on('data', function(out) {
                            console.log('stderr', out.toString())
                            outputs.push(out.toString())
                        })
                        logProc.on('close', function(code) {
                            console.log('close', outputs)
                            outputs.should.matchAny(new RegExp(t('matrix.log.app_not_select')), 'stdout Fail, expecting"' + t('matrix.log.app_not_select') + '"')
                            done()
                        })
                    });
                });
                context(' parameters specified', function() {

                    context(' device and app assigned', function() {

                        context('unknown device and app specified', function() {
                            it.skip('should show commands "log" usage', function(done) {
                                var logProc = run('matrix', ['log', 'XXXXXXX', 'XXXXXXX']);
                                var outputs = new Array();
                                logProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString())
                                })
                                logProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString())
                                })
                                logProc.on('close', function(code) {
                                    console.log('close', outputs)
                                    outputs.should.matchAny(new RegExp(t('matrix.log.app_undefined')), 'stdout Fail, expecting"' + t('matrix.log.app_undefined') + '"')
                                    done()
                                })
                            });
                        });
                        context('log', function() {
                            it.skip('Logs output from selected MatrixOS and applications', function(done) {
                                var logProc = run('matrix', ['log', 'AdBeacon1', 'vehicle']);
                                var outputs = new Array();

                                logProc.stdout.on('data', function(out) {
                                    console.log('stdout', out.toString())
                                    outputs.push(out.toString())
                                })
                                logProc.stderr.on('data', function(out) {
                                    console.log('stderr', out.toString())
                                    outputs.push(out.toString())
                                })
                                logProc.on('close', function(code) {
                                    console.log('close', outputs)
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
