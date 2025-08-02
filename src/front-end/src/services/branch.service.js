/**
 * Branch Service
 * Handles all branch-related API calls
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

export const branchService = {
  // Public branch endpoints
  getAvailableBranches: async () => {
    const response = await axios.get(getApiUrl('availableBranches'));
    return response.data;
  },

  getBranchDetails: async (branchId) => {
    const response = await axios.get(getApiUrlWithParams('branchDetails', { branchId }));
    return response.data;
  },

  getBranchSnacks: async (branchId) => {
    const response = await axios.get(getApiUrlWithParams('branchSnacks', { branchId }));
    return response.data;
  },

  // Branch snack management (branchmanager only)
  createBranchSnack: async (branchId, snackData, authToken) => {
    const response = await axios.post(getApiUrlWithParams('createBranchSnack', { branchId }), snackData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  editBranchSnack: async (branchId, snackId, snackData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('editBranchSnack', { branchId, snackId }), snackData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  deleteBranchSnack: async (branchId, snackId, authToken) => {
    const response = await axios.delete(getApiUrlWithParams('deleteBranchSnack', { branchId, snackId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  // Branch schedule management (branchmanager only)
  getBranchSchedules: async (branchId, queryParams = {}, authToken) => {
    const response = await axios.get(getApiUrlWithParams('branchSchedules', { branchId }), {
      params: queryParams,
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  createBranchSchedule: async (branchId, scheduleData, authToken) => {
    const response = await axios.post(getApiUrlWithParams('branchSchedules', { branchId }), scheduleData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  editBranchSchedule: async (branchId, scheduleId, scheduleData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('editBranchSchedule', { branchId, scheduleId }), scheduleData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  deleteBranchSchedule: async (branchId, scheduleId, authToken) => {
    const response = await axios.delete(getApiUrlWithParams('deleteBranchSchedule', { branchId, scheduleId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  // Branch screen management (branchmanager only)
  getBranchScreens: async (branchId, authToken) => {
    const response = await axios.get(getApiUrlWithParams('branchScreens', { branchId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  createBranchScreen: async (branchId, screenData, authToken) => {
    const response = await axios.post(getApiUrlWithParams('branchScreens', { branchId }), screenData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  getBranchScreenDetails: async (branchId, screenId, authToken) => {
    const response = await axios.get(getApiUrlWithParams('branchScreenDetails', { branchId, screenId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateBranchScreen: async (branchId, screenId, screenData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('branchScreenDetails', { branchId, screenId }), screenData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  deleteBranchScreen: async (branchId, screenId, authToken) => {
    const response = await axios.delete(getApiUrlWithParams('branchScreenDetails', { branchId, screenId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  }
};
