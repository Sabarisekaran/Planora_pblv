import apiClient from './api';

/**
 * Attendance API Service
 * Handles marking attendance and retrieving attendance data
 */

export const attendanceApi = {
  /**
   * Mark user as attended
   * POST /api/attendance/mark
   */
  markAttendance: async (programId: string, email: string) => {
    const response = await apiClient.post('/attendance/mark', {
      programId,
      email: email.toLowerCase(),
    });
    return response.data;
  },

  /**
   * Get all attended users for a program
   * GET /api/attendance/:programId
   */
  getAttendedUsers: async (programId: string) => {
    const response = await apiClient.get(`/attendance/${programId}`);
    return response.data;
  },

  /**
   * Get attendance status for a specific user
   * GET /api/attendance/:programId/status/:email
   */
  getAttendanceStatus: async (programId: string, email: string) => {
    const response = await apiClient.get(
      `/attendance/${programId}/status/${email.toLowerCase()}`
    );
    return response.data;
  },

  /**
   * Get attendance summary for a program
   * GET /api/attendance/:programId/summary
   */
  getAttendanceSummary: async (programId: string) => {
    const response = await apiClient.get(`/attendance/${programId}/summary`);
    return response.data;
  },
};

export default attendanceApi;
