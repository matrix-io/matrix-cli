var spinner = require('loading-spinner');
var loaderActive = false;
var matrixText = '⡟⠟⡇ ⣽ ⣗ ⡏ ⢨ ⢈⢎ '.white;
var loaderSpeed = 75;

function speed(value) {
  loaderSpeed = value;
}

//Changes the sequence of the spinner
function type(type) {
  switch (type) {
    case 'braille':
      brailleLoaderSequence();
      break;
    case 'matrix':
      matrixLoaderSequence();
      break;
    default:
      brailleLoaderSequence();
      break;
  }
}

function brailleLoaderSequence() {
  spinner.setSequence(
    ['⣷ ', '⣯ ', '⣟ ', '⡿ ', '⢿ ', '⣻ ', '⣽ ', '⣾ ']
  );
}

function matrixLoaderSequence() {
  spinner.setSequence(
    [
      matrixText + '⣷'.blue + ' ',
      matrixText + '⣯'.yellow + ' ',
      matrixText + '⣟'.red + ' ',
      matrixText + '⡿'.cyan + ' ',
      matrixText + '⢿'.white + ' ',
      matrixText + '⣻'.magenta + ' ',
      matrixText + '⣽'.green + ' ',
      matrixText + '⣾'.grey + ' '
    ]
  );
}

function start() {
  if (!loaderActive && process.env['TEST_MODE'] !== true) {
    loaderActive = true;
    spinner.start(loaderSpeed, {
      clearChar: true,
      clearLine: true,
      doNotBlock: true,
      hideCursor: false
    });
  }
}

function stop() {
  if (loaderActive && process.env['TEST_MODE'] !== true) {
    loaderActive = false;
    spinner.stop();
  }
}

module.exports = {
  start: start,
  stop: stop,
  speed: speed,
  type: type
};