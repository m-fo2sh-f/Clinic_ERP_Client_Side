import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { markQueryInvalidated, debouncedInvalidate } from '../utils/invalidationTracker';

// 🎯 Standardized Patient Query Keys
export const patientKeys = {
  all: ['patients'],
  lists: () => [...patientKeys.all, 'list'],
  list: (branchId, search) => [...patientKeys.lists(), { branchId, search }],
  details: () => [...patientKeys.all, 'detail'],
  detail: (id) => [...patientKeys.details(), id],
};

/**
 * Fetch patient directory scoped to active branch and search query
 */
export const usePatientsQuery = (branchId, search = '') => {
  return useQuery({
    queryKey: patientKeys.list(branchId, search),
    queryFn: async () => {
      const response = await api.get('/patients', {
        params: { 
          branch_id: branchId,
          search: search?.trim() || undefined
        }
      });
      return response.data?.data || [];
    },
    enabled: !!branchId,
  });
};

/**
 * Quick server-side search for auto-completion (min 2 chars)
 */
export const useSearchPatientsQuery = (searchTerm) => {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];

      const response = await api.get('/patients/search', {
        params: { q: searchTerm.trim() }
      });
      return response.data?.data || [];
    },
    enabled: !!searchTerm && searchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Fetch detailed medical profile and full appointment visit history for a patient
 */
export const usePatientDetailQuery = (patientId) => {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: async () => {
      const response = await api.get(`/patients/${patientId}`);
      return response.data?.data || null;
    },
    enabled: !!patientId,
  });
};

/**
 * Fetch summary context for UI preview
 */
export const usePatientSummaryQuery = (patientId) => {
  return useQuery({
    queryKey: ['patients', 'summary', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const response = await api.get(`/patients/${patientId}/summary`);
      return response.data?.data || null;
    },
    enabled: !!patientId,
  });
};

/**
 * Update patient profile demographics and medical background
 */
export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patientData }) => api.put(`/patients/${id}`, patientData),
    onMutate: () => markQueryInvalidated(),
    onSuccess: (_data, variables) => {
      markQueryInvalidated();
      debouncedInvalidate(queryClient, [
        patientKeys.all,
        ['patientHistory', variables.id],
        ['liveQueue'],
      ], 100);
    },
  });
};

// Backward-compatibility alias
export const usePatientHistoryQuery = usePatientDetailQuery;
