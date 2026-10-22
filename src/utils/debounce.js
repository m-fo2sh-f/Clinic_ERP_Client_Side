/**
 * Reusable debounce utility.
 * Delays invoking func until after wait milliseconds have elapsed since
 * the last time the debounced function was invoked.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait Delay in milliseconds (default: 350ms).
 * @param {Object} [options]
 * @param {boolean} [options.leading=false] Specify invoking on the leading edge of the timeout.
 * @returns {Function & { cancel: () => void, flush: () => void }}
 */
export function debounce(func, wait = 350, { leading = false } = {}) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let result = null;

  function invoke() {
    timeoutId = null;
    if (!leading && lastArgs) {
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const callNow = leading && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(invoke, wait);

    if (callNow) {
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }

    return result;
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      invoke();
    }
    return result;
  };

  return debounced;
}
