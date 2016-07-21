var localize = require('node-yaml-localize');
//var debug = debugLog('localization');

var defaultPath = __dirname + '/../config/locales';
var defaultLocale = "en";//Matrix.locale || 'en';
var currentPath, currentLocale;

//init(defaultPath, defaultLocale);

function init(path, locale, callback) {
  currentPath = path;
  currentLocale = locale;
  localize.middleware({
    path: path,
    locale: locale
  }, callback);
}

function changeLocale(locale) {
  init(currentPath, locale);
}

function changePath(path) {
  init(path, currentLocale);
}

module.exports = {
  init: init,
  get: localize.translate,
  changeLocale: changeLocale,
  changePath: changePath
};
