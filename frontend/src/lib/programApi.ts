import apiClient from '@/api/apiClient';

/**
 * Program API Service
 * 
 * This service uses the enhanced apiClient that automatically:
 * - Adds JWT token to all requests via interceptor
 * - Handles 401 (unauthorized) responses
 * - Provides debugging for 403 (forbidden) errors
 * - Logs requests/responses in development mode
 */

// Program API service
export const programApi = {
  // Create a new program with image
  createProgram: async (programData, logoFile) => {
    const formData = new FormData();

    // Add all form fields
    const sentFields: Record<string, string> = {};
    Object.keys(programData).forEach((key) => {
      if (key !== 'eventLogo' && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        if (typeof programData[key] === 'object' && programData[key] !== null) {
          formData.append(key, JSON.stringify(programData[key]));
          sentFields[key] = `[Object: ${Object.keys(programData[key]).length} keys]`;
        } else {
          formData.append(key, programData[key]);
          sentFields[key] = String(programData[key]).substring(0, 50);
        }
      }
    });

    // Debug: Log all fields being sent
    console.log('📨 SENDING TO API:');
    Object.entries(sentFields).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // Debug: Log selectedCoordinatorId
    if (programData.selectedCoordinatorId) {
      console.log('🔗 Coordinator Assignment:', {
        coordinatorId: programData.selectedCoordinatorId,
        coordinatorName: programData.organizerName,
      });
    } else {
      console.log('ℹ️ No coordinator assigned (programs will be available to all admins)');
    }

    // Add logo file if provided
    if (logoFile) {
      formData.append('eventLogo', logoFile);
      console.log('📸 Logo file:', logoFile.name, `(${logoFile.size} bytes)`);
    }
    
    try {
      const response = await apiClient.post('/programs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Program created successfully');
      return response;
    } catch (error) {
      console.error('❌ Error creating program:', error);
      throw error;
    }
  },

  // Get all programs with optional filters
  getAllPrograms: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    return apiClient.get(`/programs?${params.toString()}`);
  },

  // Get single program by ID
  getProgramById: async (id) => {
    return apiClient.get(`/programs/${id}`);
  },

  // Update program
  updateProgram: async (id, programData, logoFile) => {
    const formData = new FormData();

    // Create a clean copy with ONLY allowed fields
    const allowedFields = [
      'eventName', 'eventType', 'eventStructure', 'subEvents', 'enableSubEvents',
      'programCategory', 'startDate', 'endDate', 'time', 'isMultiDay',
      'venueName', 'location', 'isOnline', 'meetingLink', 'organizerName',
      'department', 'contactEmail', 'contactPhone', 'selectedCoordinatorId',
      'useDefaultVenueLocation', 'defaultVenueName', 'defaultLocation',
      'themeColor', 'themeType', 'gradientType', 'gradientStartColor',
      'gradientEndColor', 'gradientAngle', 'automation', 'status', 'progress',
      'assignedSubOrganizers'
    ];
    
    const cleanedData = {};
    allowedFields.forEach(field => {
      if (field in programData) {
        cleanedData[field] = programData[field];
      }
    });

    // Add only cleaned fields to FormData
    Object.keys(cleanedData).forEach((key) => {
      if (key !== 'eventLogo') {
        if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
          formData.append(key, JSON.stringify(cleanedData[key]));
        } else {
          formData.append(key, cleanedData[key]);
        }
      }
    });

    // Add logo file if provided
    if (logoFile) {
      formData.append('eventLogo', logoFile);
    }

    return apiClient.put(`/programs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete program
  deleteProgram: async (id) => {
    return apiClient.delete(`/programs/${id}`);
  },

  // Publish/activate program
  publishProgram: async (id) => {
    return apiClient.patch(`/programs/${id}/publish`);
  },

  // Get programs by event type
  getProgramsByEventType: async (eventType, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    return apiClient.get(`/programs/type/${eventType}?${params.toString()}`);
  },

  // Upload additional image
  uploadProgramImage: async (programId, imageFile, imageName) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (imageName) {
      formData.append('imageName', imageName);
    }

    return apiClient.post(`/programs/${programId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get program images
  getProgramImages: async (programId) => {
    return apiClient.get(`/programs/${programId}/images`);
  },

  // Delete program image
  deleteProgramImage: async (programId, fileName) => {
    return apiClient.delete(`/programs/${programId}/images/${fileName}`);
  },
};

export default programApi;
