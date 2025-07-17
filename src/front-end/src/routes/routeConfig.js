// Page imports
import LandingPage from '../pages/LandingPage';
import Registration from '../pages/Registration';
import Login from '../pages/Login';
import StaffLogin from '../pages/staff/Login';
import StaffResetPwd from '../pages/staff/ResetPwd';
import ChangePwd from '../pages/ChangePwd';
import StaffChangePwd from '../pages/staff/ChangePwd';
import MovieListPage from '../pages/MovieList.jsx';
import CheckInCounterPage from '../pages/staff/CheckInCounterPage.jsx';
import ScheduleManagePage from '../pages/staff/ScheduleManagePage.jsx';
import PromotionManagePage from '../pages/staff/PromotionManagePage.jsx';
import ReportPage from '../pages/staff/ReportPage';
import ScreenManagePage from '../pages/staff/ScreenManagePage.jsx';
import BranchManagePage from '../pages/staff/BranchManagePage.jsx';
import AccountManagePage from '../pages/staff/AccountManagePage.jsx';
import ResetPwdEmail from '../pages/ResetPwdEmail.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import StaffRoot from '../pages/staff/StaffRoot.jsx';
import MovieManagePage from '../pages/staff/MovieManagePage.jsx';
import SnackManagePage from '../pages/staff/SnackManagePage.jsx';

// Route configuration
export const routeConfig = [
    // Public routes - accessible to all users
    {
        path: '/',
        component: LandingPage,
        type: 'public',
        requiresAuth: false
    },
    {
        path: '/register',
        component: Registration,
        type: 'public',
        requiresAuth: false
    },
    {
        path: '/login',
        component: Login,
        type: 'public',
        requiresAuth: false
    },
    {
        path: '/reset-password',
        component: ForgotPassword,
        type: 'public',
        requiresAuth: false
    },
    {
        path: '/reset-password/confirm',
        component: ResetPwdEmail,
        type: 'public',
        requiresAuth: false
    },
    {
        path: '/movies',
        component: MovieListPage,
        type: 'public',
        requiresAuth: false
    },
    
    // Customer protected routes - require authentication but not staff roles
    {
        path: '/change-password',
        component: ChangePwd,
        type: 'customer',
        requiresAuth: true,
        allowedRoles: ['customer'] // Only customers can access this
    },
    
    // Staff public routes - accessible to all staff without authentication
    {
        path: '/staff/login',
        component: StaffLogin,
        type: 'staff-public',
        requiresAuth: false
    },
    {
        path: '/staff/reset-password',
        component: StaffResetPwd,
        type: 'staff-public',
        requiresAuth: false
    },
    
    // Staff dashboard root
    {
        path: '/staff',
        component: StaffRoot,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['cashier', 'checkincounter', 'branchmanager', 'administrator']
    },
    
    // Staff protected routes - require staff roles
    {
        path: '/staff/change-password',
        component: StaffChangePwd,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['cashier', 'checkincounter', 'branchmanager', 'administrator']
    },
    {
        path: '/staff/checkin',
        component: CheckInCounterPage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['checkincounter']
    },
    {
        path: '/staff/schedule',
        component: ScheduleManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager']
    },
    {
        path: '/staff/promotion',
        component: PromotionManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: '/staff/report',
        component: ReportPage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager', 'administrator']
    },
    {
        path: '/staff/screen',
        component: ScreenManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager']
    },
    {
        path: '/staff/branch',
        component: BranchManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: '/staff/account',
        component: AccountManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: '/staff/movie',
        component: MovieManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: '/staff/snack',
        component: SnackManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager']
    },
];

// Helper function to check if user has required roles
export const hasRequiredRole = (userRoles, allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!userRoles || userRoles.length === 0) return false;
    return allowedRoles.some(role => userRoles.includes(role));
};

// Helper function to check if user is staff
export const isStaff = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return false;
    const staffRoles = ['cashier', 'checkincounter', 'branchmanager', 'administrator'];
    return userRoles.some(role => staffRoles.includes(role));
};

// Helper function to check if user is customer
export const isCustomer = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return false;
    return userRoles.includes('customer') || (!isStaff(userRoles));
};

// Routing logic functions
export const shouldRedirectStaff = (isAuthenticated, userRoles, routeType) => {
    return isAuthenticated && isStaff(userRoles) && (routeType === 'public' || routeType === 'customer');
};

export const shouldRedirectCustomer = (isAuthenticated, userRoles, routeType) => {
    return isAuthenticated && isCustomer(userRoles) && !isStaff(userRoles) && (routeType === 'staff' || routeType === 'staff-public');
};

export const shouldRedirectUnauthenticatedFromStaff = (isAuthenticated, routeType, routePath) => {
    if (isAuthenticated || (routeType !== 'staff' && routeType !== 'staff-public')) return false;
    // Allow access to staff login and reset password
    return routePath !== '/staff/login' && routePath !== '/staff/reset-password';
};

export const getRedirectPath = (isAuthenticated, userRoles, route) => {
    // Staff accessing non-staff routes
    if (shouldRedirectStaff(isAuthenticated, userRoles, route.type)) {
        return '/staff';
    }
    
    // Customer accessing staff routes
    if (shouldRedirectCustomer(isAuthenticated, userRoles, route.type)) {
        return '/';
    }
    
    // Unauthenticated users trying to access staff routes
    if (shouldRedirectUnauthenticatedFromStaff(isAuthenticated, route.type, route.path)) {
        return '/staff/login';
    }
    
    // Protected routes without required roles
    if (route.requiresAuth && !hasRequiredRole(userRoles, route.allowedRoles)) {
        return isStaff(userRoles) ? '/staff' : '/';
    }
    
    return null; // No redirect needed
};
