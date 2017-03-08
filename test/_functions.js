// fires off the cmd line easily
/**
 * run - run a command and watch the results
 * cmd '' - matrix command to run
 * options.responses [] - nested array of call and responses
 * options.checks [] - make sure all these strings exist in the output
 * options.postCheck f() - ( done, output=['','',...]) run a final check
 */

var showLogs = false;

var run = function(cmd, options, done) {
  if (!_.isFunction(done)) {
    throw new Error('Run needs a done()');
  }
  var args = cmd.split(' ');
  var isM = cmd.split(' ').shift();
  if (isM === 'matrix') {
    // matrix included, remove
    args.shift();
  }

  if (_.isString(options.checks)) {
    options.checks = [options.checks]
  }
  // console.log(args)
  var proc = require('child_process').spawn('matrix', args);

  var responseCount = 0; //options.responses.length;
  var checkCount = 0; //options.checks.length;

  var respondPrompts = _.map(options.responses, _.first);
  // return first for regex map
  // => /name|password/
  var respondRegex = new RegExp(_.map(options.responses, _.first).join('|'));

  var targetChecks = (options.hasOwnProperty('checks')) ? options.checks.length : 0;
  var targetResps = (options.hasOwnProperty('responses')) ? options.responses.length : 0;

  // global to match multis
  var checkRegex = new RegExp(options.checks.join('|'), 'g');

  // console.log(respondRegex, checkRegex)
  //

  var output = [];
  var finished = false;

  // TODO: Debug uses stderr
  proc.stdout.on('data', function(out) {
    out = out.toString();
    output.push(out.split('\n'))
    if (process.env.hasOwnProperty('DEBUG')) {
      console.log(out)
    }
    // called for each line of out
    var respMatch = out.match(respondRegex);
    console.log(responseCount, '<', targetResps);
    if (responseCount < targetResps && options.hasOwnProperty('responses') && !_.isNull(respMatch)) {
      var index = respondPrompts.indexOf(respMatch[0]);
      console.log(respMatch[0], index, options.responses[index][1])
      proc.stdin.write(options.responses[index][1]);
      responseCount += 1;
    }

    if (options.hasOwnProperty('checks') && !_.isNull(out.match(checkRegex))) {
      checkCount += out.match(checkRegex).length;
    }

    console.log(responseCount, checkCount)
    if (!finished && responseCount >= targetResps && checkCount >= targetChecks) {
      finished = true;

      if (options.hasOwnProperty('postCheck')) {
        // make sure command has time to finish
        setTimeout(function() {
          console.log('>>>Function POSTCHECK')
          options.postCheck(done, output);
        }, 100)
      } else {
        done();
      }
    }
  })

  proc.on('close', function(code) {
    console.log('finished'.green, cmd, code)
  })
}


module.exports = {
  showLogs: showLogs,
  run: run,
  readConfig: function readConfig() {
    return JSON.parse(require('fs').readFileSync(require('os').homedir() + '/.matrix/store.json'));
  },
  login: function(done) {
    run('matrix login', {
      responses: [
        ['username', 'testuser@testing.admobilize.com\n'],
        ['password', 'test1234\n'],
        ['Share usage information', 'n\n']
      ],
      checks: [
        'Login Successful'
      ],
      postCheck: function(done) {
        if (fn.readConfig().user.hasOwnProperty('token')) {
          done();
        } else {
          done('No Token Saved to Local Config')
        }
      }
    }, done);
  },
  registerDevice: function(done) {
    run('matrix register device', {
      responses: [
        ['device name', 'test-device\n'],
        ['device description', 'test-description\n']
      ],
      checks: [
        'MATRIX_DEVICE_ID',
        'MATRIX_DEVICE_SECRET',
        'matrix use test-device'
      ],
      postCheck: function(done, output) {
        output = _.flatten(output);
        var exports = _.filter(output, function(o) {
          return (o.indexOf('export') > -1)
        });
        // console.log(exports);
        // make these available
        M.DEVICE_ID = exports[0].split('=')[1].trim();
        M.DEVICE_SECRET = exports[1].split('=')[1].trim();
        done();
      }
    }, done)
  },
  useDevice: function(done) {
    // if we haven't done the whole test, get deviceid from the config
    if (!M.hasOwnProperty('DEVICE_ID')) {
      console.log('No new device made. Using first entry from deviceMap')
      var c = fn.readConfig();

      M.DEVICE_ID = (c.device.hasOwnProperty('identifier')) ?
        c.device.identifier :
        Object.keys(c.deviceMap)[0];
    }

    console.log('Use Device', M.DEVICE_ID);

    run('matrix use ' + M.DEVICE_ID, {
      checks: ['test-device'],
      postCheck: function(done) {
        var config = fn.readConfig();
        if (!config.hasOwnProperty('device')) {
          console.log(config);
          console.log(require('os').homedir() + '/.matrix/store.json')
          return done(new Error('No Config File Found'));
        }
        var did = config.device.identifier;
        var name = config.deviceMap[did].name;
        if (name === 'test-device') {
          done();
        } else {
          done('Finished, but bad device map')
        }
      }
    }, done);
  },
  logout: function(done) {
    run('matrix logout', {
      checks: ['Logged Out Successfully'],
      postCheck: function(done) {
        var config = fn.readConfig();
        var uids = _.keys(config.keepDevice);
        if (_.has(config, 'user')) {
          done('User Not Deleted on Logout')
        } else {
          done();
        }
      }
    }, done)
  }
}