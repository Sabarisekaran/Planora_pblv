import axios from 'axios';
import { getAuthToken } from './auth';

// API base URL - adjust this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/sub-organizers`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getAuthToken(); // Use the auth utility to get the correct token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sub Organizer API service
export const subOrganizerApi = {
  // Get all sub organizers (admin only)
  getAllSubOrganizers: async () => {
    return api.get('/');
  },

  // Get sub organizers by coordinator
  getSubOrganizersByCoordinator: async (coordinatorId) => {
    return api.get(`/coordinator/${coordinatorId}`);
  },

  // Get single sub organizer
  getSubOrganizerById: async (id) => {
    return api.get(`/${id}`);
  },

  // Create sub organizer
  createSubOrganizer: async (data) => {
    return api.post('/', data);
  },

  // Update sub organizer
  updateSubOrganizer: async (id, data) => {
    return api.put(`/${id}`, data);
  },

  // Delete sub organizer
  deleteSubOrganizer: async (id) => {
    return api.delete(`/${id}`);
  },
};

export default subOrganizerApi;
