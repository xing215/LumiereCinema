import axios from 'axios';
import API_CONFIG from '../config/api.config.js';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication API functions
export const authAPI = {
    login: async (credentials) => {
        const response = await api.post(API_CONFIG.endpoints.login, credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post(API_CONFIG.endpoints.register, userData);
        return response.data;
    },

    logout: async () => {
        const response = await api.post(API_CONFIG.endpoints.logout);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await api.post(API_CONFIG.endpoints.changePassword, passwordData);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post(API_CONFIG.endpoints.forgotPassword, { email });
        return response.data;
    },

    resetPassword: async (resetData) => {
        const response = await api.post(API_CONFIG.endpoints.resetPassword, resetData);
        return response.data;
    },
};

// Helper functions for password validation
export const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return errors;
};

export const formatPasswordErrors = (errors) => {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0];
    
    return 'Password must have at least 8 characters, including uppercase, lowercase, numbers and special characters.';
};

// Role checking utilities
export const ROLES = {
    CUSTOMER: 'customer',
    CASHIER: 'cashier',
    CHECKIN_COUNTER: 'checkincounter',
    BRANCH_MANAGER: 'branchmanager',
    ADMINISTRATOR: 'administrator'
};

export const STAFF_ROLES = [
    ROLES.CASHIER,
    ROLES.CHECKIN_COUNTER,
    ROLES.BRANCH_MANAGER,   
    ROLES.ADMINISTRATOR
];

export const hasRole = (userRoles, requiredRoles) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;
    if (!requiredRoles || !Array.isArray(requiredRoles)) return false;
    
    return requiredRoles.some(role => userRoles.includes(role));
};

export const isStaff = (userRoles) => {
    return hasRole(userRoles, STAFF_ROLES);
};

export const isAdmin = (userRoles) => {
    return hasRole(userRoles, [ROLES.ADMINISTRATOR]);
};

export const isBranchManager = (userRoles) => {
    return hasRole(userRoles, [ROLES.BRANCH_MANAGER]);
};

export const isCustomer = (userRoles) => {
    return hasRole(userRoles, [ROLES.CUSTOMER]);
};

export default api;
