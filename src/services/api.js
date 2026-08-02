import axios from 'axios';

// 1. تحديد الـ Base URL بناءً على الـ Subdomain الحالية
const hostname = window.location.hostname;
const baseURL = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
  ? `http://${hostname}:8000/api`
  : `http://localhost:8000/api`;

const api = axios.create({
  baseURL,
  withCredentials: true, // ⚠️ إجباري: لتمرير كوكيز الجلسة عبر الـ Subdomains
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: تمرير الفرع النشط (X-Branch-ID) تلقائياً مع كل طلب
api.interceptors.request.use(
  (config) => {
    const activeBranchId = localStorage.getItem('active_branch_id');
    if (activeBranchId) {
      config.headers['X-Branch-ID'] = activeBranchId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: التعامل مع انتهاء الجلسة (401 Unauthenticated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('انتهت الجلسة، جاري إعادة التوجيه لصفحة الدخول...');
      localStorage.removeItem('active_branch_id');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;