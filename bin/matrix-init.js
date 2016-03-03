
require('colors');

debugLog          = require('debug');
Matrix 						= {};
Matrix.version 		= require('../package.json').version;
Matrix.config     = require('../config/index');
Matrix.api        = require('admatrix-node-sdk');
_                 = require('lodash');

Matrix.helpers = require('../lib/helpers');

var options = {
  clientId: 'AdMobilizeAPIDev',
  clientSecret: 'AdMobilizeAPIDevSecret',
  apiUrl: process.env['MATRIX_API_SERVER'] || 'http://dev-demo.admobilize.com',
  mxssUrl: process.env['MATRIX_STREAMING_SERVER'] || 'http://dev-mxss.admobilize.com:80',
};

Matrix.options = options;

Matrix.api.makeUrls(options.apiUrl, options.mxssUrl);

//sets Matrix.config with local variables
Matrix.config = Matrix.helpers.getConfig();

// to make user / device / etc available to sdk
Matrix.api.setConfig(Matrix.config);

// debug(Matrix.config);
