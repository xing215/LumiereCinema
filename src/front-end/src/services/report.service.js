/**
 * Report Service
 * Handles all report-related API calls
 */
import axios from 'axios';
import { getApiUrl } from '@config/api.config';

export const reportService = {
    // Report endpoints (administrator/branchmanager)
    getBranches: async (authToken) => {
        const response = await axios.get(getApiUrl('reportBranches'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    getBranch: async (authToken) => {
        const response = await axios.get(getApiUrl('reportBranch'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    getRevenueSummary: async (queryParams, authToken) => {
        const response = await axios.get(getApiUrl('revenueSummary'), {
            params: queryParams,
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },
};
