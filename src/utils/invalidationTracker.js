let lastInvalidateTime = 0;

/**
 * Mark that a query invalidation was triggered locally by a mutation.
 */
export const markQueryInvalidated = () => {
    lastInvalidateTime = Date.now();
};

/**
 * Check if a WebSocket event invalidation should be skipped because a local mutation
 * invalidated the query very recently (within windowMs).
 */
export const shouldSkipWebSocketInvalidate = (windowMs = 2000) => {
    return Date.now() - lastInvalidateTime < windowMs;
};
