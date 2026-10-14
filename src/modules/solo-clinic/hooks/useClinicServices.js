import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import financialApi from '../../../services/financialApi';

import { findConsultationService } from '../utils/serviceUtils';

/**
 * useClinicServices — Single Responsibility Hook
 * Fetches the clinic's billable services catalog and resolves the default consultation fee.
 */
export default function useClinicServices(branchId) {
  const { data: availableServices = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['billing', 'services', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      try {
        const data = await financialApi.getBranchServices(branchId);
        return data || [];
      } catch (err) {
        console.error('Failed to load clinic services:', err);
        return [];
      }
    },
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const consultationFee = useMemo(() => {
    const consult = findConsultationService(availableServices);
    return consult ? Number(consult.price ?? consult.default_price ?? 150) : 150;
  }, [availableServices]);

  return {
    availableServices,
    consultationFee,
    isLoadingServices,
  };
}
