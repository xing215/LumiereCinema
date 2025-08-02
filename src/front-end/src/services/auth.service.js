/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

/**
 * User Authentication
 */
export const authService = {
  // Public auth routes
  login: async (credentials) => {
    const response = await axios.post(getApiUrl('login'), credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(getApiUrl('register'), userData);
    return response.data;
  },

  activateAccount: async (token) => {
    const response = await axios.post(getApiUrlWithParams('activateAccount', { token }));
    return response.data;
  },

  logout: async (authToken) => {
    const response = await axios.post(getApiUrl('logout'), {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  changePassword: async (passwordData, authToken) => {
    const response = await axios.post(getApiUrl('changePassword'), passwordData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(getApiUrl('forgotPassword'), { email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await axios.post(getApiUrl('resetPassword'), resetData);
    return response.data;
  },

  // Staff authentication
  staffLogin: async (credentials) => {
    const response = await axios.post(getApiUrl('staffLogin'), credentials);
    return response.data;
  },

  staffForgotPassword: async (email) => {
    const response = await axios.post(getApiUrl('staffForgotPassword'), { email });
    return response.data;
  }
};
