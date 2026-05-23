import apiClient from './api';
import { publicApiClient } from '../api/publicApiClient';

/**
 * Registration API Service
 */

export const registrationApi = {
  /**
   * Register user for a program - PUBLIC (no auth required)
   * Used by QR codes and public registration forms
   */
  registerUser: async (data) => {
    const response = await publicApiClient.post('/registrations/register', data);
    return response.data;
  },

  /**
   * Check if user is registered - PUBLIC (no auth required)
   */
  checkRegistration: async (programId, email, phone = null) => {
    const params = {
      programId,
      ...(email && { email }),
      ...(phone && { phone }),
    };
    const response = await publicApiClient.get('/registrations/check', { params });
    return response.data;
  },

  /**
   * Get all registrations for a program
   */
  getProgramRegistrations: async (programId, status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/registrations/program/${programId}`, {
      params,
    });
    return response.data;
  },

  /**
   * Get attendance statistics
   */
  getAttendanceStats: async (programId) => {
    const response = await apiClient.get(`/registrations/stats/${programId}`);
    return response.data;
  },

  /**
   * Mark attendance - PUBLIC (no auth required)
   */
  markAttendance: async (data) => {
    const response = await publicApiClient.post('/registrations/attendance', data);
    return response.data;
  },

  /**
   * Get registration by ID
   */
  getRegistrationById: async (registrationId) => {
    const response = await apiClient.get(
      `/registrations/${registrationId}`
    );
    return response.data;
  },

  /**
   * Get all registrations (dashboard)
   */
  getAllRegistrations: async (filters = {}) => {
    const response = await apiClient.get('/registrations', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Create registration request (late registration)
   */
  createRegistrationRequest: async (data) => {
    const response = await apiClient.post(
      '/registrations/requests/create',
      data
    );
    return response.data;
  },

  /**
   * Get pending registration requests
   */
  getPendingRequests: async (programId) => {
    const response = await apiClient.get(
      `/registrations/requests/pending/${programId}`
    );
    return response.data;
  },

  /**
   * Approve registration request
   */
  approveRequest: async (requestId, userId) => {
    const response = await apiClient.post(
      `/registrations/requests/approve/${requestId}`,
      { userId }
    );
    return response.data;
  },

  /**
   * Reject registration request
   */
  rejectRequest: async (requestId, reason) => {
    const response = await apiClient.post(
      `/registrations/requests/reject/${requestId}`,
      { reason }
    );
    return response.data;
  },
};

export default registrationApi;
