import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query Keys
export const appointmentKeys = {
  all: ['appointments'],
  lists: () => [...appointmentKeys.all, 'list'],
  list: (branchId, targetDate) => [...appointmentKeys.lists(), { branchId, targetDate }]
};

/**
 * Fetch appointments for a specific branch
 */
export const useAppointmentsQuery = (branchId, targetDate) => {
  return useQuery({
    // 🎯 إضافة targetDate للـ queryKey يضمن إعادة الجلب تلقائياً عند تغيير اليوم في التقويم
    queryKey: appointmentKeys.list(branchId, targetDate),
    queryFn: async () => {
      const response = await api.get('/appointments', {
        params: { branch_id: branchId, date: targetDate }
      });
      return response.data?.data || [];
    },
    enabled: !!branchId,
  });
};

/**
 * Create a new appointment
 */
export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData) => {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/**
 * Update an existing appointment (e.g. status change, reordering)
 */
export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...appointmentData }) => {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/**
 * Delete an appointment
 */
export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};
/**
 * checkIn an appointment
 */

export const useCheckInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/appointments/${id}/check-in`), // Direct URL parameter
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] }); // Refresh live queue list
    },
  });
};
