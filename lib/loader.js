var spinner = require('loading-spinner');
var loaderActive = false;
var loaderLineReturn = false;
var matrixText = '⡟⠟⡇ ⣽ ⣗ ⡏ ⢨ ⢈⢎ '.white;
var loaderSpeed = 75;

function speed(value){
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
  loaderLineReturn = false;
  spinner.setSequence(
    ['⣷ ', '⣯ ', '⣟ ', '⡿ ', '⢿ ', '⣻ ', '⣽ ', '⣾ ']
  );
}

function matrixLoaderSequence() {
  loaderLineReturn = true;
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
  if (!loaderActive) {
    loaderActive = true;
    spinner.start(loaderSpeed, {
      clearChar: true,
      clearLine: true,
      doNotBlock: true,
      hideCursor: false
    }
    );
  }
}

function stop() {
  if (loaderActive) {
    loaderActive = false;
    spinner.stop();
    if (loaderLineReturn) console.log(''); //This is only neccesary if the spinner consist of more than one character
  }
}

module.exports = {
  start: start,
  stop: stop,
  speed: speed,
  type: type
};
