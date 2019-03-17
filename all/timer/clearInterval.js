import Timer from 'timer';

function clearInterval (id) {
  try {
    Timer.clear(id);
  } catch(e) {
    trace(e);
  }
}

global.clearInterval = clearInterval;
