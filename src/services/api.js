import axios from 'axios';

// 1. تحديد الـ Base URL بناءً على الـ Subdomain الحالية
const hostname = window.location.hostname;
const baseURL = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
  ? `http://${hostname}:8000/api/v1`
  : `http://localhost:8000/api/v1`;

const api = axios.create({
  baseURL,
  withCredentials: true, // ⚠️ إجباري: لتمرير كوكيز الجلسة عبر الـ Subdomains
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: تمرير توكين المصادقة والفرع النشط تلقائياً مع كل طلب
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

// Response Interceptor: التعامل مع انتهاء الجلسة وإلغاء الوصول غير المصرح عبر التينانتس
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 🛑 حظر الوصول لحسابات التينانت الأجنبية (Cross-Tenant Hijack Mitigation)
      if (
        status === 403 &&
        (data?.code === 'TENANT_ACCESS_DENIED' ||
          (typeof data?.message === 'string' && data.message.includes('غير مصرح لك بالوصول لبيانات هذه العيادة')))
      ) {
        console.warn('محاولة وصول غير مصرح بها لعيادة أخرى، جاري إخلاء الجلسة وإعادة التوجيه...');
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
        // منع حلقة إعادة التوجيه (Infinite Refresh Loop) لو كنا بالفعل في صفحة الدخول
        if (window.location.pathname !== '/login') {
          console.warn('انتهت الجلسة، جاري إعادة التوجيه لصفحة الدخول...');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
