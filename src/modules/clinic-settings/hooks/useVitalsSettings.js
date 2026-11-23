import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVitalsConfig, updateVitalsConfig } from '../api/clinicSettingsApi';
import { DEFAULT_VITALS_CONFIG } from '../constants/vitalsConstants';
import { prescriptionTemplateKeys } from './usePrescriptionTemplate';

export const vitalsConfigKeys = {
  all: ['clinic-settings', 'vitals-config'],
  doctor: (branchId, doctorId) => [...vitalsConfigKeys.all, branchId || 'default', doctorId || 'default'],
};

export function useVitalsSettings(branchId, doctorId = null) {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState(null);

  const queryKey = vitalsConfigKeys.doctor(branchId, doctorId);

  const {
    data: vitalsConfig = DEFAULT_VITALS_CONFIG,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getVitalsConfig(branchId, doctorId),
    staleTime: 1000 * 60 * 5,
  });

  const showStatus = useCallback((type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (updatedPayload) => updateVitalsConfig(updatedPayload, branchId, doctorId),
    onSuccess: (savedData) => {
      queryClient.setQueryData(queryKey, savedData);
      queryClient.invalidateQueries({ queryKey: vitalsConfigKeys.all });
      queryClient.invalidateQueries({ queryKey: prescriptionTemplateKeys.all });
      queryClient.invalidateQueries({ queryKey: ['encounter'] });
      showStatus('success', 'تم حفظ إعدادات وتخصيصات العلامات الحيوية بنجاح.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'فشل حفظ إعدادات العلامات الحيوية.';
      showStatus('error', msg);
    },
  });

  return {
    vitalsConfig,
    isLoading,
    isError,
    error,
    refetch,
    isSaving: saveMutation.isPending,
    statusMessage,
    saveVitalsConfig: saveMutation.mutateAsync,
  };
}

export default useVitalsSettings;
