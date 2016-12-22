#!/usr/bin/env node

require('./matrix-init');
var debug = debugLog('account');
var async = require('async');
var prompt = require('prompt');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {

  Matrix.validate.user();
  Matrix.loader.start();
  var target = Matrix.pkgs[0];

  if (Matrix.pkgs.length > 1) { //If more than one arg, incorrect format
    displayHelp();
  } else {
    Matrix.firebaseInit(function () {
      if (Matrix.pkgs.length === 1 && target === 'profile') { //If asking for profile specifically
        async.waterfall([
          getProfile,
          showProfile,
          promptProfile,
          fromPromptToProfile,
          updateProfile
        ], function (err) {
          if (err) console.log(err);
          else {
            Matrix.loader.stop();
            console.log('Update completed succesfully');
          }
          process.exit();
        });
      } else {
        async.waterfall([
          getProfile,
          showProfile
        ], function(){
          process.exit();
        });
      }
    });
  }

  function showProfile(profile, callback) {
    
    Matrix.loader.stop();
    if (_.isUndefined(profile)) { //If no data
      console.log(t('matrix.account.no_profile'));
      callback();
    } else {  
      console.log('Name: '.yellow, profile.name);
      console.log('URL: '.yellow, profile.url);
      console.log('GitHub: '.yellow, profile.githubUrl);
      console.log('Usage statistics: '.yellow, profile.trackOk ? 'Enabled'.green : 'Disabled'.yellow);
      callback();
    }
  }

  function promptProfile(callback) {
    var nameP = {
      name: 'name',
      description: 'Name',
      required: true
    };

    var urlP = {
      name: 'url',
      pattern: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      message: 'Must provide a valid url',
      description: 'URL (Optional)',
    }

    var repoP = {
      name: 'repo',
      pattern: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      message: 'Must provide a valid url',
      description: 'URL (Optional)',
    }

    var trackP = {
      name: 'track',
      description: 'Do you want to send your usage statistics for future diagnose and improvement? (Y/n)'
    }

    var toPrompt = [
      nameP, urlP, repoP, trackP
    ];

    prompt.delimiter = '';
    prompt.message = 'Developer info -- ';

    prompt.start();
    Matrix.loader.stop();
    prompt.get(toPrompt, function (err, results) {

      if (err) {
        if (err.toString().indexOf('canceled') > 0) {
          console.log('');
          process.exit();
        } else {
          console.log("Error: ", err);
          process.exit();
        }
      }

      console.log(results);
      callback(err, results);

    });
  }

  function inquireProfile(callback) { 
    var err;
    var Rx = require('rx');
    var promptHandler = new Rx.Subject();
    
    Matrix.loader.stop();
    var answers = {};
    require('inquirer').prompt(promptHandler).ui.process.subscribe(function (answer) {    
      answers[answer.name] = answer.answer;
      
      if (answer.name === 'track') {
        promptHandler.onCompleted();
      }

    }, function (e) { console.error(e) }, function () {
      console.log(answers);
      //Matrix.firebase.();
      callback(err, answers);
    });

    //Ask for new version to deploy
    promptHandler.onNext({
      type: 'input',
      name: 'name',
      message: 'Name:'.white,
      required: true/*,
      default: newVersion,
      validate: function (versionInput) {
        if (versionInput.match('^(?:(\\d+)\.)(?:(\\d+)\.)(\\d+)$')) {
          return true;
        } else {
          return versionInput + ' is not a valid version';
        }
      },
      when: function (answers) {
        return !answers.current;
      }*/
    });

    promptHandler.onNext({
      type: 'input',
      name: 'url',
      message: 'URL:'.white
    });

    promptHandler.onNext({
      type: 'input',
      name: 'githubUrl',
      message: 'GitHub URL:'.white,
      required: true
    });

    promptHandler.onNext({
      type: 'confirmation',
      name: 'track',
      message: 'Do you want to send your usage statistics for future diagnose and improvement? '.white,
      required: true,
      default: true
    });
  }

  function fromPromptToProfile(answers, callback) { 
    var err, profile;
    if (answers.hasOwnProperty('name') && answers.hasOwnProperty('url') && answers.hasOwnProperty('repo') && answers.hasOwnProperty('track')) {
      profile = {
        data : {
          name: answers.name,
          url: answers.url,
          githubUrl: answers.repo,
          trackOk: answers.track
        }
      }
    } else {
      err = new Error('Unexpected answer format');
    }
      
    callback(err, profile);
  }
  
  function getProfile(callback) {
    Matrix.firebase.user.get(function (err, userProfile) { 
      callback(err, userProfile);
    });
  }

  function updateProfile(profile, callback) {
    var updateError;
    var events = {
      error: function (err) {
        Matrix.loader.stop();        
        updateError = new Error('Error updating user profile: '.red, err.message);
        callback(updateError);
      },
      finished: function () {
        Matrix.loader.stop();
        console.log('User profile updated successfully');
        callback(updateError);
      },
      start: function () {
        Matrix.loader.stop();
        console.log('User profile update requested...');
        Matrix.loader.start();
      },
      progress: function () {
        Matrix.loader.stop();
        console.log('Updating...');
        Matrix.loader.start();
      }
    };

    console.log('PROFILE: ' , profile);    
    Matrix.firebase.user.update(profile, events);
  }

  function displayHelp() {
    Matrix.loader.stop();
    console.log('\n> matrix account ¬\n');
    console.log('\t    matrix account profile -', t('matrix.help_account_profile').grey)
    console.log('\n')
    process.exit(1);
  }
});
