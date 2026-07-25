import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query Keys
export const appointmentKeys = {
  all: ['liveQueue'],
  lists: () => [...appointmentKeys.all, 'list'],
  list: (branchId) => [...appointmentKeys.lists(), { branchId}]
};

/**
 * Fetch appointments for a specific branch
 */
export const useLiveQueueQuery = (branchId) => {
  return useQuery({
    // 🎯 إضافة targetDate للـ queryKey يضمن إعادة الجلب تلقائياً عند تغيير اليوم في التقويم
    queryKey: appointmentKeys.list(branchId),
    queryFn: async () => {
      const response = await api.get('/live-queue', {
        params: { branch_id: branchId }
      });
      return response.data?.data || [];
    },
    enabled: !!branchId,
  });
};

export const useUpdateQueueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/live-queue/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(appointmentKeys.lists());
    },
  });
};

