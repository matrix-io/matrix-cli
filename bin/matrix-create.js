#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('create');
var fs = require('fs');
var tar = require('tar');
var prompt = require('prompt');
var yaml = require('js-yaml');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  var app = Matrix.pkgs[0];

  if ( parseInt(app) === app ){
    console.error(t('matrix.create.bad_numbers'))
    process.exit(1);
  }

  function onError(err) {
    Matrix.loader.stop();
    console.error(t('matrix.create.error_creating') + ':', err);
    process.exit(1);
  }

  // to write to disk after prompt
  var configString;

  function onEnd() {

  }

  // check if path already exists, refuse if so
  fs.access(process.cwd() + "/" + app, fs.F_OK, function(err) {
    if (!err) {
      console.error(t('matrix.create.error_creating') + ':', t('matrix.create.folder_exist'));
      process.exit(1);
    } else {
      var nameP = {
        name: 'name',
        description: 'App Name',
        pattern: /^\w+$/,
        message: 'App name must be a single word. Use - for multi word app names',
        required: true
      };

      var descP = {
        name: 'description',
        description: 'Description',
        required: true
      }

      var keyP = {
        name: 'keywords',
        description: 'Keywords',
      }

      prompt.delimiter = '';
      prompt.message = 'Create new application -- ';

      var ps = [ descP, keyP ];

      if (_.isUndefined(app)){
        // nop app mentioned
        ps.unshift(nameP)
      } else {
        prompt.message += ' ( ' + app +' ) ';
      }

      prompt.start();

      prompt.get(ps, function(err, results){
        if (err) console.error(err);

        debug(results);


        if ( _.isUndefined(app)){
          // no app name defined
          app = results.name;
        } else {
          // app name defined
          results.name = app;
        }

        // write the config yaml
        configString = yaml.safeDump(results);


        debug('Writing config...',  configString);
        Matrix.loader.start();
        var extractor = tar.Extract({
          path: process.cwd() + "/" + app,
          strip: 1
        })
          .on('error', onError)
          .on('end', function onFinishedExtract(){

           Matrix.loader.stop();

            fs.writeFileSync(app + '/config.yaml', '\n' + configString, { flag: 'a'});

            console.log(t('matrix.create.new_folder') + ':>'.grey, app.green + '/'.grey);
            console.log('         app.js'.grey, '-', t('matrix.create.description_app'))
            console.log('    config.yaml'.grey, '-', t('matrix.create.description_config'))
            console.log('      README.MD'.grey, '-', t('matrix.create.description_developer'))
            console.log('       index.js'.grey, '-', t('matrix.create.description_index'))
            console.log('   package.json'.grey, '-', t('matrix.create.description_package'))
          });

        fs.createReadStream(__dirname + "/../baseapp.tar")
          .on('error', onError)
          .pipe(extractor);
        // unzip baseApp.zip to named folder
      })
    }
  });

  function displayHelp() {
    console.log('\n> matrix create ¬\n');
    console.log('\t    matrix create <app> -', t('matrix.create.help', { app: '<app>'}).grey)
    console.log('\n')
    process.exit(1);
  }
});
