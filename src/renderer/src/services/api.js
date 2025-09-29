import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  // ⚠️ enlève withCredentials si tu n’utilises pas de cookies
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
