#!/usr/bin/env node

var async = require('async');
var debug;

async.series([
  require('./matrix-init'),
  function (cb) {
    Matrix.loader.start();
    debug = debugLog('search');
    Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, cb);
  },
  function (next) {
    if (!Matrix.pkgs.length || showTheHelp) { 
      Matrix.loader.stop();
      console.log('\n> matrix search ¬\n');
      console.log('\t                 matrix search <app> -', t('matrix.search.help').grey)
      console.log('\n')
      process.exit(1);
    }
    next();
  },
  Matrix.validate.userAsync,
  function(cb) {
    Matrix.firebaseInit(cb)
  }
], function(err) {
  if (err) {
    Matrix.loader.stop();
    console.error(err.message.red);
    debug('Error:', err.message);
    return process.exit(1);
  }

  debug(Matrix.pkgs);

  var needle = Matrix.pkgs[0];
  if (needle.length <= 2) return console.error(t('matrix.search.small_needle') + '.')

  Matrix.helpers.trackEvent('app-search', { aid: needle });

  Matrix.firebase.app.search(needle, function(data) {
    Matrix.loader.stop();
    if (!_.isNull(data) && !_.isUndefined(data)) {
      debug(data);

      if (!_.isArray(data)) {
        data = [data];
      }

      if (_.isEmpty(data)) {
        console.log(t('matrix.search.no_results').green);
      } else {
        console.log(Matrix.helpers.displaySearch(data, needle));
      }
      process.exit();
    } else {
      console.log(t('matrix.search.no_results').green);
    }
    //Get versionId of appId with version X
  });

});