import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlatformTenantsApi, createTenantApi } from '../api/platformApi';

export const usePlatformTenants = ({ page = 1, search = '', status = '', perPage = 10 } = {}) => {
  return useQuery({
    queryKey: ['platform', 'tenants', { page, search, status, perPage }],
    queryFn: () => getPlatformTenantsApi({ page, search, status, perPage }),
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenantApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'metrics'] });
    },
  });
};
