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

// Response Interceptor: handle session expiry, branch errors, and human-readable feedback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      let humanMessage = data?.message;

      // 401 Unauthorized
      if (status === 401) {
        clearTenantSession();
        humanMessage = humanMessage || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.';
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // 403 Forbidden / Branch IDOR
      else if (status === 403) {
        humanMessage = humanMessage || 'عذراً، ليس لديك صلاحية للوصول إلى هذا السجل أو هذا الفرع.';
        if (data?.code === 'TENANT_ACCESS_DENIED' || data?.code === 'TENANT_BRANCH_UNASSIGNED') {
          clearTenantSession();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      // 409 Conflict
      else if (status === 409) {
        humanMessage = humanMessage || 'لديك كشف مفتوح بالفعل أو تعارض في العملية، يرجى التحقق.';
      }
      // 422 Unprocessable Content
      else if (status === 422) {
        humanMessage = humanMessage || 'بيانات الإدخال غير صالحة أو غير مكتملة.';
      }
      // 500 Internal Server Error
      else if (status >= 500) {
        humanMessage = humanMessage || 'حدث خطأ غير متوقع في الخادم، تم تسجيل المشكلة وجارٍ التعامل معها.';
      }

      error.userMessage = humanMessage;

      // Dispatch global custom event for notification handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app:api-error', {
            detail: {
              status,
              message: humanMessage,
              errorCode: data?.error_code || data?.code,
              details: data?.details || [],
            },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export { isSubdomain, hostname };
export default api;
