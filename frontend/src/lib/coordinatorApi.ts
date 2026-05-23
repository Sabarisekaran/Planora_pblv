import axios from 'axios';
import { getAuthToken } from './auth';

// API base URL - adjust this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/coordinators`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const requestUrl = config.baseURL || config.url || '';
  if (requestUrl.includes('ngrok-free.dev') || requestUrl.includes('ngrok-free.app') || requestUrl.includes('.ngrok.')) {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }

  const token = getAuthToken(); // Use the auth utility to get the correct token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Coordinator API service
export const coordinatorApi = {
  // Get all coordinators
  getAllCoordinators: async () => {
    return api.get('/');
  },

  // Get current coordinator
  getCurrentCoordinator: async () => {
    return api.get('/me');
  },

  // Get single coordinator
  getCoordinatorById: async (id) => {
    return api.get(`/${id}`);
  },

  // Create coordinator (admin only)
  createCoordinator: async (data) => {
    return api.post('/', data);
  },

  // Update coordinator
  updateCoordinator: async (id, data) => {
    return api.put(`/${id}`, data);
  },

  // Delete coordinator
  deleteCoordinator: async (id) => {
    return api.delete(`/${id}`);
  },

  // Coordinator login
  coordinatorLogin: async (email, password) => {
    return api.post('/login', { email, password });
  },
};

export default coordinatorApi;
