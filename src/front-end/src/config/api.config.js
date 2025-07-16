/**
 * API Configuration for Lumiere Cinema
 * 
 * This module provides centralized API configuration and helper functions
 * for making HTTP requests to the backend API.
 * 
 * SETUP:
 * 1. Create a .env file in the root of your frontend project
 * 2. Add: VITE_API_BASE_URL=http://localhost:5000 (or your API domain)
 * 3. For production: VITE_API_BASE_URL=https://your-production-domain.com
 * 
 * BASIC USAGE:
 * 
 * import { getApiUrl } from '../config/api.config';
 * import axios from 'axios';
 * 
 * // Simple endpoint
 * axios.get(getApiUrl('branches'))
 * // → GET http://localhost:5000/api/reports/branches
 * 
 * // With parameters
 * axios.get(getApiUrl('revenueSummary'), { params: { startDate, endDate } })
 * // → GET http://localhost:5000/api/reports/revenue-summary?startDate=...&endDate=...
 * 
 * ADVANCED USAGE:
 * 
 * // Movie operations
 * axios.get(getMovieApiUrl('123')) // Get movie details
 * axios.get(getMovieApiUrl('123', 'showscreen')) // Get movie showtimes
 * axios.get(getMovieApiUrl('123', 'get-ratings')) // Get movie ratings
 * 
 * // Branch snack operations
 * axios.get(getBranchSnackApiUrl('branch123')) // Get all snacks for branch
 * axios.post(getBranchSnackApiUrl('branch123')) // Create snack for branch
 * axios.patch(getBranchSnackApiUrl('branch123', 'snack456')) // Update specific snack
 * 
 * // Ticket operations
 * axios.get(getApiUrl('getAllTickets')) // Get all tickets
 * axios.get(getTicketApiUrl('ABC123')) // Get specific ticket
 * 
 * EXPORTED FUNCTIONS:
 * 
 * - getApiUrl(endpointName): Get full URL for a simple endpoint
 * - getApiUrlWithParams(endpointName, params): Get URL with parameter replacement
 * - getMovieApiUrl(movieId, operation): Helper for movie-related endpoints
 * - getBranchSnackApiUrl(branchId, snackId): Helper for branch snack endpoints
 * - getTicketApiUrl(ticketCode): Helper for ticket endpoints
 * - buildApiUrl(endpoint): Build full URL from endpoint path
 * - getEndpoint(name): Get endpoint path by name
 */

// API configuration
const API_CONFIG = {
  // Base URL for the API - can be overridden by environment variables
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // API endpoints
  endpoints: {
    // Auth endpoints
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    changePassword: '/api/auth/change-password',
    
    // Movie endpoints
    nowShowingMovies: '/api/movies/now-showing',
    upcomingMovies: '/api/movies/upcoming',
    searchMovies: '/api/movies/search',
    allMovies: '/api/movies/all', // Admin only
    movieDetails: '/api/movies', // + /:movieId
    movieShowtimes: '/api/movies', // + /:movieId/showscreen
    movieRatings: '/api/movies', // + /:movieId/get-ratings
    addMovie: '/api/movies', // POST
    updateMovie: '/api/movies', // PUT/PATCH + /:movieId
    deleteMovie: '/api/movies', // DELETE + /:movieId
    
    // Report endpoints
    branches: '/api/reports/branches',
    revenueSummary: '/api/reports/revenue-summary',
    
    // Branch endpoints (snack management)
    getSnacks: '/api/branches', // + /:branchId/snacks
    createSnack: '/api/branches', // POST + /:branchId/snacks
    editSnack: '/api/branches', // PATCH + /:branchId/snacks/:snackId
    deleteSnack: '/api/branches', // DELETE + /:branchId/snacks/:snackId
    
    // Ticket endpoints
    createTicket: '/api/tickets/snacks',
    getAllTickets: '/api/tickets/snacks/admin/all',
    getTicketByCode: '/api/tickets/snacks/admin', // + /:ticketCode
    updateTicket: '/api/tickets/snacks/admin', // PATCH + /:ticketCode
    deleteTicket: '/api/tickets/snacks/admin', // DELETE + /:ticketCode
  }
};

/**
 * Build full API URL from endpoint path
 * @param {string} endpoint - The endpoint path (e.g., '/api/movies')
 * @returns {string} Full URL with domain
 * @example
 * buildApiUrl('/api/movies') // → 'http://localhost:5000/api/movies'
 */
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

