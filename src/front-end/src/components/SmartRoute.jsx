import { Navigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import ProtectedRoute from '@components/ProtectedRoute.jsx';
import { hasRequiredRole, isStaff, isCustomer } from '@routes/routeConfig.js';

const SmartRoute = ({ route, children }) => {
    const { isAuthenticated, isLoading, user } = useUser();
    const userRoles = user?.roles || [];

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
            </div>
        );
    }

    // Handle staff redirection logic
    if (isAuthenticated && isStaff(userRoles)) {
        // Staff accessing non-staff routes should be redirected to /staff
        if (route.type === 'public' || route.type === 'customer') {
            return <Navigate to="/staff" replace />;
        }
    }

    // Handle customer redirection logic
    if (isAuthenticated && isCustomer(userRoles) && !isStaff(userRoles)) {
        // Customer accessing staff routes should be redirected to /
        if (route.type === 'staff' || route.type === 'staff-public') {
            return <Navigate to="/" replace />;
        }
    }

    // Handle unauthenticated users trying to access staff routes
    if (!isAuthenticated && (route.type === 'staff' || route.type === 'staff-public')) {
        // Allow access to staff login and reset password
        if (route.path === '/staff/login' || route.path === '/staff/reset-password') {
            return children;
        }
        // Redirect other staff routes to staff login
        return <Navigate to="/staff/login" replace />;
    }

    // Handle protected routes that require authentication
    if (route.requiresAuth) {
        // Check if user has required roles
        if (!hasRequiredRole(userRoles, route.allowedRoles)) {
            // Redirect based on user type
            if (isStaff(userRoles)) {
                return <Navigate to="/staff" replace />;
            } else {
                return <Navigate to="/" replace />;
            }
        }

        // Wrap in ProtectedRoute for authentication check
        return (
            <ProtectedRoute requiredRoles={route.allowedRoles} redirectTo={route.type === 'staff' ? '/staff/login' : '/login'}>
                {children}
            </ProtectedRoute>
        );
    }

    // Public routes - accessible to all
    return children;
};

export default SmartRoute;
