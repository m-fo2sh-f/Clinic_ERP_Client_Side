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