import axios from 'axios';

// 1. Construct the base URL dynamically based on the subdomain
// e.g. clinic1.my-saas.test -> http://clinic1.my-saas.test:8000/api/v1
const hostname = window.location.hostname;
// Typically, the backend API runs on port 8000 or the same domain.
// Here we follow the spec: http://${window.location.hostname}:8000/api/v1
const baseURL = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
  ? `http://${hostname}:8000/api/v1`
  : `http://localhost:8000/api/v1`;

const api = axios.create({
  baseURL,
  withCredentials: true, // Share cookies across subdomains (essential for multi-tenant sessions)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token placeholders
api.interceptors.request.use(
  (config) => {
    // In production, fetch the JWT token or session token
    const token = localStorage.getItem('auth_token') || 'placeholder-receptionist-token-xyz123';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error logging / session expiry redirection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('SaaS Session expired. Redirecting or prompting authentication...');
    }
    return Promise.reject(error);
  }
);





// --- SEED/MOCK FRONTEND STATE STORE ---
// We persist changes locally in localStorage to simulate real-time operations and transitions
const STORAGE_KEY = 'clinic_dashboard_state';

const initialMockState = {
  branches: [
    { id: 'maadi', name: 'Maadi Branch', clinicSubdomain: 'maadi.my-saas.test' },
    { id: 'tagamoa', name: 'Tagamoa Branch', clinicSubdomain: 'tagamoa.my-saas.test' },
    { id: 'heliopolis', name: 'Heliopolis Branch', clinicSubdomain: 'heliopolis.my-saas.test' }
  ],
  patients: [
    { id: 1, name: 'Ahmed Ali', phone: '01012345678' },
    { id: 2, name: 'Sara Kamel', phone: '01234567890' },
    { id: 3, name: 'John Doe', phone: '01122334455' },
    { id: 4, name: 'Mariam Hassan', phone: '01555667788' },
    { id: 5, name: 'Mostafa Omar', phone: '01099887766' },
  ],
  bookings: [
    { id: 'b1', patientId: 1, patientName: 'Ahmed Ali', patientPhone: '01012345678', time: '04:30 PM', type: 'Check-up', status: 'Confirmed', branchId: 'maadi' },
    { id: 'b2', patientId: 2, patientName: 'Sara Kamel', patientPhone: '01234567890', time: '05:15 PM', type: 'Consultation', status: 'Confirmed', branchId: 'maadi' },
    { id: 'b3', patientId: 3, patientName: 'John Doe', patientPhone: '01122334455', time: '06:00 PM', type: 'Check-up', status: 'Confirmed', branchId: 'maadi' },
    { id: 'b4', patientId: 4, patientName: 'Mariam Hassan', patientPhone: '01555667788', time: '03:15 PM', type: 'Consultation', status: 'Confirmed', branchId: 'tagamoa' },
    { id: 'b5', patientId: 5, patientName: 'Mostafa Omar', patientPhone: '01099887766', time: '04:00 PM', type: 'Check-up', status: 'Confirmed', branchId: 'tagamoa' },
    { id: 'b6', patientId: 1, patientName: 'Ahmed Ali', patientPhone: '01012345678', time: '07:15 PM', type: 'Consultation', status: 'Confirmed', branchId: 'maadi' },
  ],
  liveQueue: [
    { id: 'q1', patientId: 4, patientName: 'Mariam Hassan', patientPhone: '01555667788', checkedInTime: '03:50 PM', status: 'Under Examination', queueNo: 1, branchId: 'maadi' },
    { id: 'q2', patientId: 5, patientName: 'Mostafa Omar', patientPhone: '01099887766', checkedInTime: '04:10 PM', status: 'Waiting', queueNo: 2, branchId: 'maadi' },
    { id: 'q3', patientId: 3, patientName: 'John Doe', patientPhone: '01122334455', checkedInTime: '04:22 PM', status: 'Waiting', queueNo: 3, branchId: 'maadi' },
  ]
};

export const getLocalState = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockState));
    return initialMockState;
  }
  return JSON.parse(data);
};

export const saveLocalState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export default api;