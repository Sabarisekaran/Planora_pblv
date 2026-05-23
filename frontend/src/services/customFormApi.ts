import apiClient from '@/api/apiClient';

/**
 * Custom Forms API
 */
export const customFormApi = {
  // Create new form
  createForm: async (title, description, fields = [], programId = null) => {
    const response = await apiClient.post('/custom-forms', {
      title,
      description,
      fields,
      programId,
    });
    return response.data;
  },

  // Get all forms (user's forms)
  getAllForms: async () => {
    const response = await apiClient.get('/custom-forms');
    return response.data;
  },

  // Get single form (public)
  getForm: async (formId) => {
    const response = await apiClient.get(`/custom-forms/${formId}`);
    return response.data;
  },

  // Update form
  updateForm: async (formId, title, description, fields, isPublished) => {
    const response = await apiClient.put(`/custom-forms/${formId}`, {
      title,
      description,
      fields,
      isPublished,
    });
    return response.data;
  },

  // Delete form
  deleteForm: async (formId) => {
    const response = await apiClient.delete(`/custom-forms/${formId}`);
    return response.data;
  },

  // Add field to form
  addField: async (formId, label, type, required, placeholder, options) => {
    const response = await apiClient.post(`/custom-forms/${formId}/add-field`, {
      label,
      type,
      required,
      placeholder,
      options,
    });
    return response.data;
  },

  // Remove field from form
  removeField: async (formId, fieldId) => {
    const response = await apiClient.delete(`/custom-forms/${formId}/field/${fieldId}`);
    return response.data;
  },
};

/**
 * Form Responses API
 */
export const responseApi = {
  // Submit form response
  submitResponse: async (formId, answers, userEmail) => {
    const response = await apiClient.post('/responses', {
      formId,
      answers,
      userEmail,
    });
    return response.data;
  },

  // Get all responses for a form
  getResponses: async (formId) => {
    const response = await apiClient.get(`/responses/${formId}`);
    return response.data;
  },

  // Get single response
  getResponse: async (formId, responseId) => {
    const response = await apiClient.get(`/responses/${formId}/${responseId}`);
    return response.data;
  },

  // Delete response
  deleteResponse: async (responseId) => {
    const response = await apiClient.delete(`/responses/${responseId}`);
    return response.data;
  },

  // Get form statistics
  getStats: async (formId) => {
    const response = await apiClient.get(`/responses/${formId}/stats`);
    return response.data;
  },

  // Get forms for a specific program (public - no auth needed)
  getFormsByProgram: async (programId) => {
    const response = await apiClient.get(`/custom-forms/program/${programId}`);
    return response.data;
  },

  // Get user's forms, optionally filtered by program
  getFormsByUser: async (programId = null) => {
    let url = '/custom-forms';
    if (programId) {
      url += `?programId=${programId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },
};

export default apiClient;
