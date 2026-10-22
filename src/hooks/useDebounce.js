import { useState, useEffect } from 'react';

/**
 * Reusable hook to debounce any value (e.g. search terms, form inputs) on keyboard idle.
 *
 * Resets the timer with every keystroke and only emits the updated value after
 * the user ceases typing for the specified delay (default 350ms).
 *
 * @template T
 * @param {T} value The input value to debounce.
 * @param {number} [delay=350] Milliseconds of keyboard idle time before committing.
 * @returns {T} The debounced value.
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
