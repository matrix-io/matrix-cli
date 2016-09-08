#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('install');

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
                  console.log('App ' + target.red + ' not found');
                  return process.exit();
                }
                var versionId = result[appId].meta.currentVersion;
                debug('VERSION: '.blue, versionId, 'APP: '.blue, appId);

              Matrix.helpers.checkPolicy(result[appId].versions[versionId].policy, target, function (err, policy) {
                console.warn('\n⇒ Installing %s with policy:', target.yellow);
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


                console.log("\ninstalling to device... ")
                Matrix.firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, appId, versionId, policy, {
                  error: function(err){
                    console.error('Install Error'.red, err);
                    process.exit(1);
                  },
                  finished: function(){
                    console.log('Install Done'.green)
                    process.exit();
                  },
                  start: _.once(function(){
                    console.log('Install Started')
                  }),
                  progress: function(msg){
                    console.log('Install Progress:', msg)
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
    console.log('\t    matrix install app -', t('matrix.install.help_app', {app: '<app>'}).grey)
    console.log('\t    matrix install sensor -', t('matrix.install.help_sensor', {sensor: '<sensor>'}).grey)
    console.log('\n')
    process.exit(1);
  }
});
