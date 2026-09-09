import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTenantUserApi, resetTenantUserPasswordApi } from '../api/platformApi';

export const useUpdateStaff = (tenantId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => updateTenantUserApi(tenantId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenant-users', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenant-users', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenant', tenantId] });
    },
  });
};

export const useResetPassword = (tenantId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => resetTenantUserPasswordApi(tenantId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenant-users', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenant-users', tenantId] });
    },
  });
};
