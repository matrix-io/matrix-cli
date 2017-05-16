#!/usr/bin/env node

require('./matrix-init');
var prompt = require('prompt');
var debug = debugLog('login');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  if (!_.isEmpty(Matrix.config.user)) {
    if (Matrix.validate.token() === false) {
      console.log("The token has expired. Last session started :".yellow, ' ', Matrix.config.user.username);
    } else {
      console.log(t('matrix.already_login').yellow + ' ' + Matrix.config.user.username);
    }
  }
  var Rx = require('rx');
  var prompts = new Rx.Subject();
  var user = {};

  var track = false;

  require('inquirer').prompt(prompts).ui.process.subscribe(function(ans) {
    if (ans.name === 'username') {
      user.username = ans.answer;
      track = _.isUndefined(Matrix.config.trackOk[user.username]);
    }
    else if (ans.name === 'password') user.password = ans.answer;
    else if (ans.name === 'track') user.trackOk = ans.answer;

    if (!track && !_.isUndefined(user.password)){
      Matrix.loader.start();
      Matrix.helpers.login(user, function(err) {
        Matrix.loader.stop();
        prompts.onCompleted();
        process.exit();
      });
    } else if (track && !_.isUndefined(user.trackOk)){
      Matrix.loader.start();
      Matrix.helpers.login(user, function(err) {
        Matrix.loader.stop();
        prompts.onCompleted();
        process.exit();
      });
    }
  });

  prompts.onNext({
    name: 'username',
    message: 'Login --'
  });
  prompts.onNext({
    name: 'password',
    type: 'password',
    message: 'Password --'
  });

  var oldTrack = false;
  prompts.onNext({
    name: 'track',
    default: 'y',
    validade: function(answer) {
      var pattern = new RegExp(/y|n|yes|no|Y|N/);
      if (!_.isNull(pattern.exec(answer))) return true;
      return "Please answer y or n.";
      },
    message: "Share usage information? (Y/n)",
    when: function() {
      return track;
      }
    });
});
