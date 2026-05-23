import apiClient from '@/api/apiClient';
import QRCode from 'qrcode';
import { getQRURL } from '@/utils/baseUrl';

/**
 * QR API Service
 * Handles all QR code generation and retrieval for programs
 */

const getFrontendPublicURL = () => {
  const publicUrl = import.meta.env.VITE_PUBLIC_URL?.trim();
  if (publicUrl && !publicUrl.includes('localhost') && !publicUrl.includes('127.0.0.1')) {
    return publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
  }
  return undefined;
};

const buildQRPayload = async (programId, type = 'registration', subEventId = null) => {
  const path = type === 'create-program'
    ? '/create-program'
    : type === 'attendance'
      ? `/attendance/${programId}`
      : `/form/${programId}`;
  const targetUrl = getQRURL(path);

  return {
    success: true,
    type,
    data: {
      programId,
      ...(subEventId ? { subEventId } : {}),
      ...(type === 'create-program'
        ? { createProgramLink: targetUrl }
        : type === 'attendance'
          ? { attendanceLink: targetUrl }
          : { registrationLink: targetUrl }),
    },
    qrImage: await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }),
    timestamp: new Date().toISOString(),
    generatedLocally: true,
  };
};

const qrApi = {
  /**
   * Generate a QR code for a program (registration or attendance)
   * @param {string} programId - Program ID
   * @param {string} type - Type of QR: 'registration' or 'attendance'
   * @param {string} subEventId - Sub-event ID (required for registration type)
   */
  generateQR: async (programId, type = 'registration', subEventId = null) => {
    try {
      const params = { programId, type };
      if (subEventId && type === 'registration') {
        params.subEventId = subEventId;
      }

      console.log('📱 Generating QR code:', { type, programId, subEventId });
      const frontendPublicURL = getFrontendPublicURL();
      const response = await apiClient.get('/qr/generate', {
        params,
        headers: frontendPublicURL
          ? {
              'x-frontend-url': frontendPublicURL,
            }
          : undefined,
      });
      console.log('✅ QR code generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error generating QR:', error);
      const fallbackQR = await buildQRPayload(programId, type, subEventId);
      console.warn('⚠️ Falling back to client-side QR generation:', {
        type,
        programId,
        subEventId,
        generatedLocally: true,
      });
      return fallbackQR;
    }
  },

  /**
   * Get all QR codes for a specific program
   * @param {string} programId - Program ID
   */
  getProgramQRs: async (programId) => {
    try {
      console.log('📋 Fetching QRs for program:', programId);
      const response = await apiClient.get(`/qr/program/${programId}`);
      console.log('✅ QRs fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching program QRs:', error);
      throw error;
    }
  },

  /**
   * Get all programs with QR generation enabled
   */
  getQREnabledPrograms: async () => {
    try {
      console.log('📡 Fetching QR-enabled programs...');
      const response = await apiClient.get('/qr/programs');
      console.log('✅ QR-enabled programs fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching QR-enabled programs:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  getEvents: async () => {
    try {
      const response = await apiClient.get('/programs');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getSubEvents: async (eventId) => {
    try {
      const response = await apiClient.get(`/programs/${eventId}`);
      return response.data.subEvents || [];
    } catch (error) {
      console.error('Error fetching sub-events:', error);
      throw error;
    }
  },

  generateRegistrationQR: async (eventId, subEventId) => {
    return qrApi.generateQR(eventId, 'registration', subEventId);
  },

  generateAttendanceQR: async (eventId) => {
    return qrApi.generateQR(eventId, 'attendance');
  }
};

export default qrApi;
