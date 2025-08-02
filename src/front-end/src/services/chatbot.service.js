/**
 * Chatbot Service
 * Handles all chatbot-related API calls
 */
import axios from 'axios';
import { getApiUrl } from '@config/api.config';

export const chatbotService = {
  // Chatbot endpoints
  sendQuery: async (queryData) => {
    const response = await axios.post(getApiUrl('chatbotQuery'), queryData);
    return response.data;
  }
};
