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

  getBranchDetails: async (branchId, authToken) => {
    const response = await axios.get(getApiUrlWithParams('branchDetails', { branchId }),
          {headers: { Authorization: `Bearer ${authToken}` }}
    );
    return response.data;
  },

  getBranchSnacks: async (branchId, authToken = null) => {
    const config = authToken ? {
      headers: { Authorization: `Bearer ${authToken}` }
    } : {};
    const response = await axios.get(getApiUrlWithParams('branchSnacks', { branchId }), config);
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
    console.log('🌐 [branchService.getBranchScreens] Starting API call');
    console.log('🏢 [branchService.getBranchScreens] branchId:', branchId);
    console.log('🔑 [branchService.getBranchScreens] authToken available:', !!authToken);
    
    const url = getApiUrlWithParams('branchScreens', { branchId });
    console.log('🔗 [branchService.getBranchScreens] URL:', url);
    
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ [branchService.getBranchScreens] Response received:', response);
      console.log('📊 [branchService.getBranchScreens] Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [branchService.getBranchScreens] API call failed:', error);
      console.error('🔍 [branchService.getBranchScreens] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
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
  },

  // Branch seat management (branchmanager only)
  getScreenSeats: async (branchId, screenId, authToken) => {
    const response = await axios.get(getApiUrlWithParams('screenSeats', { branchId, screenId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  createSeat: async (branchId, screenId, seatData, authToken) => {
    const response = await axios.post(getApiUrlWithParams('screenSeats', { branchId, screenId }), seatData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  bulkCreateSeats: async (branchId, screenId, seatsData, authToken) => {
    const response = await axios.post(getApiUrlWithParams('bulkCreateSeats', { branchId, screenId }), seatsData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  updateSeat: async (branchId, screenId, seatId, seatData, authToken) => {
    const response = await axios.patch(getApiUrlWithParams('screenSeatDetails', { branchId, screenId, seatId }), seatData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  },

  deleteSeat: async (branchId, screenId, seatId, authToken) => {
    const response = await axios.delete(getApiUrlWithParams('screenSeatDetails', { branchId, screenId, seatId }), {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  }
};
