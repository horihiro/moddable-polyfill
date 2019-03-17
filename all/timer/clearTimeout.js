import Timer from 'timer';

function clearTimeout (id) {
  try {
    Timer.clear(id);
  } catch(e) {
    trace(e);
  }
}

global.clearTimeout = clearTimeout;
