import Timer from 'timer';

function setInterval (callback, delay) {
  Timer.repeat(callback, delay);
}

global.setInterval = setInterval;
