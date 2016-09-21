#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('install');
var installTimeoutSeconds = 30; //seconds to get a install response from device
var installTimer;

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }

  var cmd = Matrix.pkgs[0];
  var target = Matrix.pkgs[1];

  //Defaults to app
  if (Matrix.pkgs.length === 1) {
    target = cmd;
    cmd = 'app';
  }

  if (cmd.match(/a|ap|app|-a|--app/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.validate.device(); //Make sure the user has logged in
    // TODO lookup policy from config file, pass to function


        console.log('____ | ' + t('matrix.install.installing') + ' ', target, ' ==> '.yellow, Matrix.config.device.identifier)
        Matrix.firebaseInit(function () {
            Matrix.firebase.app.search(target, function(result){
              if ( !_.isNull( result )){
                debug(result)

                var appId = _.findKey( result, function (app, appId) {
                  if(app.meta.name == target || (app.meta.hasOwnProperty("shortName") && app.meta.shortName == target)){
                    return 1;
                  }
                });

                if(_.isUndefined(appId)){
                  console.log(t('matrix.install.app_x_not_found', {app: target.yellow}));
                  return process.exit();
                }
                var versionId = result[appId].meta.currentVersion;
                debug('VERSION: '.blue, versionId, 'APP: '.blue, appId);

              Matrix.helpers.checkPolicy(result[appId].versions[versionId].policy, target, function (err, policy) {
                console.warn('\n⇒ ' + t('matrix.install.installing_x_with_policy', {app: target.yellow}) + ':');
                debug(policy);
                _.each(policy, function(v, k){
                  console.log('\n', k+':')
                  _.each(v, function(val, key){
                    // passes
                    if ( val ){
                      console.log(' ✅  ' + key.blue );
                    } else {
                      console.log(' ❌  ' + key.grey );
                    }
                  })
                });

                Matrix.firebase.user.watchForNewApps(Matrix.config.device.identifier, function (app) {
                  debug('new app>', app)
                  var installedAppId = _.keys(app)[0];
                  Matrix.firebase.app.watchStatus( installedAppId, function( status ){
                    debug('status>', installedAppId, status)
                    clearTimeout(installTimer); //Remove timeout timer
                    if ( status === 'error' ){
                      console.error(t('matrix.install.app_install_error'), ' ', app);
                      process.exit(1);
                    } else if (
                      status === 'inactive'
                    ) {
                      console.log(t('matrix.install.app_install_success').green);
                      process.exit(0);
                    } else {
                      console.log(t('matrix.install.invalid_app_status'), status);
                      process.exit(1);
                    }
                  })
                });
                
                debug("\nInstalling to device... ")
                
                var progress;
                Matrix.firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, appId, versionId, policy, {
                  error: function(err){
                    if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
                      console.error('\n' + t('matrix.install.app_install_error').red + ': ', err.details.error);
                    } else {
                      console.error('\n' + t('matrix.install.app_install_error').red + ': ', err);
                    }
                    process.exit(1);
                  },
                  finished: function(){
                    console.log('\n' + t('matrix.install.waiting_for_device_install').green + '...'.green);
                    installTimer = setTimeout(function() {
                      console.log(t('matrix.install.device_install_timeout').yellow);
                      process.exit(1);
                    }, installTimeoutSeconds * 1000);                    
                  },
                  start: _.once(function(){
                    console.log(t('matrix.install.start') + '...')
                  }),
                  progress: function (msg) {
                    if (_.isUndefined(msg)) msg = ''; else msg = ' ' + msg + ' ';
                    if (!progress) {
                      progress = true;
                      process.stdout.write(t('matrix.install.progress') + ':' + msg); 
                    } else {                      
                      process.stdout.write('.'+msg);
                    }
                  }
                });
              });
            }
          });
        });

  } else if (cmd.match(/s|se|sen|sens|senso|sensor|sensors|-s|--sensors/)) {
    Matrix.validate.user(); //Make sure the user has logged in
    Matrix.validate.device(); //Make sure the user has logged in
    Matrix.api.sensor.install(t, Matrix.config.device.identifier, function (err, resp) {
      if (err) return console.error(err);
      debug(resp);
      console.log(t, ' ' + t('matrix.install.sensor_installed') + '.')
      process.exit();
    })
  }

  function displayHelp() {
    console.log('\n> matrix install ¬\n');
    console.log('\t    matrix install app <app> -', t('matrix.install.help_app', {app: '<app>'}).grey)
    console.log('\t    matrix install sensor <sensor> -', t('matrix.install.help_sensor', {sensor: '<sensor>'}).grey)
    console.log('\n')
    process.exit(1);
  }
});
