/**
 * API Configuration for Lumiere Cinema
 *
 * This module provides centralized API configuration for making HTTP requests to the backend API.
 *
 * SETUP:
 * 1. Create a .env file in the root of your frontend project
 * 2. Add: VITE_API_BASE_URL=http://localhost:5000 (or your API domain)
 * 3. For production: VITE_API_BASE_URL=https://your-production-domain.com
 *
 * USAGE:
 *
 * import { getApiUrl, getApiUrlWithParams } from '@config/api.config';
 * import axios from 'axios';
 *
 * // Simple endpoint
 * axios.get(getApiUrl('reportBranches'))
 * // → GET http://localhost:5000/api/reports/branches
 *
 * // With parameters (use getApiUrlWithParams for endpoints with :params)
 * axios.get(getApiUrlWithParams('movieDetails', { movieId: '123' }))
 * // → GET http://localhost:5000/api/movies/123
 *
 * // Query parameters (use regular axios params)
 * axios.get(getApiUrl('revenueSummary'), { params: { startDate, endDate } })
 * // → GET http://localhost:5000/api/reports/revenue-summary?startDate=...&endDate=...
 *
 * AUTHENTICATION:
 * For authentication-related API calls, use the authAPI from utils/auth.utils.js
 * which provides a centralized way to handle authentication with proper error handling.
 */

