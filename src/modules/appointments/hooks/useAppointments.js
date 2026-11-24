import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import appointmentsApi from '../api/appointmentsApi';
import { markQueryInvalidated, debouncedInvalidate } from '../../../utils/invalidationTracker';

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
    queryFn: () => appointmentsApi.getBranchDoctors(branchId),
    enabled: !!branchId,
  });
};

/**
 * Fetch appointments for a specific branch (optional doctor_id filter)
 */
export const useAppointmentsQuery = (branchId, targetDate, doctorId) => {
  return useQuery({
    queryKey: appointmentKeys.list(branchId, targetDate, doctorId),
    queryFn: () => appointmentsApi.getAppointments(branchId, targetDate, doctorId),
    enabled: !!branchId,
  });
};

/**
 * Centralized invalidation helper for appointment + queue mutations.
 * Marks the mutation timestamp (so WebSocket events are suppressed)
 * then debounces actual refetch calls.
 */
const invalidateAfterMutation = (queryClient, keys = [appointmentKeys.all, ['liveQueue']]) => {
  markQueryInvalidated();
  debouncedInvalidate(queryClient, keys, 100);
};

/**
 * Create a new appointment
 */
export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData) => appointmentsApi.createAppointment(appointmentData),
    onMutate: () => markQueryInvalidated(),
    onSuccess: () => {
      invalidateAfterMutation(queryClient, [appointmentKeys.all]);
    },
  });
};

/**
 * Update an existing appointment
 */
export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...appointmentData }) => appointmentsApi.updateAppointment(id, appointmentData),
    onMutate: () => markQueryInvalidated(),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
    },
  });
};

/**
 * Delete an appointment
 */
export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => appointmentsApi.deleteAppointment(id),
    onMutate: () => markQueryInvalidated(),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
    },
  });
};

/**
 * Check-In an appointment
 */
export const useCheckInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => appointmentsApi.checkIn(id),
    // 🎯 Mark BEFORE the request is sent so that WebSocket events arriving
    // before the HTTP response (server broadcasts via afterCommit) are suppressed.
    onMutate: () => markQueryInvalidated(),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
    },
  });
};