import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import echo from '../services/echo';
import { shouldSkipWebSocketInvalidate, debouncedInvalidate } from '../utils/invalidationTracker';

/**
 * WebSocket hook for real-time live queue updates via Laravel Reverb.
 *
 * Design decisions:
 * - Uses a ref to track the active channel subscription to prevent
 *   React StrictMode (dev) from creating duplicate listeners.
 * - Delegates to debouncedInvalidate so that even if multiple WS events
 *   arrive in rapid succession, only ONE refetch per query key fires.
 * - shouldSkipWebSocketInvalidate blocks WS-triggered refetches when a
 *   local mutation already refreshed the data within the guard window.
 */
export function useQueueWebSocket(branchId, onPatientCalled, isPublic = false) {
    const queryClient = useQueryClient();
    const callbackRef = useRef(onPatientCalled);
    const channelRef = useRef(null);

    useEffect(() => {
        callbackRef.current = onPatientCalled;
    }, [onPatientCalled]);

    const safeInvalidate = useCallback((queryKeys = ['liveQueue', 'appointments']) => {
        if (shouldSkipWebSocketInvalidate(3500)) {
            return;
        }
        debouncedInvalidate(queryClient, queryKeys, 300);
    }, [queryClient]);

    useEffect(() => {
        if (!branchId) return;

        // Prevent duplicate subscriptions (React StrictMode calls effects twice in dev)
        if (channelRef.current) {
            channelRef.current.stopListening('.queue.updated');
            channelRef.current.stopListening('.QueueReordered');
            channelRef.current.stopListening('.patient.called');
        }

        const channel = isPublic
            ? echo.channel(`live-queue.${branchId}`)
            : echo.private(`live-queue.${branchId}`);

        channelRef.current = channel;

        const handleQueueUpdated = () => {
            safeInvalidate(['liveQueue', 'appointments']);
        };

        const handleQueueReordered = () => {
            safeInvalidate(['liveQueue']);
        };

        const handlePatientCalled = (data) => {
            safeInvalidate(['liveQueue', 'appointments']);
            callbackRef.current?.(data);
        };

        channel.listen('.queue.updated', handleQueueUpdated);
        channel.listen('.QueueReordered', handleQueueReordered);
        channel.listen('.patient.called', handlePatientCalled);

        return () => {
            channel.stopListening('.queue.updated');
            channel.stopListening('.QueueReordered');
            channel.stopListening('.patient.called');
            channelRef.current = null;
        };
    }, [branchId, isPublic, queryClient, safeInvalidate]);
}