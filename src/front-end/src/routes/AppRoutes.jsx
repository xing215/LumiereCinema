import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import ProtectedRoute from '@components/ProtectedRoute.jsx';
import { routeConfig, getRedirectPath } from '@routes/routeConfig.js';

// Loading component
const LoadingSpinner = () => (
    <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent"></div>
    </div>
);

// Smart Route Handler Component
const RouteHandler = ({ route }) => {
    const { isAuthenticated, isLoading, user } = useUser();
    const userRoles = user?.roles || [];

    // Show loading state while checking authentication
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Check if redirect is needed
    const redirectPath = getRedirectPath(isAuthenticated, userRoles, route);
    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    // Handle protected routes that require authentication
    if (route.requiresAuth) {
        return (
            <ProtectedRoute 
                requiredRoles={route.allowedRoles} 
                redirectTo={route.type === 'staff' ? '/staff/login' : '/login'}
            >
                <route.component />
            </ProtectedRoute>
        );
    }

    // Public routes - accessible to all
    return <route.component />;
};

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {routeConfig.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={<RouteHandler route={route} />}
                    />
                ))}
            </Routes>
        </Router>
    );
};

export default AppRoutes;
