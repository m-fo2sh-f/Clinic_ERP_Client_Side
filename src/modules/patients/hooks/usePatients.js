import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import patientApi from '../api/patientApi';
import { markQueryInvalidated, debouncedInvalidate } from '../../../utils/invalidationTracker';

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
    queryFn: () => patientApi.getPatients(branchId, search),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Quick server-side search for auto-completion (min 2 chars)
 */
export const useSearchPatientsQuery = (searchTerm) => {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: ({ signal }) => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];
      return patientApi.searchPatients(searchTerm, signal);
    },
    enabled: !!searchTerm && searchTerm.trim().length >= 2,
    staleTime: 1000 * 10,
  });
};

/**
 * Fetch detailed medical profile and full appointment visit history for a patient
 */
export const usePatientDetailQuery = (patientId) => {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => patientApi.getPatientDetail(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Fetch summary context for UI preview
 */
export const usePatientSummaryQuery = (patientId) => {
  return useQuery({
    queryKey: ['patients', 'summary', patientId],
    queryFn: () => patientApi.getPatientSummary(patientId),
    enabled: !!patientId,
  });
};

/**
 * Update patient profile demographics and medical background
 */
export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patientData }) => patientApi.updatePatient(id, patientData),
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
