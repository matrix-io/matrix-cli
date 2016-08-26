#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var firebase = require('matrix-firebase');
var debug = debugLog('install');
var firebaseWorkers = _.has(process.env, 'MATRIX_WORKER'); //Use new firebase flow if MATRIX_WORKER env var is found

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  require('./matrix-validate');
  program
    .parse(process.argv);

  var pkgs = program.args;

  var cmd = pkgs[0];
  //target
  var target = pkgs[1];

  //Defaults to app
  if (pkgs.length === 1) {
    target = cmd;
    cmd = 'app';
  }

  if (cmd.match(/a|ap|app|-a|--app/)) {
    // TODO lookup policy from config file, pass to function


      if (firebaseWorkers) {
        console.log('____ | ' + t('matrix.install.installing') + ' ', target, ' ==> '.yellow, Matrix.config.device.identifier)
        firebase.init(
          Matrix.config.user.id,
          Matrix.config.device.identifier,
          Matrix.config.user.token,
          function (err) {
            debug("Firebase Init");
            if (err) return console.error('Firebase Fail'.red, err);

            firebase.app.search(target, function(result){
              if ( !_.isNull( result )){
                var appId = _.keys(result)[0];
                var versionId = result[appId].meta.latest;

              Matrix.helpers.checkPolicy(result[appId].versions[versionId].policy, target, function (err, policy) {
                console.warn('\n⇒ Installing %s with policy:', target.yellow);
                _.each(policy, function(v, k){
                  console.log('\n', k+':')
                  _.each(v, function(val, key){
                    // passes
                    if ( val ){
                      console.log(' ✅ ' + key.blue );
                    } else {
                      console.log(' ❌ ' + key.grey );
                    }
                  })
                })

                console.log("\ninstalling to device... ")
                firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, appId, versionId, policy, function(err){
                  console.log('Install Complete')
                  process.exit();
                });
              });
            }
          });
        });
      }

  } else if (cmd.match(/s|se|sen|sens|senso|sensor|sensors|-s|--sensors/)) {
    Matrix.api.sensor.install(t, Matrix.config.device.identifier, function (err, resp) {
      if (err) return console.error(err);
      debug(resp);
      console.log(t, ' ' + t('matrix.install.sensor_installed') + '.')
      process.exit();
    })
  }

});
