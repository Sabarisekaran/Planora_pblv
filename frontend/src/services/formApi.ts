import axios from 'axios';
import { publicApiClient } from '@/api/publicApiClient';

const API_BASE_URL = `${window.location.origin}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Form API Calls
 */
export const formApi = {
  // Get form configuration - PUBLIC (no auth required)
  getForm: async (programId) => {
    const response = await publicApiClient.get(`/forms/${programId}`);
    return response.data;
  },

  // Create or update form
  saveForm: async (programId, formTitle, formDescription, fields) => {
    const response = await apiClient.post('/forms', {
      programId,
      formTitle,
      formDescription,
      fields,
    });
    return response.data;
  },

  // Add field
  addField: async (programId, field) => {
    const response = await apiClient.post(`/forms/${programId}/field`, { field });
    return response.data;
  },

  // Remove field
  removeField: async (programId, fieldId) => {
    const response = await apiClient.delete(`/forms/${programId}/field/${fieldId}`);
    return response.data;
  },
};

/**
 * Registration API Calls
 */
export const registrationApi = {
  // Submit registration - PUBLIC (no auth required)
  submitRegistration: async (programId, userIdentifier, answers, userDetails) => {
    const response = await publicApiClient.post('/registrations/register', {
      programId,
      userIdentifier,
      answers,
      userEmail: userDetails.email,
      userPhone: userDetails.phone,
      userName: userDetails.name,
      userRole: userDetails.role,
    });
    return response.data;
  },

  // Get all registrations for a program
  getRegistrations: async (programId, status = null) => {
    let url = `/registrations/responses/${programId}`;
    if (status) {
      url += `?status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get user's previous registration (for auto-fill)
  getPreviousRegistration: async (programId, userIdentifier) => {
    const response = await apiClient.get(`/registrations/responses/${programId}/${userIdentifier}`);
    return response.data;
  },

  // Check registration status - PUBLIC (no auth required)
  checkStatus: async (programId, userIdentifier) => {
    const response = await publicApiClient.get(
      `/requests/${programId}/${userIdentifier}/status`
    );
    return response.data;
  },
};

/**
 * Approval Request API Calls
 */
export const approvalApi = {
  // Create approval request - PUBLIC (no auth required)
  // Used when user tries to register after deadline
  createRequest: async (
    programId,
    userIdentifier,
    formAnswers,
    userDetails,
    requestReason = ''
  ) => {
    const response = await publicApiClient.post('/requests/create', {
      programId,
      userIdentifier,
      userData: userDetails,
      userEmail: userDetails.email,
      userPhone: userDetails.phone,
      userName: userDetails.name,
      userRole: userDetails.role,
      formAnswers,
      requestReason,
    });
    return response.data;
  },

  // Get pending requests
  getPendingRequests: async (programId) => {
    const response = await apiClient.get(`/requests/pending/${programId}`);
    return response.data;
  },

  // Approve request
  approveRequest: async (requestId, reviewNotes, reviewedBy) => {
    const response = await apiClient.post(`/requests/${requestId}/approve`, {
      reviewNotes,
      reviewedBy,
    });
    return response.data;
  },

  // Reject request
  rejectRequest: async (requestId, reviewNotes, reviewedBy) => {
    const response = await apiClient.post(`/requests/${requestId}/reject`, {
      reviewNotes,
      reviewedBy,
    });
    return response.data;
  },
};

export default apiClient;
