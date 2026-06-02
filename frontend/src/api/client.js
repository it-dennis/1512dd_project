import axios from 'axios';

export const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  register: (email, username, password) =>
    api.post('/api/auth/register', { email, username, password }),
  verifyEmail: (token) =>
    api.get(`/api/auth/verify-email?token=${token}`),
  me: () => api.get('/api/auth/me'),
};

export const articlesApi = {
  list: () => api.get('/api/articles/'),
  get: (slug) => api.get(`/api/articles/${slug}`),
  create: (data) => api.post('/api/articles/', data),
  update: (id, data) => api.put(`/api/articles/${id}`, data),
  remove: (id) => api.delete(`/api/articles/${id}`),
};

export const categoriesApi = {
  list: () => api.get('/api/categories/'),
};
