import api from './api';

export const getCsrfCookie = async () => {
  const hostname = window.location.hostname;
  const sanctumUrl = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `http://${hostname}:8000/sanctum/csrf-cookie`
    : `http://localhost:8000/sanctum/csrf-cookie`;

  return await api.get(sanctumUrl);
};

export const loginApi = async (email, password) => {
  await getCsrfCookie();
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const logoutApi = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } finally {
    localStorage.removeItem('active_branch_id');
  }
};

export const getMeApi = async () => {
  const response = await api.get('/me');
  return response.data;
};