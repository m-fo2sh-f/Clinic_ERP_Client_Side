import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

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
            // 🎯 تعديل الرابط ليكون بالجمع القياسي /live-queues مطابوقاً للارافيل
            const response = await api.get('/live-queues', {
                params: { branch_id: branchId }
            });
            return response.data?.data || [];
        },
        enabled: !!branchId,
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
            // 🎯 إنعاش كاش الصالة وكاش الحجوزات أوتوماتيكياً
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
            // 🎯 إنعاش كاش الصالة وكاش الحجوزات أوتوماتيكياً
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
            // إنعاش كاش الصالة وكاش الحجوزات لتحديث الترتيب في الشاشة فوراً
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
    });
};