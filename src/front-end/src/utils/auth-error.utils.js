/**
 * Authentication Error Utilities
 * Helper functions for handling authentication errors in services
 */

/**
 * Check if an error is an authentication error (401/403)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if authentication error
 */
export const isAuthError = (error) => {
    return error.response && (error.response.status === 401 || error.response.status === 403);
};

/**
 * Check if an error is a session expired error (401)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if session expired
 */
export const isSessionExpiredError = (error) => {
    return error.response && error.response.status === 401;
};

/**
 * Check if an error is an access denied error (403)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if access denied
 */
export const isAccessDeniedError = (error) => {
    return error.response && error.response.status === 403;
};

/**
 * Get appropriate error message for authentication errors
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
    if (!isAuthError(error)) {
        return error.response?.data?.message || error.message || 'An error occurred';
    }

    if (isSessionExpiredError(error)) {
        return 'Session expired. Please login again to continue.';
    }

    if (isAccessDeniedError(error)) {
        return 'Access denied. You do not have permission to access this resource.';
    }

    return error.response?.data?.message || 'Authentication error occurred';
};

/**
 * Extract error code and message for display
 * @param {Error} error - Axios error object
 * @returns {Object} { errorCode, errorMsg }
 */
export const extractErrorInfo = (error) => {
    return {
        errorCode: error.response?.status || null,
        errorMsg: getAuthErrorMessage(error),
    };
};

export default {
    isAuthError,
    isSessionExpiredError,
    isAccessDeniedError,
    getAuthErrorMessage,
    extractErrorInfo,
};
