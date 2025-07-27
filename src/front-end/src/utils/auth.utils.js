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
    if (!/[!@#$%^&*(),.?":{}|<>-]/.test(password)) {
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
