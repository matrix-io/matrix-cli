var localize = require('node-yaml-localize');

var defaultPath = __dirname + '/../config/locales';
var defaultLocale = Matrix.locale || 'en';
var currentPath, currentLocale;

function init(path, locale, callback) {
  currentPath = path;
  currentLocale = locale;
  localize.init({
    path: path,
    locale: locale
  }, callback);
}

function changeLocale(locale, cb) {
  init(currentPath, locale, cb);
}

function changePath(path, cb) {
  init(path, currentLocale, cb);
}

module.exports = {
  init: init,
  get: localize.translate,
  changeLocale: changeLocale,
  changePath: changePath
};