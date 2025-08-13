/**
 * Movie Service
 * Handles all movie-related API calls
 */
import axios from 'axios';
import { getApiUrl, getApiUrlWithParams } from '@config/api.config';

export const movieService = {
    // Public movie endpoints
    getNowShowingMovies: async () => {
        const response = await axios.get(getApiUrl('nowShowingMovies'));
        return response.data;
    },

    getUpcomingMovies: async () => {
        const response = await axios.get(getApiUrl('upcomingMovies'));
        return response.data;
    },

    searchMovies: async (searchParams) => {
        const response = await axios.get(getApiUrl('searchMovies'), { params: searchParams });
        return response.data;
    },

    getMovieDetails: async (movieId) => {
        const response = await axios.get(getApiUrlWithParams('movieDetails', { movieId }));
        return response.data;
    },

    getMovieShowtimes: async (movieId, queryParams = {}, authToken = null) => {
        const config = authToken
            ? {
                  params: queryParams,
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : { params: queryParams };

        const response = await axios.get(getApiUrlWithParams('movieShowtimes', { movieId }), config);
        return response.data;
    },

    getMovieRatings: async (movieId, authToken = null) => {
        const config = authToken
            ? {
                  headers: { Authorization: `Bearer ${authToken}` },
              }
            : {};

        const response = await axios.get(getApiUrlWithParams('movieRatings', { movieId }), config);
        return response.data;
    },

    // Admin movie management (administrator only)
    getAllMovies: async (authToken) => {
        const response = await axios.get(getApiUrl('allMovies'), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    addMovie: async (movieData, authToken) => {
        const response = await axios.post(getApiUrl('addMovie'), movieData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    updateMovie: async (movieId, movieData, authToken) => {
        const response = await axios.patch(getApiUrlWithParams('updateMovie', { movieId }), movieData, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },

    deleteMovie: async (movieId, authToken) => {
        const response = await axios.delete(getApiUrlWithParams('deleteMovie', { movieId }), {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return response.data;
    },
};
