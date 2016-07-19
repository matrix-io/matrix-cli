var localize = require('node-yaml-localize');
//var debug = debugLog('localization');

var defaultPath = __dirname + '/../config/locales';
var defaultLocale = "en";//Matrix.locale || 'en';
var currentPath, currentLocale;

init(defaultPath, defaultLocale);

function init(path, locale) { 
  currentPath = path;
  currentLocale = locale;
  localize.middleware({
    path: path,
    locale: locale
  });
}

function changeLocale(locale) {
  init(currentPath, locale);
}

function changePath(path) {
  init(path, currentLocale);
}

console.log("Immediate: " + localize.translate("matrix.use.help"));
setTimeout(function () { console.log("After timeout: " + localize.translate("matrix.use.help")) }, 2000);

module.exports = {
  get: localize.translate,
  changeLocale: changeLocale, 
  changePath: changePath
};
