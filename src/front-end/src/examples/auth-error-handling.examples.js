/**
 * Example Usage of Enhanced Authentication Error Handling
 *
 * This file demonstrates how the new authentication error handling works
 * in practice with the Lumiere Cinema front-end services.
 */

// ================================
// AUTOMATIC ERROR HANDLING
// ================================

// All existing service calls now automatically handle 401/403 errors
// No changes needed to existing code!

import { userService, movieService } from '@services';

// This will automatically trigger logout and error modal if 401/403
const getUserProfile = async (token) => {
    try {
        const profile = await userService.getProfile(token);
        return profile;
    } catch (error) {
        // Only non-auth errors reach here now
        // 401/403 errors are handled automatically by interceptor
        console.error('Profile fetch error:', error);
        throw error;
    }
};

// ================================
// ERROR MODAL EXAMPLES
// ================================

// These errors will be shown automatically:

// 401 - Session Expired
// Modal: Red background, logout icon
// Text: "Session Expired: Session expired. Please login again to continue."
// Action: Auto logout and redirect to appropriate login page

// 403 - Access Denied (authenticated user)
// Modal: Red background, X icon
// Text: "Access Denied: Access denied. You do not have permission to access this resource."
// Action: Show error only, no logout

// 403 - Access Denied (unauthenticated user)
// Modal: Red background, logout icon
// Text: "Session Expired: Session expired. Please login again to continue."
// Action: Auto logout and redirect

// ================================
// MANUAL ERROR HANDLING (if needed)
// ================================

import { apiInterceptor } from '@services';
import { extractErrorInfo } from '@utils/auth-error.utils';

// Manual logout trigger (for testing or special cases)
const triggerManualSessionExpired = async () => {
    await apiInterceptor.triggerManualLogout(401, 'Your session has been terminated');
};

// Service-level error handling with utilities
const fetchMovieWithErrorHandling = async (movieId, token) => {
    try {
        const movie = await movieService.getMovieDetails(movieId);
        return movie;
    } catch (error) {
        // Extract error info for custom handling
        const { errorCode, errorMsg } = extractErrorInfo(error);

        // Auth errors are already handled by interceptor,
        // but you can still access the info if needed
        console.log(`Error ${errorCode}: ${errorMsg}`);
        throw error;
    }
};

// ================================
// TESTING THE IMPLEMENTATION
// ================================

// To test session expiration:
// 1. Login as a user
// 2. Manually expire the token in localStorage or backend
// 3. Make any API call
// 4. Should see red error modal with logout icon
// 5. Should be redirected to appropriate login page

// To test access denied:
// 1. Login as customer
// 2. Try to access admin-only endpoint
// 3. Should see red error modal with X icon
// 4. Should remain logged in

// ================================
// MIGRATION FROM OLD CODE
// ================================

// OLD WAY (remove this):
/*
const fetchUserProfile = async (token) => {
  try {
    const profile = await userService.getProfile(token);
    return profile;
  } catch (error) {
    if (error.response?.status === 401) {
      // Manual logout logic
      userContext.logout();
      navigate('/login');
      showError('Session expired');
    }
    throw error;
  }
};
*/

// NEW WAY (automatic):
const fetchUserProfile = async (token) => {
    // Just make the call - errors handled automatically!
    const profile = await userService.getProfile(token);
    return profile;
};

export { getUserProfile, triggerManualSessionExpired, fetchMovieWithErrorHandling, fetchUserProfile };
