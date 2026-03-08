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

// Handle standardized API response format
api.interceptors.response.use(
  (response) => {
    // If the response follows the standardized format, return the 'data' field
    if (response.data && response.data.status === true) {
      // Replace response.data with the actual payload for easier consumption
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  (error) => {
    // If the error response follows the standardized format, extract the message
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/api/users/register', userData),
  login: (credentials) => api.post('/api/users/login', credentials),
  verifyEmail: (data) => api.post('/api/users/verify-email', data),
  resendCode: (email) => api.post('/api/users/resend-code', { email }),
  getAllUsers: () => api.get('/api/users/'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  deleteAccount: () => api.delete('/api/users/delete-account'),
};

export const messageAPI = {
  getPrivateMessages: (userId) => api.get(`/api/messages/private/${userId}`),
  getChatMessages: (chatId) => api.get(`/api/messages/chat/${chatId}`),
  getConversations: () => api.get('/api/messages/conversations'),
  createGroup: (groupData) => api.post('/api/messages/groups', groupData),
  leaveGroup: (chatId) => api.post(`/api/messages/groups/${chatId}/leave`),
  setConversationPin: (type, targetId, pinned) => api.patch('/api/messages/conversations/pin', { type, targetId, pinned }),
  deleteConversation: (type, targetId) => api.delete('/api/messages/conversations', { data: { type, targetId } }),
  uploadFiles: (formData) => api.post('/api/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMessage: (messageId, option) => api.post(`/api/messages/${messageId}/delete`, { option }),
};

export const storyAPI = {
  getStories: () => api.get('/api/stories'),
  uploadStory: (formData) => api.post('/api/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  viewStory: (storyId) => api.post(`/api/stories/${storyId}/view`),
  deleteStory: (storyId) => api.delete(`/api/stories/${storyId}`),
};



export default api;
