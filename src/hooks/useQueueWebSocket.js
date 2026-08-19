import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import echo from '../services/echo';
import { shouldSkipWebSocketInvalidate, markQueryInvalidated } from '../utils/invalidationTracker';

export function useQueueWebSocket(branchId, onPatientCalled) {
    const queryClient = useQueryClient();
    const callbackRef = useRef(onPatientCalled);

    useEffect(() => {
        callbackRef.current = onPatientCalled;
    }, [onPatientCalled]);

    useEffect(() => {
        if (!branchId) return;

        const channel = echo.private(`live-queue.${branchId}`);

        // 🎯 Prevent duplicate network request storms from WebSocket events arriving right after local mutations
        const safeInvalidate = (queryKeys = ['liveQueue', 'appointments']) => {
            if (shouldSkipWebSocketInvalidate(2000)) {
                return;
            }
            markQueryInvalidated();
            queryKeys.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: [key] });
            });
        };

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

        // 🛑 Stop event listeners without destroying full WebSocket channel
        return () => {
            channel.stopListening('.queue.updated', handleQueueUpdated);
            channel.stopListening('.QueueReordered', handleQueueReordered);
            channel.stopListening('.patient.called', handlePatientCalled);
        };
    }, [branchId, queryClient]);
}