/**
 * Admin Service
 * Handles all admin-related API calls
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

export const adminService = {
  // Admin user management (administrator only)
  getAllUsers: async (authToken) => {
    const response = await axios.get(getApiUrl('adminUsers'), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  createUser: async (userData, authToken) => {
    const response = await axios.post(getApiUrl('adminUsers'), userData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  getUserDetails: async (userId, authToken) => {
    const response = await axios.get(getApiUrlWithParams('adminUserDetails', { userId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateUserDetails: async (userId, userData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('adminUserDetails', { userId }), userData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  deleteUser: async (userId, authToken) => {
    const response = await axios.delete(getApiUrlWithParams('adminUserDetails', { userId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateUserRoles: async (userId, rolesData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('adminUserRoles', { userId }), rolesData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateUserStatus: async (userId, statusData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('adminUserStatus', { userId }), statusData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  // Admin branch management (administrator only)
  getAllBranches: async (authToken) => {
    const response = await axios.get(getApiUrl('adminBranches'), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  createBranch: async (branchData, authToken) => {
    const response = await axios.post(getApiUrl('adminBranches'), branchData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateBranch: async (branchId, branchData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('adminBranchDetails', { branchId }), branchData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  deleteBranch: async (branchId, authToken) => {
    const response = await axios.delete(getApiUrlWithParams('adminBranchDetails', { branchId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateBranchStatus: async (branchId, statusData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('adminBranchStatus', { branchId }), statusData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  }
};
