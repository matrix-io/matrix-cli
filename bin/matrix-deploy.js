#!/usr/bin/env node

require('./matrix-init');
var program = require('commander');

var JSHINT = require('jshint').JSHINT;
var fs = require('fs');
var tar = require('tar');
var fstream = require('fstream');

program
  .parse(process.argv);

var pkgs = program.args;

var appName = pkgs[0];

var pwd = process.cwd();
var detectFile = 'config.json';

//TODO: make sure package.json is included
if (_.isUndefined(appName)) {
  // infer name from current directory
  appName = require('path').basename(pwd);
} else {
  pwd += '/' + appName + '/';
}

var tmp = __dirname + '/../' + appName + '.zip';

//TODO: IMPORTANT Make sure config file exists
if (!fs.existsSync(pwd + detectFile)) {
  return console.error('No ', detectFile, ' found. Are you sure an AdMatrix app resides in ', pwd, '?');
}

//See of any files are a directory. #113583355 Add other checks here sometime?
var files = fs.readdirSync(pwd);
_.each(files, function(f) {
  var s = fs.statSync(pwd + f);
  if (s.isDirectory()) {
    return console.error(f, ' <-- Our fault. Directories can not be deployed yet');
  } else {
    debug('zipping up %s!', f);
  }
})


var appFile = fs.readFileSync(pwd + 'app.js').toString();
var configFile = fs.readFileSync(pwd + detectFile).toString();
var configObject = {};

// run JSHINT on the application
JSHINT(appFile);

if (JSHINT.errors.length > 0) {
  console.log('Cancel deploy due to errors & warnings'.red)
  _.each(JSHINT.errors, function(e) {
    if (_.isNull(e)) {
      return;
    }
    var a = [];
    if (e.hasOwnProperty('evidence')) {
      a[e.character - 1] = '^';
      // regular error
    }
    e.evidence = e.evidence || '';
    console.log('\n' + '(error)'.red, e.raw, '[app.js]', e.line + ':' + e.character, '\n' + e.evidence.grey, '\n' + a.join(' ').grey);
  })
  return;
}

console.log('Reading ', pwd);
console.log('Writing ', tmp);

var destinationZip = fs.createWriteStream(tmp);

destinationZip.on('open', function() {
  debug('deploy zip start')
})

destinationZip.on('error', function(err) {
  debug('deploy zip err', err)
})

destinationZip.on('finish', function() {
  debug('deploy zip finish');
  onEnd();
})

// zip up the files in the app directory
var archiver = require('archiver');
var zip = archiver.create('zip', {});

// zip.bulk([{
//   expand: true,
//   cwd: pwd
// }, ]);


var files = fs.readdirSync(pwd);

_.each(files, function(file) {
  debug('Adding to zip', file)
  zip.append(fs.createReadStream(pwd + file), {
    name: file
  });
});

// zip.on('end', onEnd);
zip.on('error', onError);
zip.finalize();

// send zip to the file
zip.pipe(destinationZip);

function onError(err) {
  console.error('An error occurred:', err)
}

function onEnd() {
  console.log('Packed!');
  Matrix.api.app.deploy({
    appConfig: configObject,
    file: tmp,
    name: appName
  }, function(err, resp) {
    if (err) return console.error('Deploy Error:'.red, err);
    console.log('Deploy Started'.yellow);
    resp.setEncoding();

    var data = '';
    resp.on('error', function(e) {
      console.error('Deploy Stream Error'.red, e)
    })
    resp.on('data', function(d) {
      data += d;
    });
    resp.on('end', function() {
      console.log('Deploy Complete'.green);
      debug(data);

      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Bad Deployment Info Payload', e);
      }

      var deployInfo = data.results;
      deployInfo.name = appName;


      Matrix.api.app.assign( appName, function (err, resp) {
        if (err) return console.error(err);
        debug('App Assigned to', Matrix.config.device.identifier );
      });

      // Tell device to download app
      Matrix.api.app.install(deployInfo, Matrix.config.device.identifier, function(err, resp) {
        if (err) {
          return console.error('App Install Fail'.red, err);
        }

        // remove zip file
        fs.unlinkSync(tmp);

        console.log('App Installed'.green, appName, '--->', Matrix.config.device.identifier);
        endIt();
      })
    })
  })
}


function endIt() {
  setTimeout(function() {
    process.nextTick(function() {
      process.exit(0);
    })
  }, 1000)
}
