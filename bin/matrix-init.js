require( 'colors' );

debugLog = require( 'debug' );
var debug = debugLog( 'cli' );

showTheHelp = ( process.argv.indexOf('--help') > -1 );

Matrix = {};
Matrix.version = require( '../package.json' ).version;
Matrix.config = require( '../config/index' );
Matrix.api = require( 'matrix-node-sdk' );
_ = require( 'lodash' );

var program = require('commander');
program.parse(process.argv);
Matrix.pkgs = program.args;

Matrix.localization = require('../lib/localization');
Matrix.localesFolder = __dirname + '/../config/locales';
// international translator
t = Matrix.localization.get;

Matrix.helpers = require('../lib/helpers');
//sets Matrix.config with local variables
Matrix.config = Matrix.helpers.getConfig();
//Use this to validate for user and display messages accordingly
Matrix.validate = require('./matrix-validate');

var options = {
  clientId: 'AdMobilizeAPIDev',
  clientSecret: 'AdMobilizeAPIDevSecret',
  apiUrl: process.env[ 'MATRIX_API_SERVER' ] || 'http://dev-demo.admobilize.com',
  mxssUrl: process.env[ 'MATRIX_STREAMING_SERVER' ] || 'http://dev-mxss.admobilize.com:80',
};


//override defaults with config
if ( _.has( Matrix.config.environment, 'name' ) ) {
  debug( 'Env: ', Matrix.config.environment.name );
  options.apiUrl = Matrix.config.environment.api;
  options.mxssUrl = Matrix.config.environment.mxss;
} else {
  debug('No env set, using default');
  Matrix.config.environment = {
    api: options.apiUrl,
    mxss: options.mxssUrl
  };
}

Matrix.options = options;

Matrix.api.makeUrls( options.apiUrl, options.mxssUrl );

// to make user / device / etc available to sdk
Matrix.api.setConfig( Matrix.config );

// debug(Matrix.config);

Matrix.firebase = require('matrix-firebase');
Matrix.firebaseInit = function (cb) {
  var currentDevice = (!_.isEmpty(Matrix.config.device) && !_.isEmpty(Matrix.config.device.identifier)) ? Matrix.config.device.identifier: '';  
  Matrix.firebase.init(
    Matrix.config.user.id,
    currentDevice,
    Matrix.config.user.token,
    function (err) {
      var errorCode = Matrix.validate.firebaseError(err);
      if (errorCode != 0) {
        console.error('Error initializing Firebase: ', err);
        process.exit();
      }
      return cb();
  });
}
