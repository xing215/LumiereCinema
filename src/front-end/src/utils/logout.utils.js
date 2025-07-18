import { authAPI, isStaff } from '@utils/auth.utils.js';

export const handleLogout = async (userContext, navigate) => {
    try {
        // Call logout API if user is authenticated
        if (userContext.isAuthenticated) {
            await authAPI.logout();
        }
    } catch (error) {
        console.error('Logout API error:', error);
        // Continue with logout even if API call fails
    } finally {
        // Clear user context
        userContext.logout();
        
        // Navigate to appropriate login page based on current user role
        const userRoles = userContext.user?.roles || [];
        if (isStaff(userRoles)) {
            navigate('/staff/login');
        } else {
            navigate('/login');
        }
    }
};
