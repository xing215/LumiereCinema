/**
 * Promotion Service
 * Handles all promotion-related API calls
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

export const promotionService = {
    // Public promotion endpoints
    getPromotionBanner: async () => {
        const response = await axios.get(getApiUrl('promotionBanner'));
        return response.data;
    },

    getPublicPromotions: async (authToken = null) => {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const response = await axios.get(getApiUrl('publicPromotions'), { headers });
        return response.data;
    },

    // Admin promotion management (administrator only)
    getAllPromotions: async (authToken) => {
        const response = await axios.get(getApiUrl('adminPromotions'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    getPromotionDetails: async (promotionCode, authToken) => {
        const response = await axios.get(getApiUrlWithParams('adminPromotionDetails', { promotionCode }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    createPromotion: async (promotionData, authToken) => {
        const response = await axios.post(getApiUrl('createPromotion'), promotionData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    updatePromotion: async (promotionCode, promotionData, authToken) => {
        const response = await axios.patch(getApiUrlWithParams('adminPromotionDetails', { promotionCode }), promotionData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    deletePromotion: async (promotionCode, authToken) => {
        const response = await axios.delete(getApiUrlWithParams('adminPromotionDetails', { promotionCode }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },
};
