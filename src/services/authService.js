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
    const isPlatform = window.location.pathname.startsWith('/platform');
    const endpoint = isPlatform ? '/platform/logout' : '/logout';
    try {
      const response = await api.post(endpoint);
      return response.data;
    } catch (err) {
      if (isPlatform) {
        const fallback = await api.post('/logout');
        return fallback.data;
      }
      throw err;
    }
  } finally {
    localStorage.removeItem('active_branch_id');
  }
};

export const getMeApi = async () => {
  const isPlatform = window.location.pathname.startsWith('/platform');
  const endpoint = isPlatform ? '/platform/me' : '/me';
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (err) {
    if (isPlatform && err.response?.status === 404) {
      const fallback = await api.get('/me');
      return fallback.data;
    }
    throw err;
  }
};
