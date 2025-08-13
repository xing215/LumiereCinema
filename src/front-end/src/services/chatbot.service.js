/**
 * Chatbot Service
 * Handles all chatbot-related API calls
 */
import axios from 'axios';
import { getApiUrl } from '@config/api.config';

export const chatbotService = {
    // Chatbot endpoints
    sendQuery: async (queryData, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.post(getApiUrl('chatbotQuery'), queryData, config);
        return response.data;
    },
};
