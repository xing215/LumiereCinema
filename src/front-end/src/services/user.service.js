/**
 * User Service
 * Handles all user-related API calls (customer actions)
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

export const userService = {
    // Profile management
    getProfile: async (authToken) => {
        const response = await axios.get(getApiUrl('userProfile'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    updateProfile: async (profileData, authToken) => {
        const response = await axios.patch(getApiUrl('userProfile'), profileData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // Movie rating system
    rateMovie: async (ratingData, authToken) => {
        const response = await axios.post(getApiUrl('rateMovie'), ratingData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    getUserRating: async (movieId, authToken) => {
        const response = await axios.get(getApiUrlWithParams('getUserRating', { movieId }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // Wishlist management
    getWishlist: async (authToken) => {
        const response = await axios.get(getApiUrl('wishlist'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    addToWishlist: async (movieId, authToken) => {
        const response = await axios.post(
            getApiUrlWithParams('addToWishlist', { movieId }),
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        return response.data;
    },

    removeFromWishlist: async (movieId, authToken) => {
        const response = await axios.delete(getApiUrlWithParams('removeFromWishlist', { movieId }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // Watch history
    getWatchHistory: async (authToken) => {
        const response = await axios.get(getApiUrl('watchHistory'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    removeFromWatchHistory: async (ticketId, authToken) => {
        const response = await axios.delete(getApiUrlWithParams('removeFromWatchHistory', { ticketId }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    // User tickets
    getUserTickets: async (authToken) => {
        const response = await axios.get(getApiUrl('userTickets'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },
};
