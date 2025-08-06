/**
 * API Interceptor Service
 * Handles global HTTP request/response interceptors for authentication and error handling
 */
import axios from 'axios';
import { handleSessionExpiredLogout } from '@utils/logout.utils';

let userContext = null;
let navigate = null;
let showError = null;

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
      const { response } = error;
      
      if (response && userContext && navigate && showError) {
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
  triggerManualLogout
};
