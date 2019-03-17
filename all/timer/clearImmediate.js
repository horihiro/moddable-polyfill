import Timer from 'timer';

function clearImmediate (id) {
  try {
    Timer.clear(id);
  } catch(e) {
    trace(e);
  }
}

global.clearImmediate = clearImmediate;
