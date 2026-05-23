import axios from 'axios';
import { getApiURL } from '@/utils/baseUrl';

const API_BASE = getApiURL();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const requestUrl = config.baseURL || config.url || '';
  if (requestUrl.includes('ngrok-free.dev') || requestUrl.includes('ngrok-free.app') || requestUrl.includes('.ngrok.')) {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }

  const token = localStorage.getItem('authToken') || localStorage.getItem('coordinatorToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registrationApi = {
  // Submit registration
  submitRegistration: async (data: any) => {
    try {
      const response = await api.post('/registrations/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit registration');
    }
  },

  // Check duplicate registration
  checkDuplicate: async (programId: string, email: string) => {
    try {
      const response = await api.get(`/registrations/check`, {
        params: { programId, email }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error checking registration');
    }
  },

  // Get registrations for a program
  getRegistrations: async (programId: string) => {
    try {
      const response = await api.get(`/registrations/program/${programId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch registrations');
    }
  },

  // Mark attendance
  markAttendance: async (programId: string, email: string) => {
    try {
      const response = await api.post('/registrations/attendance', {
        programId,
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  },

  // Get approval requests
  getApprovalRequests: async (programId?: string) => {
    try {
      const params = programId ? { programId } : {};
      const response = await api.get('/registrations/requests', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch requests');
    }
  },

  // Approve/reject request
  updateRequestStatus: async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await api.put(`/registrations/requests/${requestId}`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update request');
    }
  },
};

export const programApi = {
  // Get program by ID
  getProgram: async (programId: string) => {
    try {
      const response = await api.get(`/programs/${programId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch program');
    }
  },

  // Get all programs
  getPrograms: async () => {
    try {
      const response = await api.get('/programs');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch programs');
    }
  },

  // Generate QR codes
  generateQRs: async (programId: string) => {
    try {
      const response = await api.get(`/programs/${programId}/qr`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate QR codes');
    }
  },
};

export const attendanceApi = {
  // Check registration for attendance
  checkRegistration: async (programId: string, email: string) => {
    try {
      const response = await api.get(`/attendance/check`, {
        params: { programId, email }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration not found');
    }
  },

  // Mark attendance
  markAttendance: async (programId: string, email: string) => {
    try {
      const response = await api.post('/attendance/mark', {
        programId,
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  },
};

export default api;
