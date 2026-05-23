import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const mainEventApi = {
  // Get all main events for a program
  getMainEvents: async (programId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/main-events/program/${programId}`);
      return response;
    } catch (error) {
      console.error('Error fetching main events:', error);
      throw error;
    }
  },

  // Add a new main event
  addMainEvent: async (programId, mainEventName, template = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/main-events/add`, {
        programId,
        mainEventName,
        template
      });
      return response;
    } catch (error) {
      console.error('Error adding main event:', error);
      throw error;
    }
  },

  // Duplicate a main event
  duplicateMainEvent: async (programId, mainEventId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/main-events/duplicate`, {
        programId,
        mainEventId
      });
      return response;
    } catch (error) {
      console.error('Error duplicating main event:', error);
      throw error;
    }
  },

  // Update a main event
  updateMainEvent: async (programId, mainEventId, updateData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/main-events/${mainEventId}/program/${programId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error('Error updating main event:', error);
      throw error;
    }
  },

  // Delete a main event
  deleteMainEvent: async (programId, mainEventId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/main-events/delete`, {
        data: {
          programId,
          mainEventId
        }
      });
      return response;
    } catch (error) {
      console.error('Error deleting main event:', error);
      throw error;
    }
  },

  // Set active main event
  setActiveMainEvent: async (programId, mainEventId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/main-events/set-active`, {
        programId,
        mainEventId
      });
      return response;
    } catch (error) {
      console.error('Error setting active main event:', error);
      throw error;
    }
  }
};

export default mainEventApi;
