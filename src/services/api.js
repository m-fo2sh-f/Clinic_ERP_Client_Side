import axios from 'axios';

// 1. Determine Base URL based on current subdomain
const hostname = window.location.hostname;
const baseURL = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
  ? `http://${hostname}:8000/api/v1`
  : `http://localhost:8000/api/v1`;

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
          (typeof data?.message === 'string' && (data.message.includes('\u063A\u064A\u0631 \u0645\u0635\u0631\u062D') || data.message.toLowerCase().includes('unauthorized'))))
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

export default api;
