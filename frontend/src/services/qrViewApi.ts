import apiClient from './api';

interface GenerateQRRequest {
  type: 'participant' | 'coordinator' | 'program';
  programId: string;
  registrationId?: string;
  coordinatorId?: string;
}

interface GenerateQRResponse {
  success: boolean;
  message: string;
  data: {
    qrId: string;
    type: string;
    programId: string;
    qrImage: string; // Base64 encoded image
    qrContent: string; // JSON string
    expiresAt: string;
  };
}

interface QRDataResponse {
  success: boolean;
  data: {
    type: 'participant' | 'coordinator' | 'program';
    programId: string;
    participant?: {
      name: string;
      email: string;
      branch: string;
      college: string;
    };
    coordinator?: {
      name: string;
      email: string;
      role: string;
      branch: string;
      phone: string;
    };
    program?: {
      name: string;
      date: string;
      location: string;
    };
  };
}

interface QRAnalyticsResponse {
  success: boolean;
  data: {
    programId: string;
    analytics: Array<{
      _id: string;
      total: number;
      totalScans: number;
      avgScans: number;
    }>;
  };
}

/**
 * QR View API Service
 * Handles QR code generation, retrieval, and analytics
 */
const qrViewApi = {
  /**
   * Generate a QR code with embedded data
   * @param type - Type of QR: 'participant', 'coordinator', or 'program'
   * @param programId - Program ID
   * @param registrationId - Registration ID (for participant QR)
   * @param coordinatorId - Coordinator ID (for coordinator QR)
   * @returns QR data with base64 image
   */
  generateQR: async (
    type: 'participant' | 'coordinator' | 'program',
    programId: string,
    registrationId?: string,
    coordinatorId?: string
  ): Promise<GenerateQRResponse> => {
    try {
      const payload: GenerateQRRequest = {
        type,
        programId,
        registrationId,
        coordinatorId,
      };

      const response = await apiClient.post<GenerateQRResponse>('/qr-data/generate', payload);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error generating QR:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Retrieve QR data by ID (called after scanning)
   * @param qrId - QR data ID from the scanned QR code
   * @returns QR data with participant/coordinator/program details
   */
  getQRData: async (qrId: string): Promise<QRDataResponse> => {
    try {
      const response = await apiClient.get<QRDataResponse>(`/qr-data/${qrId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error retrieving QR data:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get QR analytics for a program
   * @param programId - Program ID
   * @returns Analytics data: total QRs, total scans, average scans
   */
  getQRAnalytics: async (programId: string): Promise<QRAnalyticsResponse> => {
    try {
      const response = await apiClient.get<QRAnalyticsResponse>(`/qr-data/analytics/${programId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error retrieving QR analytics:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Format QR content for URL (encodes JSON to be URL-safe)
   * @param qrId - QR data ID
   * @param type - Type of QR
   * @param programId - Program ID
   * @returns URL-safe query string
   */
  formatQRContent: (qrId: string, type: string, programId: string): string => {
    const content = JSON.stringify({ id: qrId, type, programId });
    return encodeURIComponent(content);
  },

  /**
   * Generate QR view URL
   * @param qrId - QR data ID
   * @param type - Type of QR
   * @param programId - Program ID
   * @returns Complete URL for QR view page
   */
  getQRViewURL: (qrId: string, type: string, programId: string): string => {
    const content = qrViewApi.formatQRContent(qrId, type, programId);
    return `/qr-view?data=${content}`;
  },
};

export default qrViewApi;
