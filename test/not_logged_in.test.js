require('../bin/matrix-init')
var run = require('child_process').spawn;
var exec = require('child_process').exec;
var colors = require('colors');
var should = require('should');
var sinon = require('sinon');
var Table = require('cli-table');

describe('Matrix CLI Commands', function () {
  before(function (done) {
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () { })
    done();
  })
  context('Not logged in{', function (done) {
    before(function (done) {
      exec('matrix logout')
      done();
    })
    context('matrix', function () {//pasa 
      it('should show a log in warning', function (done) {
        var notloggedProc = run('matrix');
        var outputs = new Array();
        this.timeout(15000)
        notloggedProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        notloggedProc.stderr.on('data', function (out) {
          //console.log('stderr', out.toString());
        })
        notloggedProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.no_user_message')), 'stdout Fail, expecting "' + t('matrix.no_user_message') + '"')
          done();
        });

      }) //finish matrix
    });

    context('login', function () {//pasa
      it('should request user credentials...', function (done) {
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

    context('logout', function () {// pasa
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
    }); // Finish  Logout


    context('use ', function () { //pasa
      it('should show a in warning', function (done) {
        var useProc = run('matrix', ['use']);
        var outputs = new Array();
        this.timeout(15000)
        useProc.stdout.on('data', function (out) {
          outputs.push(out.toString());

        });
        useProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });

        useProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.use.command_help')), 'stdout Fail, expecting "' + t('matrix.use.command_help') + '"')
          done();
        });
      });
    }); // Finish use

    context('sim', function () {//pasa
      it('should show a log in warning', function (done) {
        var simProc = run('matrix', ['sim']);
        var outputs = new Array();
        this.timeout(15000)
        simProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        simProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });

        simProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.sim.help_upgrade')), 'stdout Fail, expecting "' + t('matrix.sim.help_upgrade') + '"')
          done();
        });
      });
    }); // Finish sim

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
    }); // Finish 

    context('set', function () {//pasa
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
    }); // Finish set
    context('reboot', function () {//pasa
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
    }); // Finish reboot
    context('install', function () {//pasa
      it('should show a log in warning', function (done) {
        var installProc = run('matrix', ['install']);
        var outputs = new Array();
        this.timeout(15000)
        installProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        installProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        installProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.install.help_app', { app: '<app>' })), 'stdout Fail, expecting "' + t('matrix.install.help_app', { app: '<app>' }) + '"')
          done();
        });

      });
    }); //Finish install
    context('config', function () { //pasa
      it('should show a log in warning', function (done) {
        var configProc = run('matrix', ['config']);
        var outputs = new Array();
        this.timeout(15000)
        configProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        configProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        configProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });
      });
    }); //Finish config
    context('uninstall', function () {//pasa 
      it('should show a log in warning', function (done) {
        var uninstallProc = run('matrix', ['uninstall']);
        var outputs = new Array();
        this.timeout(15000)
        uninstallProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        uninstallProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        uninstallProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });

      });
    }); //Finish uninstall  
    context('update', function () { //pasa
      it('should show a log in warning', function (done) {
        var updateProc = run('matrix', ['update']);
        var outputs = new Array();
        this.timeout(15000)
        updateProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        updateProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        updateProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.update.help_update')), 'stdout Fail, expecting "' + t('matrix.update.help_update') + '"')
          done();
        });
      });
    }); //Finish update
    context('start', function () {//pasa
      it('should show a log in warning', function (done) {
        var startProc = run('matrix', ['start']);
        var outputs = new Array();
        this.timeout(15000)
        startProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        startProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        startProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });
      });
    }); //Finish start
    context('stop', function () {//pasa
      it('should show a log in warning', function (done) {
        var stopProc = run('matrix', ['stop']);
        var outputs = new Array();
        this.timeout(15000)
        stopProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        stopProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        stopProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });


      });
    }); //Finish stop

    context('restart', function () { //pasa
      it('should show a log in warning', function (done) {
        var restartProc = run('matrix', ['restart']);
        var outputs = new Array();
        this.timeout(15000)
        restartProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        restartProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        restartProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });


      });
    }); //Finish restart 

    context('create', function () {//pasa
      it('should show a log in warning', function (done) {
        var createProc = run('matrix', ['create']);
        var outputs = new Array();
        this.timeout(15000)
        createProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        createProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        createProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.create.help', { app: '<app>' })), 'stdout Fail, expecting "' + t('matrix.create.help', { app: '<app>' }) + '"')
          done();
        });
      });
    }); //Finish create
    context('deploy', function () {//pasa
      it('should show a log in warning', function (done) {
        var deployProc = run('matrix', ['deploy']);
        var outputs = new Array();
        this.timeout(15000)
        deployProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        deployProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        deployProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.deploy.help', { app: '<app>' })), 'stdout Fail, expecting "' + t('matrix.deploy.help', { app: '<app>' }) + '"')
          done();
        });

      });
    }); //Finish deploy 

    context('trigger', function () {//pending
      it.skip('should show a log in warning', function (done) {
        var triggerProc = run('matrix', ['trigger']);
        var outputs = new Array();
        triggerProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        triggerProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        triggerProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });

      });
    }); //Finish trigger 

    context('log }', function () {
      it('should show a log in warning Log', function (done) {
        var logProc = run('matrix', ['log']);
        var outputs = new Array();
        this.timeout(15000)
        logProc.stdout.on('data', function (out) {
          outputs.push(out.toString());
        });
        logProc.stderr.on('data', function (out) {
          outputs.push(out.toString());
        });
        logProc.on('close', function (code) {
          outputs.should.matchAny(new RegExp(t('matrix.please_login')), 'stdout Fail, expecting "' + t('matrix.please_login') + '"')
          done();
        });
      });
    }); //Finish log
  }) // FINISH CONTEXT Not logged in
});
function readConfig() {
  return JSON.parse(require('fs').readFileSync('./store.json'));
}