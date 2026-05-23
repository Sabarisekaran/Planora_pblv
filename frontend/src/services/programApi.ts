import apiClient from './api';
import { publicApiClient } from '../api/publicApiClient';

/**
 * Program API Service
 */

const normalizeProgramResponse = (payload) => {
  if (payload?.success && payload?.data) {
    return payload;
  }

  return {
    success: true,
    data: payload,
  };
};

export const programApi = {
  /**
   * Get program by ID
   */
  getProgramById: async (programId) => {
    const response = await apiClient.get(`/programs/${programId}`);
    return normalizeProgramResponse(response.data);
  },

  /**
   * Get public program by ID for QR routes - PUBLIC (no auth required)
   * Used by registration forms opened from QR codes
   */
  getPublicProgramById: async (programId) => {
    const response = await publicApiClient.get(`/programs/public/${programId}`);
    return normalizeProgramResponse(response.data);
  },

  /**
   * Get all programs
   */
  getAllPrograms: async (filters = {}) => {
    const response = await apiClient.get('/programs', { params: filters });
    return response.data;
  },

  /**
   * Create program
   */
  createProgram: async (data) => {
    const response = await apiClient.post('/programs', data);
    return response.data;
  },

  /**
   * Update program
   */
  updateProgram: async (programId, data) => {
    const response = await apiClient.put(`/programs/${programId}`, data);
    return response.data;
  },

  /**
   * Delete program
   */
  deleteProgram: async (programId) => {
    const response = await apiClient.delete(`/programs/${programId}`);
    return response.data;
  },

  /**
   * Get programs by type
   */
  getProgramsByType: async (type) => {
    const response = await apiClient.get('/programs/type/' + type);
    return response.data;
  },
};

export default programApi;
