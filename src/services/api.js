import axios from 'axios';

// 1. Determine Base URL dynamically based on current subdomain/hostname
const hostname = window.location.hostname || 'localhost';
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

// Subdomain check: if not localhost/127.0.0.1 and not central platform subdomains (platform., admin.)
const isSubdomain = !isLocal && !hostname.startsWith('platform.') && !hostname.startsWith('admin.');

// Dynamic API port (default 8000 for Laravel Artisan)
const apiPort = import.meta.env.VITE_API_PORT || '8000';

// If accessed via a subdomain (e.g., alnoor.localhost or alnoor.my-saas.com):
// Route API calls to the Tenant Backend (http://${hostname}:8000/api/v1)
// If accessed via the central domain (e.g., localhost or platform.my-saas.com):
// Route API calls to the Central Platform Backend (http://${hostname}:8000/api/v1)
const baseURL = `http://${hostname}:${apiPort}/api/v1`;
export const getTenantStorageKey = (key) => `tenant_${hostname}_${key}`;

export const getAuthToken = () => {
  return localStorage.getItem(getTenantStorageKey('token')) || localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(getTenantStorageKey('token'), token);
  } else {
    localStorage.removeItem(getTenantStorageKey('token'));
  }
};
export const clearTenantSession = () => {
  // مسح التوكن المعزول
  localStorage.removeItem(getTenantStorageKey('token'));
  localStorage.removeItem(getTenantStorageKey('active_branch_id'));

  // مسح المفاتيح القديمة العامة لتنظيف المتصفح تماماً
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('active_branch_id');
};
const api = axios.create({
  baseURL,
  withCredentials: true, // Required: forward session cookies across subdomains
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: pass bearer token and active branch ID with every request
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const activeBranchId =
      localStorage.getItem(getTenantStorageKey('active_branch_id')) ||
      localStorage.getItem('active_branch_id');

    if (activeBranchId) {
      config.headers['X-Branch-ID'] = activeBranchId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle session expiry and unauthorized cross-tenant access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // لو الباك إند رفض الريكويست بسبب عدم التبعية للعيادة
      if (
        status === 403 &&
        (data?.code === 'TENANT_ACCESS_DENIED' || data?.code === 'TENANT_BRANCH_UNASSIGNED')
      ) {
        clearTenantSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // لو التوكن غير صالح أو انتهت صلاحيته
      if (status === 401) {
        clearTenantSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export { isSubdomain, hostname };
export default api;
