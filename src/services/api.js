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
    // Prevent accidental duplicate /platform prefixes
    if (config.url) {
      config.url = config.url.replace(/^\/platform\/platform/, '/platform');
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const activeBranchId = localStorage.getItem('active_branch_id');
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

      // Cross-Tenant Hijack Mitigation
      if (
        status === 403 &&
        (data?.code === 'TENANT_ACCESS_DENIED' ||
          (typeof data?.message === 'string' &&
            (data.message.includes('\u063A\u064A\u0631 \u0645\u0635\u0631\u062D') ||
              data.message.toLowerCase().includes('unauthorized'))))
      ) {
        console.warn('Unauthorized cross-tenant access attempt, clearing session and redirecting...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('active_branch_id');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('active_branch_id');
        // Prevent infinite refresh loop if already on login page
        if (window.location.pathname !== '/login') {
          console.warn('Session expired, redirecting to login...');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export { isSubdomain, hostname };
export default api;
