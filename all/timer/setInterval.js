import Timer from 'timer';

function setInterval () {
  if (!arguments || !arguments[0]) throw new TypeError('Not enough arguments to setInterval');
  const callback = Array.prototype.shift.call(arguments);
  const delay = Array.prototype.shift.call(arguments) || 0;
  const _args = [];
  Array.prototype.forEach.call(arguments, (arg) => {
    _args.push(arg);
  });
  return Timer.repeat((id) => {
    callback.apply(this, _args);
  }, delay);
}

global.setInterval = setInterval;