/**
 * Get endpoint path by name from configuration
 * @param {string} name - The endpoint name from API_CONFIG.endpoints
 * @returns {string} Endpoint path or empty string if not found
 * @example
 * getEndpoint('branches') // → '/api/reports/branches'
 */
export const getEndpoint = (name) => {
  return API_CONFIG.endpoints[name] || '';
};

/**
 * Get full API URL for a simple endpoint
 * @param {string} endpointName - The endpoint name from API_CONFIG.endpoints
 * @returns {string} Full URL
 * @example
 * getApiUrl('branches') // → 'http://localhost:5000/api/reports/branches'
 * getApiUrl('login') // → 'http://localhost:5000/api/auth/login'
 */
export const getApiUrl = (endpointName) => {
  const endpoint = getEndpoint(endpointName);
  return buildApiUrl(endpoint);
};

/**
 * Get API URL with parameter replacement for dynamic routes
 * @param {string} endpointName - The endpoint name from API_CONFIG.endpoints
 * @param {Object} params - Key-value pairs to replace in URL (e.g., {movieId: '123'})
 * @returns {string} Full URL with parameters replaced
 * @example
 * getApiUrlWithParams('movieDetails', {movieId: '123'}) 
 * // → 'http://localhost:5000/api/movies/123'
 */
export const getApiUrlWithParams = (endpointName, params = {}) => {
  const endpoint = getEndpoint(endpointName);
  let url = buildApiUrl(endpoint);
  
  // Replace parameters in URL
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  
  return url;
};

/**
 * Helper function to build URLs for specific movie operations
 * @param {string} movieId - The movie ID
 * @param {string} [operation=''] - Optional operation (e.g., 'showscreen', 'get-ratings')
 * @returns {string} Full URL for movie endpoint
 * @example
 * getMovieApiUrl('123') // → 'http://localhost:5000/api/movies/123'
 * getMovieApiUrl('123', 'showscreen') // → 'http://localhost:5000/api/movies/123/showscreen'
 * getMovieApiUrl('123', 'get-ratings') // → 'http://localhost:5000/api/movies/123/get-ratings'
 */
export const getMovieApiUrl = (movieId, operation = '') => {
  const baseUrl = getApiUrl('movieDetails');
  if (operation) {
    return `${baseUrl}/${movieId}/${operation}`;
  }
  return `${baseUrl}/${movieId}`;
};

/**
 * Helper function to build URLs for branch snack operations
 * @param {string} branchId - The branch ID
 * @param {string} [snackId=''] - Optional snack ID for specific snack operations
 * @returns {string} Full URL for branch snack endpoint
 * @example
 * getBranchSnackApiUrl('branch123') // → 'http://localhost:5000/api/branches/branch123/snacks'
 * getBranchSnackApiUrl('branch123', 'snack456') // → 'http://localhost:5000/api/branches/branch123/snacks/snack456'
 */
export const getBranchSnackApiUrl = (branchId, snackId = '') => {
  const baseUrl = getApiUrl('getSnacks');
  if (snackId) {
    return `${baseUrl}/${branchId}/snacks/${snackId}`;
  }
  return `${baseUrl}/${branchId}/snacks`;
};

/**
 * Helper function to build URLs for ticket operations
 * @param {string} ticketCode - The ticket code (optional)
 * @returns {string} Full URL for ticket endpoint
 * @example
 * getApiUrl('getAllTickets') // → 'http://localhost:5000/api/tickets/snacks/admin/all'
 * getTicketApiUrl('ABC123') // → 'http://localhost:5000/api/tickets/snacks/admin/ABC123'
 */
export const getTicketApiUrl = (ticketCode = '') => {
  const baseUrl = getApiUrl('getTicketByCode');
  if (ticketCode) {
    return `${baseUrl}/${ticketCode}`;
  }
  return baseUrl;
};

/**
 * Generic API request function
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Request body data (optional)
 * @param {object} headers - Additional headers (optional)
 * @returns {Promise<any>} Response data
 * @example
 * await apiRequest('POST', '/api/auth/login', { email, password })
 * await apiRequest('GET', '/api/movies')
 */
export const apiRequest = async (method, endpoint, data = null, headers = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add authorization token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add body for POST/PUT/PATCH requests
  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default API_CONFIG;
