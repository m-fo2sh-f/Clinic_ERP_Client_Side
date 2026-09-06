let lastMutationTime = 0;
const debounceTimers = new Map();

/**
 * Mark that a query invalidation was triggered locally by a user mutation.
 */
export const markQueryInvalidated = () => {
    lastMutationTime = Date.now();
};

/**
 * Check if a WebSocket event invalidation should be skipped because a local mutation
 * already refreshed the queries recently (within windowMs).
 */
export const shouldSkipWebSocketInvalidate = (windowMs = 3500) => {
    return Date.now() - lastMutationTime < windowMs;
};

/**
 * Debounces query invalidation calls to prevent duplicate network request floods.
 * If 10 events or components request invalidation within delayMs, only 1 refetch executes.
 */
export const debouncedInvalidate = (queryClient, queryKeys = [], delayMs = 300) => {
    queryKeys.forEach((key) => {
        const keyString = Array.isArray(key) ? key.join(':') : String(key);

        if (debounceTimers.has(keyString)) {
            clearTimeout(debounceTimers.get(keyString));
        }

        const timer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
            debounceTimers.delete(keyString);
        }, delayMs);

        debounceTimers.set(keyString, timer);
    });
};
