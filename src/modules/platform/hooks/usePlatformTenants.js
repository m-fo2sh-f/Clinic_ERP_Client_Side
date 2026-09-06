import { useQuery } from '@tanstack/react-query';
import { getPlatformTenantsApi } from '../api/platformApi';

export const usePlatformTenants = ({ page = 1, search = '', status = '', perPage = 10 } = {}) => {
  return useQuery({
    queryKey: ['platform', 'tenants', { page, search, status, perPage }],
    queryFn: () => getPlatformTenantsApi({ page, search, status, perPage }),
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
  });
};
