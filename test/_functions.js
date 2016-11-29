
// fires off the cmd line easily
/**
 * run - run a command and watch the results
 * cmd '' - matrix command to run
 * options.responses [] - nested array of call and responses
 * options.checks [] - make sure all these strings exist in the output
 * options.postCheck f() - ( done, output=['','',...]) run a final check
 */

var run = function(cmd, options, done){
  if ( !_.isFunction(done)){
    throw new Error('Run needs a done()');
  }
  var args = cmd.split(' ');
  var isM = cmd.split(' ').shift();
  if ( isM === 'matrix' ){
    // matrix included, remove
    args.shift();
  }

  if ( _.isString(options.checks) ){
    options.checks = [ options.checks ]
  }
  // console.log(args)
  var proc = require('child_process').spawn('matrix', args);

  var responseCount = 0; //options.responses.length;
  var checkCount = 0; //options.checks.length;

  var respondPrompts = _.map( options.responses, _.first );
  // return first for regex map
  // => /name|password/
  var respondRegex = new RegExp(_.map( options.responses, _.first ).join('|'));

  var targetChecks = ( options.hasOwnProperty('checks')) ? options.checks.length :  0;
  var targetResps = ( options.hasOwnProperty('responses')) ? options.responses.length : 0;

  // global to match multis
  var checkRegex = new RegExp( options.checks.join('|'), 'g' );

  // console.log(respondRegex, checkRegex)
//

  var output = [];
  var finished = false;

  proc.stdout.on('data', function (out) {
    out = out.toString();
    output.push(out.split('\n'))
    // console.log(out)
    // called for each line of out
    var respMatch = out.match( respondRegex );
    if ( options.hasOwnProperty('responses') && !_.isNull( respMatch ) ) {
      var index = respondPrompts.indexOf( respMatch[0] );
      // console.log(respMatch[0], index)
      proc.stdin.write( options.responses[index][1] );
      responseCount += 1;
    }

    if ( options.hasOwnProperty('checks') && !_.isNull( out.match(checkRegex))){
      checkCount += out.match(checkRegex).length;
    }

    if ( !finished && responseCount >= targetResps && checkCount >= targetChecks ){
      finished = true;
      if ( options.hasOwnProperty('postCheck') ){
        options.postCheck(done, output);
      } else {
        done();
      }
    }
  })

  proc.on('close', function(code){
    // console.log( responseCount, checkCount )

  })
}


module.exports = {
  run: run,
  readConfig: function readConfig(){
    return JSON.parse( require('fs').readFileSync(require('os').homedir() + '/.matrix/store.json') );
  },
  login: function(done){
    run('matrix login', {
      responses: [
        ['username', 'testuser@testing.admobilize.com\n'],
        ['password', 'test1234\n']
      ],
      checks: [
        'Login Successful'
      ],
      postCheck: function(done){
        if ( fn.readConfig().user.hasOwnProperty( 'token' ) ){
          done();
        } else {
          done('No Token Saved to Local Config')
        }
      }
    }, done);
  },
  registerDevice: function(done){
    run('matrix register device', {
      responses: [
        ['device name','test-device\n'],
        ['device description', 'test-description\n']
      ],
      checks: [
        'MATRIX_DEVICE_ID',
        'MATRIX_DEVICE_SECRET',
        'matrix use test-device'
      ],
      postCheck: function(done, output){
        output = _.flatten(output);
        var exports = _.filter(output, function(o){
          return (o.indexOf('export') > -1)
        });
        // console.log(exports);
        // make these available
        M.DEVICE_ID = exports[0].split('=')[1].trim();
        M.DEVICE_SECRET = exports[1].split('=')[1].trim();
        done();
      }
    }, done )
  },
  useDevice: function(done){
    run('matrix use ' + M.DEVICE_ID, {
      checks: ['device: test-device'],
      postCheck : function(done){
        var config = fn.readConfig();
        var did = config.device.identifier;
        var name = config.deviceMap[did].name;
        if ( name === 'test-device' ){
          done();
        } else {
          done('Finished, but bad device map')
        }
      }
    }, done);
  },
  logout: function(done){
    run('matrix logout',{
      checks: ['Logged Out Successfully'],
      postCheck: function(done){
        var config = fn.readConfig();
        var uids = _.keys( config.keepDevice );
        if ( _.has(config, 'user')){
          done('User Not Deleted on Logout')
        } else {
          done();
        }
      }
    }, done)
  }
}
