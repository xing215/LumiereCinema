/**
 * API Interceptor Service
 * Handles global HTTP request/response interceptors for authentication and error handling
 */
import axios from 'axios';
import { handleSessionExpiredLogout } from '@utils/logout.utils';
import { getEndpoint } from '@config/api.config';

let userContext = null;
let navigate = null;
let showError = null;

/**
 * Routes that should be ignored during authentication error handling
 * These routes are public and don't require authentication, so 401/403 errors
 * should not trigger logout modals or redirects to login pages
 * 
 * Uses endpoint aliases from api.config.js for better maintainability
 */
const AUTH_ERROR_WHITELIST_ALIASES = [
  // Authentication routes - expected to return 401/403 for invalid credentials
  'login',                    // User login
  'register',                 // User registration
  'activateAccount',          // Account activation with token parameter
  'forgotPassword',           // Password reset request
  'resetPassword',            // Password reset with token
  'staffLogin',               // Staff login
  'staffForgotPassword',      // Staff password reset
  
  // Public routes that don't require authentication
  'nowShowingMovies',         // Movie listings
  'upcomingMovies',           // Upcoming movies
  'searchMovies',             // Movie search
  'searchSuggestions',        // Search suggestions
  'movieDetails',             // Movie details
  'movieShowtimes',           // Movie showtimes
  'movieRatings',             // Movie ratings
  'availableBranches',        // Available branches
  'branchDetails',            // Branch details
  'branchSnacks',             // Branch snacks (public viewing)
  'promotionBanner',          // Promotion banners
  'publicPromotions',         // Public promotions
  'schedulesByBranch',        // Public schedule information
  'seatMapBySchedule',        // Public seat maps (for viewing before login)
  'snacksByBranch',           // Snacks by branch (public viewing)
  'chatbotQuery',             // Chatbot interactions
  'chatbotUpdateContext',     // Chatbot context updates
  'generateQR',               // QR code generation
];

/**
 * Convert aliases to actual endpoint paths
 * @returns {string[]} Array of endpoint paths
 */
const getWhitelistPaths = () => {
  const paths = AUTH_ERROR_WHITELIST_ALIASES.map(alias => getEndpoint(alias)).filter(Boolean);
  console.log('🔧 Whitelist aliases:', AUTH_ERROR_WHITELIST_ALIASES);
  console.log('🔧 Resolved paths:', paths);
  return paths;
};

/**
 * Check if the current request URL should be ignored for auth error handling
 * @param {string} url - The request URL
 * @returns {boolean} - True if the URL should be ignored
 */
const isWhitelistedRoute = (url) => {
  if (!url) return false;
  
  // Extract path from full URL if needed (remove domain)
  let urlPath = url;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      urlPath = urlObj.pathname;
    }
  } catch (e) {
    // If URL parsing fails, use the original URL
    urlPath = url;
  }
  
  const whitelistPaths = getWhitelistPaths();
  
  // Debug logging
  console.log('🔍 Checking URL for whitelist:', url);
  console.log('� Extracted path:', urlPath);
  console.log('�📋 Available whitelist paths:', whitelistPaths);
  
  const isWhitelisted = whitelistPaths.some(route => {
    // Handle exact matches and parameterized routes
    if (route.includes(':')) {
      // Convert route pattern to regex (e.g., '/api/auth/activate/:token' -> '/api/auth/activate/[^/]+')
      const pattern = route.replace(/:[\w]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      const matches = regex.test(urlPath);
      if (matches) {
        console.log(`✅ URL matches parameterized route: ${route} -> ${pattern}`);
      }
      return matches;
    } else {
      // Exact match or prefix match for routes
      const exactMatch = urlPath === route;
      const prefixMatch = urlPath.startsWith(route);
      if (exactMatch || prefixMatch) {
        console.log(`✅ URL matches route: ${route} (exact: ${exactMatch}, prefix: ${prefixMatch})`);
      }
      return exactMatch || prefixMatch;
    }
  });
  
  console.log(`🎯 Final result for ${url}: ${isWhitelisted ? 'WHITELISTED' : 'NOT WHITELISTED'}`);
  return isWhitelisted;
};

/**
 * Initialize the API interceptor with required context
 * This should be called once in the App component
 */
export const initializeApiInterceptor = (userCtx, navigateFunc, showErrorFunc) => {
  userContext = userCtx;
  navigate = navigateFunc;
  showError = showErrorFunc;
  
  setupInterceptors();
};

/**
 * Setup axios interceptors for request and response handling
 */
const setupInterceptors = () => {
  // Request interceptor - add auth token to requests
  const requestInterceptor = axios.interceptors.request.use(
    (config) => {
      // Add auth token to requests if available
      if (userContext?.token) {
        config.headers.Authorization = `Bearer ${userContext.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle authentication errors
  const responseInterceptor = axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const { response, config } = error;
      
      // Check if this route should be ignored for auth error handling
      const requestUrl = config?.url;
      console.log('🚨 Error intercepted:', {
        status: response?.status,
        url: requestUrl,
        fullConfig: config
      });
      
      const isWhitelisted = isWhitelistedRoute(requestUrl);
      
      if (response && userContext && navigate && showError && !isWhitelisted) {
        if (response.status === 401) {
          // Unauthorized - token expired or invalid
          await handleSessionExpiredLogout(
            userContext, 
            navigate, 
            showError
          );
        } else if (response.status === 403) {
          // Forbidden - insufficient permissions, but user is authenticated
          if (userContext.isAuthenticated) {
            // User is logged in but lacks permission
            showError(
              403, 
              'Access denied. You do not have permission to access this resource.'
            );
          } else {
            // User is not authenticated
            await handleSessionExpiredLogout(
              userContext, 
              navigate, 
              showError
            );
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  // Store interceptor IDs for cleanup
  return {
    requestInterceptor,
    responseInterceptor
  };
};

/**
 * Clean up interceptors (useful for testing or component unmounting)
 */
export const cleanupApiInterceptor = () => {
  // Note: In a real app, you'd want to store the interceptor IDs and eject them
  // For now, we'll rely on the fact that this is typically called once in App.jsx
  console.log('API interceptor cleanup - interceptors will be cleaned up on app unmount');
};

/**
 * Manual logout function for cases where automatic logout is needed
 */
export const triggerManualLogout = async (errorCode = 401, errorMessage = 'Session expired. Please login again.') => {
  if (userContext && navigate && showError) {
    await handleSessionExpiredLogout(userContext, navigate, showError);
  }
};

export default {
  initializeApiInterceptor,
  cleanupApiInterceptor,
  triggerManualLogout,
  isWhitelistedRoute, // Export for testing and configuration
  get AUTH_ERROR_WHITELIST_ALIASES() { return [...AUTH_ERROR_WHITELIST_ALIASES]; }, // Export aliases for external configuration
  get AUTH_ERROR_WHITELIST() { return getWhitelistPaths(); } // Export resolved paths for backward compatibility
};
