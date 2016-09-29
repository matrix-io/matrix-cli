#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('search');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  if (!Matrix.pkgs.length || showTheHelp) {
    return displayHelp();
  }
  
  Matrix.validate.user(); //Make sure the user has logged in
  debug(Matrix.pkgs);
  var needle = Matrix.pkgs[0];

  if (needle.length <= 2) {
    return console.error(t('matrix.search.small_needle') + '.')
  }

  Matrix.startLoader();
  Matrix.firebaseInit(function () {

    Matrix.firebase.app.search(needle, function (data) {
      Matrix.stopLoader();
      if (!_.isNull(data)) {
        debug(data)
        // get rid of non matches
        data = _.filter(data, function (app, appId) {
          return (app.meta.name.indexOf(needle) > -1);
        })

        if (_.isEmpty(data)) {
          console.log(t('matrix.search.no_results').green);
        } else {
          console.log(Matrix.helpers.displaySearch(data, needle));
        }
        process.exit();
      }
    });
    //Get versionId of appId with version X
  }
  );

  function displayHelp() {
    console.log('\n> matrix search ¬\n');
    console.log('\t                 matrix search <app> -', t('matrix.search.help').grey)
    console.log('\n')
    process.exit(1);
  }
});