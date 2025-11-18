import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/api/users/register', userData),
  login: (credentials) => api.post('/api/users/login', credentials),
  getAllUsers: () => api.get('/api/users/'),
};

export const messageAPI = {
  getPrivateMessages: (userId) => api.get(`/api/messages/private/${userId}`),
};

export default api;
