import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import echo from '../services/echo';

/**
 * Subscribe to real-time queue events for a branch.
 *
 * @param {string}   branchId         - Active branch UUID
 * @param {function} onPatientCalled  - Callback fired on `.patient.called` with payload data
 */
export function useQueueWebSocket(branchId, onPatientCalled) {
    const queryClient = useQueryClient();
    const callbackRef = useRef(onPatientCalled);

    // Keep callback ref fresh without re-subscribing on every render
    useEffect(() => {
        callbackRef.current = onPatientCalled;
    }, [onPatientCalled]);

    useEffect(() => {
        if (!branchId) return;

        const channelName = `branch.${branchId}`;
        const channel = echo.channel(channelName);

        // Silent refresh — all screens re-fetch their query data
        channel.listen('.queue.updated', () => {
            queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        });

        // Also handle existing QueueReordered event for backward compatibility
        channel.listen('.QueueReordered', () => {
            queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
        });

        // Explicit patient announcement — TV chime + doctor dashboard notification
        channel.listen('.patient.called', (data) => {
            callbackRef.current?.(data);
        });

        return () => {
            channel.stopListening('.queue.updated');
            channel.stopListening('.QueueReordered');
            channel.stopListening('.patient.called');
        };
    }, [branchId, queryClient]);
}
