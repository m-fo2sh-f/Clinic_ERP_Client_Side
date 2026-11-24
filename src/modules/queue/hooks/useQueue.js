import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import queueApi from '../api/queueApi';
import { markQueryInvalidated, debouncedInvalidate } from '../../../utils/invalidationTracker';

// Dedicated and unique query keys for live queue to prevent collision with bookings
export const queueKeys = {
    all: ['liveQueue'],
    lists: () => [...queueKeys.all, 'list'],
    list: (branchId, doctorId) => [...queueKeys.lists(), { branchId, doctorId }],
    publicLists: () => [...queueKeys.all, 'public'],
    publicList: (branchId, doctorId) => [...queueKeys.publicLists(), { branchId, doctorId }],
};

/**
 * Centralized invalidation helper for queue mutations.
 * Marks the mutation timestamp (so WebSocket events are suppressed)
 * then debounces actual refetch calls.
 */
const invalidateAfterMutation = (queryClient, keys = [queueKeys.all, ['appointments']]) => {
    markQueryInvalidated();
    debouncedInvalidate(queryClient, keys, 100);
};

/**
 * Fetch live queue for a specific branch (optional doctor_id filter)
 */
export const useLiveQueueQuery = (branchId, doctorId) => {
    return useQuery({
        queryKey: queueKeys.list(branchId, doctorId),
        queryFn: () => queueApi.getLiveQueue(branchId, doctorId),
        enabled: !!branchId,
        staleTime: 1000 * 5, // 5s stale time for live operational queue
    });
};

/**
 * Unauthenticated public queue query for TV Waiting Room displays
 */
export const usePublicLiveQueueQuery = (branchId, doctorId) => {
    return useQuery({
        queryKey: queueKeys.publicList(branchId, doctorId),
        queryFn: () => queueApi.getPublicLiveQueue(branchId, doctorId),
        enabled: !!branchId,
        staleTime: 1000 * 5,
        refetchInterval: 10000, // 10s fallback polling for public TV displays
    });
};

/**
 * Update status of a patient in live queue
 */
export const useUpdateQueueStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => queueApi.updateStatus(id, status),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};

/**
 * Remove patient from live queue
 */
export const useDeleteQueueMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => queueApi.deleteQueueItem(id),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};

/**
 * Cancel patient from live queue (walk-away / left)
 */
export const useCancelQueueMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }) => queueApi.cancelQueueItem(id, reason),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};

export const useReorderQueueMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderedIds, branchId }) => queueApi.reorderQueue(orderedIds, branchId),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient, [queueKeys.all]);
        },
    });
};

/**
 * Call the next waiting patient for examination (Doctor Dashboard CTA)
 */
export const useCallNextPatientMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => queueApi.callNext(payload),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};

/**
 * Fetch full patient medical history for the Doctor Dashboard active patient view
 */
export const usePatientHistoryQuery = (patientId) => {
    return useQuery({
        queryKey: ['patientHistory', patientId],
        queryFn: () => queueApi.getPatientHistory(patientId),
        enabled: !!patientId,
        staleTime: 1000 * 60 * 2, // 2 minutes stale time for medical history
    });
};

/**
 * Direct Walk-In patient check-in mutation
 */
export const useWalkInMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (walkInData) => queueApi.walkInCheckIn(walkInData),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};
