import Timer from 'timer';

function setTimeout () {
  if (!arguments || !arguments[0]) throw new TypeError('Not enough arguments to setTimeout');
  const callback = Array.prototype.shift.call(arguments);
  const delay = Array.prototype.shift.call(arguments) || 0;
  const _args = [];
  Array.prototype.forEach.call(arguments, (arg) => {
    _args.push(arg);
  });
  return Timer.set((id) => {
    callback.apply(this, _args);
  }, delay);
}

global.setTimeout = setTimeout;
