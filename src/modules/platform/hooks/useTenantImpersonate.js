import { useMutation, useQueryClient } from '@tanstack/react-query';
import { impersonateTenantApi, toggleTenantStatusApi } from '../api/platformApi';

export const useTenantImpersonate = () => {
  return useMutation({
    mutationFn: (tenantId) => impersonateTenantApi(tenantId),
    onSuccess: (data) => {
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      }
    },
  });
};

export const useToggleTenantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, isActive }) => toggleTenantStatusApi(tenantId, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'metrics'] });
    },
  });
};