// API configuration
const API_CONFIG = {
    // Base URL for the API - can be overridden by environment variables
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',

    // API endpoints organized by feature
    endpoints: {
        // ========================= AUTHENTICATION ENDPOINTS =========================
        // Public auth routes
        login: '/api/auth/login', // POST - User login
        register: '/api/auth/register', // POST - User registration
        activateAccount: '/api/auth/activate/:token', // POST - Account activation (use getApiUrlWithParams)
        logout: '/api/auth/logout', // POST - Logout (requires auth)
        changePassword: '/api/auth/change-password', // POST - Change password (requires auth)
        forgotPassword: '/api/auth/forgot-password', // POST - Request password reset
        resetPassword: '/api/auth/reset-password', // POST - Reset password with token

        // Staff authentication
        staffLogin: '/api/auth/staff/login', // POST - Staff login
        staffForgotPassword: '/api/auth/staff/forgot-password', // POST - Staff password reset

        // ========================= USER MANAGEMENT ENDPOINTS =========================
        // User profile management (customer only)
        userProfile: '/api/users/me', // GET/PATCH/PUT - User profile

        // Movie rating system
        rateMovie: '/api/users/rate', // POST - Rate a movie (requires auth)
        getUserRating: '/api/users/rating/:movieId', // GET - Get user's rating for movie (use getApiUrlWithParams)

        // Wishlist management
        wishlist: '/api/users/wishlist', // GET - Get user's wishlist
        addToWishlist: '/api/users/wishlist/:movieId', // POST - Add movie to wishlist (use getApiUrlWithParams)
        removeFromWishlist: '/api/users/wishlist/:movieId', // DELETE - Remove from wishlist (use getApiUrlWithParams)

        // Watch history
        watchHistory: '/api/users/watch-history', // GET - Get watch history
        removeFromWatchHistory: '/api/users/watch-history/:ticketId', // DELETE - Remove from history (use getApiUrlWithParams)

        // User tickets
        userTickets: '/api/users/tickets', // GET - Get user's tickets

        // ========================= ADMIN USER MANAGEMENT =========================
        // Admin user operations (administrator only)
        adminUsers: '/api/admin/users', // GET/POST - Get all users / Create user
        adminUserDetails: '/api/admin/users/:userId', // GET/PATCH/PUT/DELETE - User details (use getApiUrlWithParams)
        adminUserRoles: '/api/admin/users/:userId/roles', // PATCH - Update user roles (use getApiUrlWithParams)
        adminUserStatus: '/api/admin/users/:userId/status', // PATCH - Update user status (use getApiUrlWithParams)

        // ========================= MOVIE ENDPOINTS =========================    // Public movie endpoints
        nowShowingMovies: '/api/movies/now-showing', // GET - Now showing movies
        upcomingMovies: '/api/movies/upcoming', // GET - Upcoming movies
        searchMovies: '/api/movies/search', // GET - Search movies (query params)
        searchSuggestions: '/api/movies/search/suggest', // GET - Search suggestions (query params)
        movieDetails: '/api/movies/:movieId', // GET - Movie details (use getApiUrlWithParams)
        movieShowtimes: '/api/movies/:movieId/showscreen', // GET - Movie showtimes (use getApiUrlWithParams)
        movieRatings: '/api/movies/:movieId/get-ratings', // GET - Movie ratings summary (use getApiUrlWithParams)
        // Admin movie management (administrator only)
        allMovies: '/api/movies/all', // GET - All movies including archived
        clearSearchCache: '/api/movies/search/cache', // DELETE - Clear search cache (admin)
        addMovie: '/api/movies', // POST - Add new movie
        updateMovie: '/api/movies/:movieId', // PUT/PATCH - Update movie (use getApiUrlWithParams)
        deleteMovie: '/api/movies/:movieId', // DELETE - Delete movie (use getApiUrlWithParams)

        // ========================= BRANCH ENDPOINTS =========================
        // Public branch endpoints
        availableBranches: '/api/branches/available', // GET - Available branches with movie count
        branchDetails: '/api/branches/:branchId', // GET - Branch details (use getApiUrlWithParams)
        branchSnacks: '/api/branches/:branchId/snacks', // GET - Branch snacks list (use getApiUrlWithParams)

        // Branch snack management (branchmanager only)
        createBranchSnack: '/api/branches/:branchId/snacks', // POST - Create snack (use getApiUrlWithParams)
        editBranchSnack: '/api/branches/:branchId/snacks/:snackId', // PATCH - Edit snack (use getApiUrlWithParams)
        deleteBranchSnack: '/api/branches/:branchId/snacks/:snackId', // DELETE - Delete snack (use getApiUrlWithParams)

        // Branch schedule management (branchmanager only)
        branchSchedules: '/api/branches/:branchId/schedules', // GET/POST - Branch schedules (use getApiUrlWithParams)
        editBranchSchedule: '/api/branches/:branchId/schedules/:scheduleId', // PATCH - Edit schedule (use getApiUrlWithParams)
        deleteBranchSchedule: '/api/branches/:branchId/schedules/:scheduleId', // DELETE - Delete schedule (use getApiUrlWithParams)

        // Branch screen management (branchmanager only)
        branchScreens: '/api/branches/:branchId/screens', // GET/POST - Branch screens (use getApiUrlWithParams)
        branchScreenDetails: '/api/branches/:branchId/screens/:screenId', // GET/PATCH/DELETE - Screen details (use getApiUrlWithParams)

        // Screen seat management (branchmanager only)
        screenSeats: '/api/branches/:branchId/screens/:screenId/seats', // GET/POST - Screen seats (use getApiUrlWithParams)
        screenSeatDetails: '/api/branches/:branchId/screens/:screenId/seats/:seatId', // GET/PATCH/DELETE - Seat details (use getApiUrlWithParams)
        bulkCreateSeats: '/api/branches/:branchId/screens/:screenId/seats/bulk', // POST - Bulk create seats (use getApiUrlWithParams)

        // Admin branch management (administrator only)
        adminBranches: '/api/admin/branches', // GET/POST - All branches / Create branch
        adminBranchDetails: '/api/admin/branches/:branchId', // PATCH/DELETE - Branch management (use getApiUrlWithParams)
        adminBranchStatus: '/api/admin/branches/:branchId/status', // PATCH - Branch status (use getApiUrlWithParams)

        // ========================= PROMOTION ENDPOINTS =========================
        // Public promotion endpoints
        promotionBanner: '/api/admin/promotions/banner', // GET - Promotion banner list
        publicPromotions: '/api/admin/promotions/public', // GET - Public promotions (with banners or loyalty codes)

        // Admin promotion management (administrator only)
        adminPromotions: '/api/admin/promotions/all', // GET - All promotions
        adminPromotionDetails: '/api/admin/promotions/:promotionCode', // GET/PATCH/DELETE - Promotion details (use getApiUrlWithParams)
        createPromotion: '/api/admin/promotions', // POST - Create promotion

        // ========================= TICKET ENDPOINTS =========================
        // General ticket operations
        schedulesByBranch: '/api/tickets/:branchId/schedule', // GET - Schedules by branch (use getApiUrlWithParams)
        seatMapBySchedule: '/api/tickets/screen/:scheduleId', // GET - Seat map by schedule (use getApiUrlWithParams)
        createTicket: '/api/tickets/create', // POST - Create ticket (movie/snack/both)
        calculateDiscountedTotal: '/api/tickets/calculate-discounted', // POST - Calculate discounted total

        // Movie ticket specific
        holdSeats: '/api/tickets/movie/hold', // POST - Hold seats temporarily
        manageSeatHold: '/api/tickets/movie/hold/', // PATCH - Manage seat hold (release/extend)
        bulkReleaseSeatHolds: '/api/tickets/movie/hold/bulk', // DELETE - Bulk release seat holds
        cleanupExpiredHolds: '/api/tickets/movie/hold/cleanup', // POST - Cleanup expired holds (admin)

        // Movie ticket admin operations (administrator/checkincounter)
        allMovieTickets: '/api/tickets/movie/admin/all', // GET - All movie tickets (admin)
        movieTicketDetails: '/api/tickets/movie/admin/:ticketCode', // GET/PATCH/DELETE - Movie ticket details (use getApiUrlWithParams)

        // Snack ticket operations
        snacksByBranch: '/api/tickets/:branchId/snacks', // GET - Snacks by branch (use getApiUrlWithParams)

        // Snack ticket admin operations (administrator only)
        allSnackTickets: '/api/tickets/snack/admin/all', // GET - All snack tickets (admin)
        snackTicketDetails: '/api/tickets/snack/admin/:ticketCode', // GET/PATCH/DELETE - Snack ticket details (use getApiUrlWithParams)

        // Cache management (administrator only)
        cacheStats: '/api/tickets/cache/stats', // GET - Cache statistics
        cleanupCache: '/api/tickets/cache/cleanup', // POST - Cleanup expired cache
        preloadCache: '/api/tickets/cache/preload', // POST - Preload cache for popular routes

        // ========================= REPORT ENDPOINTS =========================
        // Report endpoints (administrator/branchmanager)
        reportBranches: '/api/reports/branches', // GET - Branch list (admin only)
        reportBranch: '/api/reports/branch', // GET - Branch for manager
        revenueSummary: '/api/reports/revenue-summary', // GET - Revenue summary (query: startDate, endDate, branchId)
        // ========================= CHATBOT ENDPOINTS =========================
        // Chatbot endpoints
        chatbotQuery: '/api/chatbot/query', // POST - Chatbot query
        chatbotUpdateContext: '/api/chatbot/update-context', // POST - Update interaction context

        // ========================= QR CODE ENDPOINTS =========================
        // QR code generation
        generateQR: '/api/qr', // GET - Generate QR code (query: code, size)
    },
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
 * getEndpoint('reportBranches') // → '/api/reports/branches'
 */
export const getEndpoint = (name) => {
    return API_CONFIG.endpoints[name] || '';
};

/**
 * Get full API URL for a simple endpoint (no parameters)
 * @param {string} endpointName - The endpoint name from API_CONFIG.endpoints
 * @returns {string} Full URL
 * @example
 * getApiUrl('reportBranches') // → 'http://localhost:5000/api/reports/branches'
 * getApiUrl('login') // → 'http://localhost:5000/api/auth/login'
 */
export const getApiUrl = (endpointName) => {
    const endpoint = getEndpoint(endpointName);
    return buildApiUrl(endpoint);
};

/**
 * Get API URL with parameter replacement for dynamic routes
 * Use this function for endpoints that contain :param placeholders
 * @param {string} endpointName - The endpoint name from API_CONFIG.endpoints
 * @param {Object} params - Key-value pairs to replace in URL (e.g., {movieId: '123'})
 * @returns {string} Full URL with parameters replaced
 * @example
 * getApiUrlWithParams('movieDetails', {movieId: '123'})
 * // → 'http://localhost:5000/api/movies/123'
 *
 * getApiUrlWithParams('editBranchSnack', {branchId: 'branch123', snackId: 'snack456'})
 * // → 'http://localhost:5000/api/branches/branch123/snacks/snack456'
 *
 * getApiUrlWithParams('activateAccount', {token: 'abc123'})
 * // → 'http://localhost:5000/api/auth/activate/abc123'
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

export default API_CONFIG;
