#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');
var firebase = require('matrix-firebase');
var debug = debugLog('install');

Matrix.localization.init(Matrix.localesFolder, Matrix.config.locale, function () {
  
  require('./matrix-validate');
  program
    .parse(process.argv);

  var pkgs = program.args;

  var cmd = pkgs[0];
  //target
  var target = pkgs[1];

  
  function handleResponse(err, app) {
    if (err) return console.error(err);
    console.log(require('util').inspect(app, { depth: 3, colors: true }));
  }  
  var policy = {test: "testVals"}  
//install: function (token, deviceId, appId, policy, cb) {  
  firebase.init(
    Matrix.config.user.id,
    Matrix.config.device.identifier,
    Matrix.config.user.token,
    function (err) {
      console.log("Initted Firebase");
      if (err) return console.error(err);

      //firebase.device.get(handleResponse);
      //firebase.app.get("clock", handleResponse);
      //firebase.app.install(Matrix.config.user.token, "myDeviceId", "myAppId", policy, handleResponse);
      //firebase.app.onChange("clock", handleResponse) //watch?
      //firebase.app.set(target, value);

      //Defaults to app
      if (pkgs.length === 1) {
        target = cmd;
        cmd = 'app';
      }

      if (cmd.match(/a|ap|app|-a|--app/)) {
        console.log('____ | ' + t('matrix.install.installing') + ' ', target, ' ==> '.yellow, Matrix.config.device.identifier)
      
        checkPolicy({}, function (err, policy) {

          console.warn('Policy>', policy, 'rest of flow unfinished');

          firebase.app.install(Matrix.config.user.token, Matrix.config.device.identifier, "myAppId", policy, handleResponse);

          //TODO: make the rest of this work
          return;
          Matrix.api.app.install(target, Matrix.config.device.identifier, function (err, resp) {
            if (err) return console.error(err);
            console.log(t('matrix.install.app_installed').yellow, target);
            debug(resp);

            //manage api records
            Matrix.api.app.assign(target, function (err, resp) {
              if (err) return console.error(err);
              debug('App Assigned to', Matrix.config.device.identifier);
              process.exit();
            });

            //TODO: Pull sensors / integrations. Ask permissions. Write Policy
          });

        });

      } else if (cmd.match(/s|se|sen|sens|senso|sensor|sensors|-s|--sensors/)) {
        Matrix.api.sensor.install(target, Matrix.config.device.identifier, function (err, resp) {
          if (err) return console.error(err);
          debug(resp);
          console.log(target, ' ' + t('matrix.install.sensor_installed') + '.')
          process.exit();
        })
      }

      // if (!_.isUndefined(o) && o.sensors === true) {
      //   //sensor install
      //   console.warn('sensor not implemented yet');
      // } else {
      //   // application install
      //   // TODO: ensure if file is not found, we're hitting api directory
      //   // console.log('Installing app', name)
      // }

      function checkPolicy(config, cb) {

        var Rx = require('rx')
        var defaultTruth;

        var write = {};

        // replace with config
        var s = {
          'sensors': ['camera', 'mic', 'temperature', 'humidity'],
          'integrations': ['nest', 'hue', 'august'],
          'services': ['face', 'thumb_up'],
          'events': ['ok-detected']
        };

        _.each(s, function (items, title) {
          write[title] = {};
          console.log(title.grey, ':', items.join(' '))
          _.each(items, function (item) {
            write[title][item] = false;
          })
        })
        console.log('==== ^^^^ GRANT ACCESS ???? ^^^^ ===='.blue)


        // need to inject results of answers into questions for decision trees
        var prompts = new Rx.Subject();

        require('inquirer').prompt(prompts).ui.process.subscribe(function (ans) {
          if (ans.name === 'default') {
            console.log("DEFAULT!");
            //setup default
            defaultTruth = ans.answer;
            stepThroughConfig();
          }
          console.log("Answer: ", ans);
          if (!_.isNull(ans.name.match(/sensors|integrations|events|services/)) && _.isArray(ans.answer)) {
            console.log("ARRAY!");
            //namespace object
            _.each(ans.answer, function (answer) {
              write[ans.name][answer] = true;
            })
          }
        }, function (e) { console.error(e) }, function () {
          console.log("REFORMATTING");
          // TODO: Reformat object from [ 'foo','bar'] to { foo: true, bar: true, baz: false }
          cb(null, write);
        });


        function stepThroughConfig() {
        
          _.forIn(s, function (v, k) {

            var baseQ = {
              type: 'checkbox',
              name: k,
              message: 'Grant access to '.white + k.grey + '?'.white,
              choices: [],
              // {
              //   key: 'p',
              //   name: 'Pepperoni and cheese',
              //   value: 'PepperoniCheese'
              // },

            };
            //add choices
            _.each(v, function (jot) {
              baseQ.choices.push({
                key: jot.toLowerCase(),
                name: jot,
                checked: defaultTruth
              })
            })

            // add this question to queue
            prompts.onNext(baseQ);
          });

          prompts.onCompleted();
        }





        prompts.onNext(
          {
            type: 'confirm',
            name: 'quick',
            message: 'OK to allow '.white + target.yellow + ' access to the above? Y/n'.white,
            default: true
          }
        );
        prompts.onNext(
          {
            type: 'confirm',
            name: 'default',
            message: 'Default Permission Setting? Y/n'.white,
            default: true,
            when: function (answers) {
              return answers.quick === false
            }
          }
        );
        // prompts.onCompleted(function (ans) {console.log(ans)});

      }

    }
  );

  
});