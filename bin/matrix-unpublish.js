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

  console.log('____ | ' + 'Searching for app');
  Matrix.loader.start();

  //get app id
  Matrix.firebase.app.search(target, function(data) {

    Matrix.loader.stop();
    if (_.isEmpty(data)){
      console.log('\n App not found!');
      process.exit(1);
    } else {
      console.log(data);
      if (data.acl.ownerId !== Matrix.config.user.id) {
        console.log('\n This app does not belongs to this user!'.red);
        process.exit(1);
      } else {
        console.log('\nApp found... ');

        var progress;
        Matrix.loader.start();

        Matrix.helpers.trackEvent('app-unpublish', { aid: target, did: Matrix.config.device.identifier });

        console.log('____ | ' + t('matrix.unpublish.unpublishing'));
        Matrix.firebase.app.unpublish(Matrix.config.user.token, Matrix.config.user.id, data.id, {
          error: function (err) {
            Matrix.loader.stop();
            if (err && err.hasOwnProperty('details') && err.details.hasOwnProperty('error')) {
              console.error('\n Unpublish Error'.red, err.details.error);
            } else {
              console.error('\n Unpublish Error'.red, err);
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
      }
    }
  });

  function displayHelp() {
    console.log('\n> matrix unpublish ¬\n');
    console.log('\t    matrix unpublish <app> -', t('matrix.unpublish.help', { app: '<app>' }).grey);
    console.log('\n');
    process.exit(1);
  }
});
