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
export const useSearchPatientsQuery = (searchTerm) => {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];

      const response = await api.get('/patients/search', {
        params: { q: searchTerm }
      });
      return response.data?.data || [];
    },
    // الاستعلام لن يعمل إلا إذا كتب المستخدم حرفين أو أكثر
    enabled: !!searchTerm && searchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 2, // الاحتفاظ بالنتائج في الكاش لمدة دقيقتين
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
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/**
 * Update an existing appointment
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
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
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
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
    },
  });
};

/**
 * Check-In an appointment
 */
export const useCheckInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/appointments/${id}/check-in`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
    },
  });
};