import LandingPage from '@pages/LandingPage';
import Registration from '@pages/Registration';
import ActivateAccount from '@pages/ActivateAccount.jsx';
import Login from '@pages/Login';
import StaffLogin from '@pages/staff/Login';
import StaffForgotPwd from '@pages/staff/ForgotPwd';
import ChangePwd from '@pages/ChangePwd';
import StaffChangePwd from '@pages/staff/ChangePwd';
import MovieListPage from '@pages/MovieList.jsx';
import CheckInCounterPage from '@pages/staff/CheckInCounterPage.jsx';
import ScheduleManagePage from '@pages/staff/ScheduleManagePage.jsx';
import PromotionManagePage from '@pages/staff/PromotionManagePage.jsx';
import ReportPage from '@pages/staff/ReportPage';
import ScreenManagePage from '@pages/staff/ScreenManagePage.jsx';
import BranchManagePage from '@pages/staff/BranchManagePage.jsx';
import AccountManagePage from '@pages/staff/AccountManagePage.jsx';
import ResetPwdEmail from '@pages/ResetPwdEmail.jsx';
import ForgotPassword from '@pages/ForgotPassword.jsx';
import StaffRoot from '@pages/staff/StaffRoot.jsx';
import MovieManagePage from '@pages/staff/MovieManagePage.jsx';
import SnackManagePage from '@pages/staff/SnackManagePage.jsx';
import TicketPurchase from '@pages/TicketPurchase';
import AboutUs from '@/pages/AboutUs';
import SnackPurchase from '@pages/SnackPurchase.jsx';
import UserProfile from '@pages/UserProfile.jsx';
import LunarPointsPage from '@pages/LunarPoints.jsx';
import WatchHistoryPage from '@/pages/WatchHistory';

import Developing from '@/pages/others/Developing.jsx';
import NotFound from '@/pages/others/NotFound.jsx';

// Route aliases for better portability
export const ROUTES = {
    // Public routes
    HOME: '/',
    REGISTER: '/register',
    ACTIVATION: '/activate',
    LOGIN: '/login',
    RESET_PASSWORD: '/reset-password',
    RESET_PASSWORD_CONFIRM: '/reset-password/confirm',
    MOVIES: '/movies',
    NOT_FOUND: '/404',
    BUY_TICKET: '/buy-ticket',
    ABOUT_US: '/about-us',
    BUY_SNACK: '/buy-snack',

    // Customer routes
    CHANGE_PASSWORD: '/change-password',
    PROFILE: '/user-profile',
    WISHLIST: '/wishlist',
    WATCH_HISTORY: '/watch-history',
    LUNAR_POINT: '/lunar-points',
    
    // Staff routes
    STAFF_ROOT: '/staff',
    STAFF_LOGIN: '/staff/login',
    STAFF_RESET_PASSWORD: '/staff/reset-password',
    STAFF_RESET_PASSWORD_CONFIRM: '/reset-password/confirm',
    STAFF_CHANGE_PASSWORD: '/staff/change-password',
    STAFF_CHECKIN: '/staff/checkin',
    STAFF_SCHEDULE: '/staff/schedule',
    STAFF_PROMOTION: '/staff/promotion',
    STAFF_REPORT: '/staff/report',
    STAFF_SCREEN: '/staff/screen',
    STAFF_BRANCH: '/staff/branch',
    STAFF_ACCOUNT: '/staff/account',
    STAFF_MOVIE: '/staff/movie',
    STAFF_SNACK: '/staff/snack',

    // Other pages
    DEVELOPING: '/developing',
    NOT_FOUND: '/404'
};

