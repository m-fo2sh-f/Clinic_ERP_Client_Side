import { useQuery } from '@tanstack/react-query';
import { getPlatformTenantDetailsApi, getPlatformTenantUsersApi } from '../api/platformApi';

export const useTenantDetails = (tenantId) => {
  return useQuery({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => getPlatformTenantDetailsApi(tenantId),
    enabled: Boolean(tenantId),
    staleTime: 15000,
  });
};

export const useTenantUsers = (tenantId, { page = 1, perPage = 10 } = {}) => {
  return useQuery({
    queryKey: ['platform', 'tenant-users', tenantId, { page, perPage }],
    queryFn: () => getPlatformTenantUsersApi(tenantId, { page, perPage }),
    enabled: Boolean(tenantId),
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });
};
