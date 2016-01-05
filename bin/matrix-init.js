
require('colors');

Matrix 						= {};
Matrix.version 		= require('../package.json').version;
Matrix.config     = require('../config/index');
Matrix.api        = require('admatrix-node-sdk');
_                 = require('lodash');

Matrix.helpers = require('../lib/helpers');

var options = {
  clientId: 'AdMobilizeAPIDev',
  clientSecret: 'AdMobilizeAPIDevSecret',
  apiUrl: process.env['ADMATRIX_API_SERVER'] || 'http://dev-demo.admobilize.com'
};
Matrix.options = options;

Matrix.api.makeUrls(options.apiUrl);

Matrix.helpers.getConfig();
//TODO: Needs to not be needed
Matrix.deviceId = Matrix.config.device.identifier;
