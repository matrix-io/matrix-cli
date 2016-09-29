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
Matrix.config.locale = 'en'; // set default locale
t = Matrix.localization.get; // international translator

Matrix.helpers = require('../lib/helpers');
//sets Matrix.config with local variables
Matrix.config = _.assign(Matrix.config, Matrix.helpers.getConfig());
//set default locale
//Use this to validate for user and display messages accordingly
Matrix.validate = require('./matrix-validate');

// These are used to override if there is no environment set in config
var options = {
  clientId: 'AdMobilizeAPIDev',
  clientSecret: 'AdMobilizeAPIDevSecret',
  apiUrl: process.env[ 'MATRIX_API_SERVER' ] || 'https://rc-api.admobilize.com',
  mxssUrl: process.env[ 'MATRIX_STREAMING_SERVER' ] || 'https://rc-mxss.admobilize.com',
  appsBucket: process.env['MATRIX_APPS_BUCKET'] || 'dev-admobilize-matrix-apps'
};

//override defaults with config
if ( _.has( Matrix.config.environment, 'name' ) ) {
  debug( 'Env: ', Matrix.config.environment.name );
  options.apiUrl = Matrix.config.environment.api;
  options.mxssUrl = Matrix.config.environment.mxss;
  options.appsBucket = Matrix.config.environment.appsBucket;
} else {
  debug('No env set, using rc default');
  Matrix.config.environment = {
    name: process.env.NODE_ENV || 'rc',
    api: options.apiUrl,
    mxss: options.mxssUrl,
    appsBucket: options.appsBucket
  };
}

if ( Matrix.config.environment.name === 'rc' || Matrix.config.environment.name === 'production' ){
  options.clientId = 'AdMobilizeClientID'
  options.clientSecret = 'AdMobilizeClientSecret'
}

// strip out
Matrix.options = options;

Matrix.api.makeUrls( options.apiUrl, options.mxssUrl );

// to make user / device / etc available to sdk
Matrix.api.setConfig( Matrix.config );

//Loader, currently using the default braille spinner
Matrix.loader = require('../lib/loader');
Matrix.loader.type('braille'); //Types: braille, matrix

Matrix.firebase = require('matrix-firebase');
Matrix.firebaseInit = function (cb) {
  var currentDevice = (!_.isEmpty(Matrix.config.device) && !_.isEmpty(Matrix.config.device.identifier)) ? Matrix.config.device.identifier: '';
  Matrix.firebase.init(
    Matrix.config.user.id,
    currentDevice,
    Matrix.config.user.token,
    Matrix.config.environment.name,
    function (err) {
      var errorCode = Matrix.validate.firebaseError(err);
      if (errorCode != 0) {
        if (errorCode == 1) {
          //TODO try to refresh token before failing
          Matrix.loader.stop();
          console.log('Invalid user, log in again'.yellow);
          Matrix.helpers.removeConfig();
        } else if (errorCode == 4) {
          console.log('Network timeout, please check your connection and try again'.yellow);
        } else {
          console.error('Error initializing Firebase: '.yellow, err.red);
        }
        process.exit();
      }
      return cb();
  });
}
