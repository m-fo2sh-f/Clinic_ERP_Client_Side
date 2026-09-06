import { useQuery } from '@tanstack/react-query';
import { getPlatformMetricsApi } from '../api/platformApi';

export const usePlatformMetrics = () => {
  return useQuery({
    queryKey: ['platform', 'metrics'],
    queryFn: getPlatformMetricsApi,
    refetchInterval: 30000, // Background refresh every 30s
    staleTime: 15000,
  });
};
