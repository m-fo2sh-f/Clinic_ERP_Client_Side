import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { markQueryInvalidated } from '../utils/invalidationTracker';

// 🎯 تسمية خاصة وفريدة بمفاتيح الصالة لمنع أي تضارب مع الحجوزات
export const queueKeys = {
    all: ['liveQueue'],
    lists: () => [...queueKeys.all, 'list'],
    list: (branchId) => [...queueKeys.lists(), { branchId }]
};

/**
 * Fetch live queue for a specific branch
 */
export const useLiveQueueQuery = (branchId) => {
    return useQuery({
        queryKey: queueKeys.list(branchId),
        queryFn: async () => {
            const response = await api.get('/live-queues', {
                params: { branch_id: branchId }
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
export const usePublicLiveQueueQuery = (branchId) => {
    return useQuery({
        queryKey: queueKeys.list(branchId),
        queryFn: async () => {
            // Try public endpoint first, fallback to standard if needed
            try {
                const response = await api.get('/public/live-queues', {
                    params: { branch_id: branchId }
                });
                return response.data?.data || [];
            } catch (err) {
                const response = await api.get('/live-queues', {
                    params: { branch_id: branchId }
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
        onSuccess: () => {
            markQueryInvalidated();
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
        onSuccess: () => {
            markQueryInvalidated();
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
        onSuccess: () => {
            markQueryInvalidated();
            // Reordering only affects liveQueue order, not scheduled appointments
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
        },
    });
};

/**
 * Call the next waiting patient for examination (Doctor Dashboard CTA)
 */
export const useCallNextPatientMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (branchId) =>
            api.post('/live-queues/next', { branch_id: branchId }),
        onSuccess: () => {
            markQueryInvalidated();
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
        onSuccess: () => {
            markQueryInvalidated();
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};
