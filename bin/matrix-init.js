require( 'colors' );

debugLog = require( 'debug' );
var debug = debugLog( 'cli' );

showTheHelp = ( process.argv.indexOf('--help') > -1 );

Matrix = {};
Matrix.version = require( '../package.json' ).version;
Matrix.config = require( '../config/index' );
Matrix.api = require( 'matrix-node-sdk' );
_ = require( 'lodash' );

Matrix.helpers = require('../lib/helpers');
Matrix.localization = require('../lib/localization');
Matrix.locale = 'en';
Matrix.localesFolder = __dirname + '/../config/locales';

//sets Matrix.config with local variables
Matrix.config = Matrix.helpers.getConfig();

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
  debug('No env set')
}

Matrix.options = options;

Matrix.api.makeUrls( options.apiUrl, options.mxssUrl );

// to make user / device / etc available to sdk
Matrix.api.setConfig( Matrix.config );

// debug(Matrix.config);
