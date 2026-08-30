import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { markQueryInvalidated } from '../utils/invalidationTracker';

// Query Keys
export const appointmentKeys = {
  all: ['appointments'],
  lists: () => [...appointmentKeys.all, 'list'],
  list: (branchId, targetDate, doctorId) => [...appointmentKeys.lists(), { branchId, targetDate, doctorId }]
};

/**
 * Fetch active doctors assigned to a specific branch
 */
export const useBranchDoctorsQuery = (branchId) => {
  return useQuery({
    queryKey: ['branchDoctors', branchId],
    queryFn: async () => {
      const response = await api.get(`/branches/${branchId}/doctors`);
      return response.data?.data || [];
    },
    enabled: !!branchId,
  });
};

/**
 * Fetch appointments for a specific branch (optional doctor_id filter)
 */
export const useAppointmentsQuery = (branchId, targetDate, doctorId) => {
  return useQuery({
    queryKey: appointmentKeys.list(branchId, targetDate, doctorId),
    queryFn: async () => {
      const response = await api.get('/appointments', {
        params: { branch_id: branchId, date: targetDate, doctor_id: doctorId || undefined }
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
      markQueryInvalidated();
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
      markQueryInvalidated();
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
      markQueryInvalidated();
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
      markQueryInvalidated();
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] });
    },
  });
};