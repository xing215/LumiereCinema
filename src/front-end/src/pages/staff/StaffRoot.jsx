import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import { ROUTES } from '@routes/routeConfig.js';

const StaffRoot = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useUser();

    useEffect(() => {
        if (isLoading) {
            return; // Wait for authentication check to complete
        }

        if (!isAuthenticated || !user) {
            // Not authenticated, redirect to login
            navigate(ROUTES.LOGIN);
            return;
        }

        // Check user roles and redirect accordingly
        const userRoles = user.roles || [];
        
        // Check roles in order of priority
        if (userRoles.includes('administrator')) {
            navigate(ROUTES.STAFF_REPORT);
        } else if (userRoles.includes('branchmanager')) {
            navigate(ROUTES.STAFF_REPORT);
        } else if (userRoles.includes('checkincounter')) {
            navigate(ROUTES.STAFF_CHECKIN);
        } else if (userRoles.includes('cashier')) {
            navigate(ROUTES.STAFF_SELL_TICKET);
        } else if (userRoles.includes('customer')) {
            navigate(ROUTES.HOME);
        } else {
            // Default case for unknown roles
            navigate(ROUTES.HOME);
        }
    }, [isAuthenticated, isLoading, user, navigate]);

    // Show loading while checking authentication and roles
    if (isLoading) {
        return (
            <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white font-['Unbounded'] text-lg">Loading...</div>
            </div>
        );
    }

    // This component only handles redirects, so it doesn't render anything
    return null;
};

export default StaffRoot;