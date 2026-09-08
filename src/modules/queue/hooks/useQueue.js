import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { markQueryInvalidated, debouncedInvalidate } from '../../../utils/invalidationTracker';

// 🎯 تسمية خاصة وفريدة بمفاتيح الصالة لمنع أي تضارب مع الحجوزات
export const queueKeys = {
    all: ['liveQueue'],
    lists: () => [...queueKeys.all, 'list'],
    list: (branchId, doctorId) => [...queueKeys.lists(), { branchId, doctorId }]
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
        queryFn: async () => {
            const response = await api.get('/live-queues', {
                params: {
                    branch_id: branchId,
                    doctor_id: doctorId || undefined
                }
            });
            return response.data?.data || [];
        },
        enabled: !!branchId,
        staleTime: 1000 * 5, // 5s stale time for live operational queue
    });
};

/**
 * Unauthenticated public queue query for TV Waiting Room displays
 */
export const usePublicLiveQueueQuery = (branchId, doctorId) => {
    return useQuery({
        queryKey: queueKeys.list(branchId, doctorId),
        queryFn: async () => {
            try {
                const response = await api.get('/public/live-queues', {
                    params: { branch_id: branchId, doctor_id: doctorId || undefined }
                });
                return response.data?.data || [];
            } catch (err) {
                const response = await api.get('/live-queues', {
                    params: { branch_id: branchId, doctor_id: doctorId || undefined }
                });
                return response.data?.data || [];
            }
        },
        enabled: !!branchId,
        staleTime: 1000 * 5,
    });
};

/**
 * Update status of a patient in live queue
 */
export const useUpdateQueueStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => api.patch(`/live-queues/${id}`, { status }),
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
        mutationFn: (id) => api.delete(`/live-queues/${id}`),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};

export const useReorderQueueMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderedIds, branchId }) => 
            api.post('/live-queues/reorder', { 
                ordered_ids: orderedIds, 
                branch_id: branchId 
            }),
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
        mutationFn: (payload) => {
            const body = typeof payload === 'object' ? payload : { branch_id: payload };
            return api.post('/live-queues/next', body);
        },
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
        queryFn: async () => {
            const response = await api.get(`/patients/${patientId}/history`);
            return response.data?.data || null;
        },
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
        mutationFn: (walkInData) => api.post('/live-queues/check-in-walkin', walkInData),
        onMutate: () => markQueryInvalidated(),
        onSuccess: () => {
            invalidateAfterMutation(queryClient);
        },
    });
};