// Route configuration
export const routeConfig = [
    // Public routes - accessible to all users
    {
        path: ROUTES.HOME,
        component: LandingPage,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.REGISTER,
        component: Registration,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.ACTIVATION,
        component: ActivateAccount,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.LOGIN,
        component: Login,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.RESET_PASSWORD,
        component: ForgotPassword,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.RESET_PASSWORD_CONFIRM,
        component: ResetPwdEmail,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.MOVIES,
        component: MovieListPage,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.BUY_TICKET,
        component: TicketPurchase,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.BUY_SNACK,
        component: SnackPurchase,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.DEVELOPING,
        component: Developing,
        type: 'public',
        requiresAuth: false
    },
    {
        path: ROUTES.NOT_FOUND,
        component: NotFound,
        type: 'public',
        requiresAuth: false
    },

    // Customer protected routes - require authentication but not staff roles
    {
        path: ROUTES.CHANGE_PASSWORD,
        component: ChangePwd,
        type: 'customer',
        requiresAuth: true,
        allowedRoles: ['customer'] // Only customers can access this
    },
    {
        path: ROUTES.PROFILE,
        component: UserProfile,
        type: 'customer',
        requiresAuth: true,
        allowedRoles: ['customer']
    },

    {
        path: ROUTES.WATCH_HISTORY,
        component: WatchHistoryPage,
        type: 'customer',
        requiresAuth: true,
        allowedRoles: ['customer']
    },

    {
        path: ROUTES.LUNAR_POINT,
        component: LunarPointsPage,
        type: 'customer',
        requiresAuth: true,
        allowedRoles: ['customer']
    },

    // Staff public routes - accessible to all staff without authentication
    {
        path: ROUTES.STAFF_LOGIN,
        component: StaffLogin,
        type: 'staff-public',
        requiresAuth: false
    },
    {
        path: ROUTES.STAFF_RESET_PASSWORD,
        component: StaffForgotPwd,
        type: 'staff-public',
        requiresAuth: false
    },
    {
        path: ROUTES.STAFF_RESET_PASSWORD_CONFIRM,
        component: ResetPwdEmail,
        type: 'staff-public',
        requiresAuth: false
    },
    
    // Staff dashboard root
    {
        path: ROUTES.STAFF_ROOT,
        component: StaffRoot,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['cashier', 'checkincounter', 'branchmanager', 'administrator']
    },
    
    // Staff protected routes - require staff roles
    {
        path: ROUTES.STAFF_CHANGE_PASSWORD,
        component: StaffChangePwd,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['cashier', 'checkincounter', 'branchmanager', 'administrator']
    },
    {
        path: ROUTES.STAFF_CHECKIN,
        component: CheckInCounterPage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['checkincounter']
    },
    {
        path: ROUTES.STAFF_SCHEDULE,
        component: ScheduleManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager']
    },
    {
        path: ROUTES.STAFF_PROMOTION,
        component: PromotionManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: ROUTES.STAFF_REPORT,
        component: ReportPage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager', 'administrator']
    },
    {
        path: ROUTES.STAFF_SCREEN,
        component: ScreenManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager']
    },
    {
        path: ROUTES.STAFF_BRANCH,
        component: BranchManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: ROUTES.STAFF_ACCOUNT,
        component: AccountManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: ROUTES.STAFF_MOVIE,
        component: MovieManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['administrator']
    },
    {
        path: ROUTES.STAFF_SNACK,
        component: SnackManagePage,
        type: 'staff',
        requiresAuth: true,
        allowedRoles: ['branchmanager']
    },
    {
        path: ROUTES.ABOUT_US,
        component: AboutUs,
        type: 'public',
        requiresAuth: false
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
    return routePath !== ROUTES.STAFF_LOGIN && routePath !== ROUTES.STAFF_RESET_PASSWORD;
};

export const getRedirectPath = (isAuthenticated, userRoles, route) => {
    // Staff accessing non-staff routes
    if (shouldRedirectStaff(isAuthenticated, userRoles, route.type)) {
        return ROUTES.STAFF_ROOT;
    }
    
    // Customer accessing staff routes
    if (shouldRedirectCustomer(isAuthenticated, userRoles, route.type)) {
        return ROUTES.HOME;
    }
    
    // Unauthenticated users trying to access staff routes
    if (shouldRedirectUnauthenticatedFromStaff(isAuthenticated, route.type, route.path)) {
        return ROUTES.STAFF_LOGIN;
    }
    
    // Protected routes without required roles
    if (route.requiresAuth && !hasRequiredRole(userRoles, route.allowedRoles)) {
        return isStaff(userRoles) ? ROUTES.STAFF_ROOT : ROUTES.HOME;
    }
    
    return null; // No redirect needed
};
