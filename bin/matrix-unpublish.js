#!/usr/bin/env node

var async = require('async');
var unpublicationFinished = false;
var debug;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('unpublish');
    fileUrl = 'https://storage.googlapis.com/' + Matrix.config.environment.appsBucket + '/apps';
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  Matrix.validate.userAsync,
  function (cb) {
    Matrix.firebaseInit(cb);
  }
], function (err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error: ', err.message);
    return process.exit(1);
  }

  if (!Matrix.pkgs.length || showTheHelp) return displayHelp();
  var target = Matrix.pkgs[0];

  console.log('____ | ' + t('matrix.unpublish.unpublishing'));
  Matrix.loader.start();

  //get app id
  Matrix.firebase.app.search(target, function(err, data) {
    Matrix.loader.stop();
    if (err) {
      console.log('Error: '.red, err.message);
      process.exit();
    }
    if (!data) {
      console.log('\nApp not found... ');
      process.exit(1);
    } else if (data.acl.ownerId === Matrix.config.user.id){
      console.log('\nApp found... ');

      var progress;
      Matrix.loader.start();

      Matrix.helpers.trackEvent('app-unpublish', { aid: target, did: Matrix.config.device.identifier });

      Matrix.firebase.app.unpublish(Matrix.config.user.token, Matrix.config.user.id, data.id, {
        error: function (err) {
          Matrix.loader.stop();
          if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
            console.error('\nUnpublish Error'.red, err.details.error);
          } else {
            console.error('\nUnpublish Error'.red, err);
          }
          process.exit(1);
        },
        finished: function() {
          Matrix.loader.stop();
          console.log('Unpublishing app...'.green);
          process.exit(0);
        },
        start: _.once(function() {
          Matrix.loader.stop();
          console.log('Unpublish request created');
          Matrix.loader.start();
        }),
        progress: function(msg) {
          if (_.isUndefined(msg)) msg = '';
          else msg = ' ' + msg + ' ';
          if (!progress) {
            progress = true;
            Matrix.loader.stop();
            process.stdout.write('Unpublish progress:' + msg);
          } else {
            process.stdout.write('.' + msg);
          }
        }
      });
    } else {
      console.log('\n This app does not belongs to this user. Please try to unpublish logged at the right user!'.red);
      process.exit(1);
    }


  });

  function displayHelp() {
    console.log('\n> matrix unpublish ¬\n');
    console.log('\t    matrix unpublish <app> -', t('matrix.unpublish.help_app', { app: '<app>' }).grey);
    console.log('\n');
    process.exit(1);
  }
});
