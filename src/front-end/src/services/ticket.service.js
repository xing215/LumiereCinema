/**
 * Ticket Service
 * Handles all ticket-related API calls
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

export const ticketService = {
    // General ticket operations
    getSchedulesByBranch: async (branchId, queryParams = {}, authToken = null) => {
        const config = authToken
            ? {
                  params: queryParams,
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : { params: queryParams };

        const response = await axios.get(getApiUrlWithParams('schedulesByBranch', { branchId }), config);
        return response.data;
    },

    getSeatMapBySchedule: async (scheduleId, queryParams = {}, authToken = null) => {
        const config = authToken
            ? {
                  params: queryParams,
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : { params: queryParams };

        const response = await axios.get(getApiUrlWithParams('seatMapBySchedule', { scheduleId }), config);
        return response.data;
    },

    createTicket: async (ticketData, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.post(getApiUrl('createTicket'), ticketData, config);
        return response.data;
    },

    calculateDiscountedTotal: async (calculationData, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.post(getApiUrl('calculateDiscountedTotal'), calculationData, config);
        return response.data;
    },

    // Movie ticket specific
    holdSeats: async (holdData, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.post(getApiUrl('holdSeats'), holdData, config);
        return response.data;
    },

    manageSeatHold: async (managementData, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.patch(getApiUrl('manageSeatHold'), managementData, config);
        return response.data;
    },

    bulkReleaseSeatHolds: async (releaseData, authToken = null) => {
        const config = authToken
            ? {
                  data: releaseData,
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : { data: releaseData };

        const response = await axios.delete(getApiUrl('bulkReleaseSeatHolds'), config);
        return response.data;
    },

    cleanupExpiredHolds: async (authToken) => {
        const response = await axios.post(
            getApiUrl('cleanupExpiredHolds'),
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        return response.data;
    },

    // Movie ticket admin operations
    getAllMovieTickets: async (authToken) => {
        const response = await axios.get(getApiUrl('allMovieTickets'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    getMovieTicketDetails: async (ticketCode, authToken) => {
        const response = await axios.get(getApiUrlWithParams('movieTicketDetails', { ticketCode }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    updateMovieTicket: async (ticketCode, ticketData, authToken) => {
        const response = await axios.patch(getApiUrlWithParams('movieTicketDetails', { ticketCode }), ticketData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    deleteMovieTicket: async (ticketCode, authToken) => {
        const response = await axios.delete(getApiUrlWithParams('movieTicketDetails', { ticketCode }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // Snack ticket operations
    getSnacksByBranch: async (branchId, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.get(getApiUrlWithParams('snacksByBranch', { branchId }), config);
        return response.data;
    },

    getAllSnackTickets: async (authToken) => {
        const response = await axios.get(getApiUrl('allSnackTickets'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    getSnackTicketDetails: async (ticketCode, authToken) => {
        const response = await axios.get(getApiUrlWithParams('snackTicketDetails', { ticketCode }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    updateSnackTicket: async (ticketCode, ticketData, authToken) => {
        const response = await axios.patch(getApiUrlWithParams('snackTicketDetails', { ticketCode }), ticketData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    deleteSnackTicket: async (ticketCode, authToken) => {
        const response = await axios.delete(getApiUrlWithParams('snackTicketDetails', { ticketCode }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // Cache management (administrator only)
    getCacheStats: async (authToken) => {
        const response = await axios.get(getApiUrl('cacheStats'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    cleanupCache: async (authToken) => {
        const response = await axios.post(
            getApiUrl('cleanupCache'),
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        return response.data;
    },

    preloadCache: async (preloadData, authToken) => {
        const response = await axios.post(getApiUrl('preloadCache'), preloadData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // Check-in functionality (updates ticket status to 'CheckedIn')
    checkinTicket: async (ticketCode, authToken) => {
        const response = await axios.patch(
            getApiUrlWithParams('movieTicketDetails', { ticketCode }),
            { status: 'CheckedIn' },
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        return response.data;
    },

    // Update ticket status for both movie and snack tickets
    updateTicketStatus: async (ticketCode, status, authToken) => {
        // First try to update as movie ticket
        try {
            const response = await axios.patch(
                getApiUrlWithParams('movieTicketDetails', { ticketCode }),
                { status },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            return response.data;
        } catch (movieError) {
            // If movie ticket update fails, try snack ticket
            try {
                const response = await axios.patch(
                    getApiUrlWithParams('snackTicketDetails', { ticketCode }),
                    { status },
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    },
                );
                return response.data;
            } catch (snackError) {
                // If both fail, throw the original movie error
                throw movieError;
            }
        }
    },
};
