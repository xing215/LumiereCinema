import { authService } from '@services';
import { isStaff } from '@utils/auth.utils';

export const handleLogout = async (userContext, navigate) => {
    try {
        // Call logout API if user is authenticated
        if (userContext.isAuthenticated && userContext.token) {
            await authService.logout(userContext.token);
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

export const handleSessionExpiredLogout = async (userContext, navigate, showError) => {
    try {
        // Don't call logout API since session is already expired
        console.log('Session expired - logging out user');
    } catch (error) {
        console.error('Session expired logout error:', error);
    } finally {
        // Clear user context
        userContext.logout();
        
        // Show session expired error
        showError(401, 'Session expired. Please login again to continue.');
        
        // Navigate to appropriate login page based on current user role
        const userRoles = userContext.user?.roles || [];
        if (isStaff(userRoles)) {
            navigate('/staff/login');
        } else {
            navigate('/login');
        }
    }
};
