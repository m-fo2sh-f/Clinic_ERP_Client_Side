import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctorDrugs,
  createDoctorDrug,
  updateDoctorDrug,
  deleteDoctorDrug,
  toggleFavoriteDrug,
} from '../api/medicationsApi';

export const DOCTOR_DRUGS_QUERY_KEY = ['doctorDrugs'];

/**
 * Fetch doctor's personal prescribing catalog.
 */
export function useDoctorDrugsQuery(filters = {}) {
  return useQuery({
    queryKey: [...DOCTOR_DRUGS_QUERY_KEY, filters],
    queryFn: () => getDoctorDrugs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

/**
 * Create a new custom drug or default dosage in doctor's catalog.
 */
export function useCreateDoctorDrugMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createDoctorDrug(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_DRUGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['drugSearch'] });
    },
  });
}

/**
 * Update a doctor drug item.
 */
export function useUpdateDoctorDrugMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateDoctorDrug(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_DRUGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['drugSearch'] });
    },
  });
}

/**
 * Delete a drug from doctor's catalog.
 */
export function useDeleteDoctorDrugMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDoctorDrug(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_DRUGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['drugSearch'] });
    },
  });
}

/**
 * Toggle favorite status of a drug.
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => toggleFavoriteDrug(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTOR_DRUGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['drugSearch'] });
    },
  });
}
