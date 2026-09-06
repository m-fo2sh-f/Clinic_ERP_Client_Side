import api from '../../../services/api';

/**
 * Fetch high-level platform aggregated metrics
 */
export const getPlatformMetricsApi = async () => {
  const response = await api.get('/platform/metrics');
  return response.data?.data;
};

/**
 * Fetch paginated list of tenants with filters
 */
export const getPlatformTenantsApi = async ({ page = 1, search = '', status = '', perPage = 10 } = {}) => {
  const params = {
    page,
    per_page: perPage,
  };
  if (search) params.search = search;
  if (status && status !== 'all') params.status = status;

  const response = await api.get('/platform/tenants', { params });
  return {
    tenants: response.data?.data || [],
    meta: response.data?.meta || {},
  };
};

/**
 * Fetch single tenant details, branches, and stats
 */
export const getPlatformTenantDetailsApi = async (tenantId) => {
  const response = await api.get(`/platform/tenants/${tenantId}`);
  return response.data?.data;
};

/**
 * Fetch paginated tenant users with scoped roles
 */
export const getPlatformTenantUsersApi = async (tenantId, { page = 1, perPage = 10 } = {}) => {
  const response = await api.get(`/platform/tenants/${tenantId}/users`, {
    params: { page, per_page: perPage },
  });
  return {
    users: response.data?.data || [],
    meta: response.data?.meta || {},
  };
};

/**
 * Toggle tenant active / suspended state
 */
export const toggleTenantStatusApi = async (tenantId, isActive) => {
  const response = await api.post(`/platform/tenants/${tenantId}/status`, {
    is_active: isActive,
  });
  return response.data?.data;
};

/**
 * Impersonate clinic owner and issue temporary 15-minute token
 */
export const impersonateTenantApi = async (tenantId) => {
  const response = await api.post(`/platform/tenants/${tenantId}/impersonate`);
  return response.data?.data;
};
