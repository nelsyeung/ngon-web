export default function (func, wait, opts) {
  const getNow = Date.now || function n() {
    return new Date().getTime();
  };

  let timeout;
  let context;
  let args;
  let result;
  let previous = 0;
  let options = opts;

  if (!options) options = {};

  const later = function later() {
    previous = options.leading === false ? 0 : getNow();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      args = null;
      context = args;
    }
  };

  const throttled = function throttled() {
    const now = getNow();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = arguments; // eslint-disable-line prefer-rest-params
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) {
        args = null;
        context = args;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function cancel() {
    clearTimeout(timeout);
    previous = 0;
    args = null;
    context = args;
    timeout = context;
  };

  return throttled;
}
