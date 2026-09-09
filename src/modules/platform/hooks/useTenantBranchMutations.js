import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTenantBranchApi } from '../api/platformApi';

export const useUpdateBranch = (tenantId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, data }) => updateTenantBranchApi(tenantId, branchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenant-details', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenant', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
    },
  });
};
