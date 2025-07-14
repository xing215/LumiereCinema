// Staff Sidebar Configuration
// This file contains the configuration for the staff sidebar navigation
//
// PERMISSION-BASED FILTERING SYSTEM:
// - Main navigation items use permission-based filtering
// - Each role defines a set of permissions
// - Navigation items specify required permissions
// - Users see items based on permissions granted by their roles
// - Quick actions and bottom items still use role-based filtering for backward compatibility
//
// ROLE HIERARCHY: all > admin > manager > cashier/checkin

import { Film, Users, Ticket, Calendar, MapPin, Gift, Settings, LogOut, BarChart3, Coffee, Monitor, UserCheck } from 'lucide-react';
import LogoImage from '../../assets/img/Logo.svg';

export const sidebarConfig = {
    // Application info
    app: {
        name: 'Lumiere Cinema',
        logo: LogoImage,
        version: '1.0.0',
    },

    // User roles and permissions
    roles: {
        none: {
            name: 'No Permissions',
            permissions: [],
        },
        all: {
            name: 'All Permissions',
            permissions: ['all'],
        },
        admin: {
            name: 'Administrator',
            permissions: ['users', 'movies', 'branches', 'promotions', 'analytics'],
        },
        manager: {
            name: 'Branch Manager',
            permissions: ['schedules', 'screens', 'analytics', 'snacks'],
        },
        cashier: {
            name: 'Cashier',
            permissions: ['tickets'],
        },
        checkin: {
            name: 'Check-in counter',
            permissions: ['checkin'],
        },
    },

    // Main navigation items
    // These items use permission-based filtering - each item specifies required permissions
    // The user's permissions are derived from their roles
    mainItems: [
        {
            id: 'sell-ticket',
            label: 'Sell ticket',
            icon: Ticket,
            path: '#',
            description: 'Sell movie tickets',
            permissions: ['tickets'],
            badge: null,
        },
        {
            id: 'checkin-ticket',
            label: 'Check-in ticket',
            icon: UserCheck,
            path: '/staff/checkin',
            description: 'Check-in customer tickets',
            permissions: ['checkin'],
            badge: null,
        },
        {
            id: 'sell-snack',
            label: 'Sell snack',
            icon: Coffee,
            path: '#',
            description: 'Sell snacks and beverages',
            permissions: ['tickets'],
            badge: null,
        },
        {
            id: 'manage-movie',
            label: 'Manage movie',
            icon: Film,
            path: '#',
            description: 'Manage movie catalog',
            permissions: ['movies'],
            badge: null,
        },
        {
            id: 'manage-schedule',
            label: 'Manage schedule',
            icon: Calendar,
            path: '/staff/schedule',
            description: 'Manage movie schedules',
            permissions: ['schedules'],
            badge: null,
        },
        {
            id: 'manage-snack',
            label: 'Manage snack',
            icon: Coffee,
            path: '#',
            description: 'Manage snack inventory',
            permissions: ['snacks'],
            badge: null,
        },
        {
            id: 'manage-promotion',
            label: 'Manage promotion',
            icon: Gift,
            path: '/staff/promotion',
            description: 'Manage promotional campaigns',
            permissions: ['promotions'],
            badge: null,
        },
        {
            id: 'manage-account',
            label: 'Manage account',
            icon: Users,
            path: '/staff/account',
            description: 'Manage user accounts',
            permissions: ['users'],
            badge: null,
        },
        {
            id: 'manage-branch',
            label: 'Manage branch',
            icon: MapPin,
            path: '/staff/branch',
            description: 'Manage cinema branches',
            permissions: ['branches'],
            badge: null,
        },
        {
            id: 'manage-screen',
            label: 'Manage screen',
            icon: Monitor,
            path: '/staff/screen',
            description: 'Manage cinema screens',
            permissions: ['screens'],
            badge: null,
        },
        {
            id: 'view-report',
            label: 'View report',
            icon: BarChart3,
            path: '#',
            description: 'View analytics and reports',
            permissions: ['analytics'],
            badge: null,
        },
    ],

    // Bottom navigation items
    // These items still use role-based filtering for backward compatibility
    bottomItems: [
        {
            id: 'change-password',
            label: 'Change password',
            icon: Settings,
            path: '/staff/change-password',
            description: 'Change your password',
            roles: null,
            badge: null,
        },
        {
            id: 'logout',
            label: 'Log out',
            icon: LogOut,
            path: '/staff/logout',
            description: 'Sign out',
            action: 'logout',
            roles: null, // Available to all users regardless of role
        },
    ],

    // Sidebar themes
    themes: {
        dark: {
            name: 'Dark Theme',
            bg: 'bg-gray-900',
            text: 'text-white',
            textSecondary: 'text-gray-300',
            hover: 'hover:bg-gray-800',
            active: 'bg-purple-600 text-white',
            border: 'border-gray-700',
            accent: 'text-purple-400',
        },
        light: {
            name: 'Light Theme',
            bg: 'bg-white',
            text: 'text-gray-900',
            textSecondary: 'text-gray-600',
            hover: 'hover:bg-gray-100',
            active: 'bg-purple-100 text-purple-900',
            border: 'border-gray-200',
            accent: 'text-purple-600',
        },
        cinema: {
            name: 'Cinema Theme',
            bg: 'bg-black',
            text: 'text-white',
            textSecondary: 'text-gray-400',
            hover: 'hover:bg-gray-800',
            active: 'bg-red-600 text-white',
            border: 'border-gray-800',
            accent: 'text-red-400',
        },
    },

    // Sidebar settings
    settings: {
        defaultTheme: 'dark',
        defaultCollapsed: false,
        allowThemeChange: true,
        allowCollapse: true,
        showQuickActions: true,
        showBadges: true,
        animationDuration: 300,
        mobileBreakpoint: 'lg',
    },
};

// Helper functions for role and permission checking

// Get all permissions for given user roles
export const getUserPermissions = (userRoles) => {
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
        return [];
    }

    // If user has 'all' role, return all permissions
    if (userRoles.includes('all')) {
        return ['all'];
    }

    const permissions = new Set();

    userRoles.forEach((roleKey) => {
        const role = sidebarConfig.roles[roleKey];
        if (role && role.permissions) {
            role.permissions.forEach((permission) => permissions.add(permission));
        }
    });

    return Array.from(permissions);
};

// Check if user has required permission
export const hasPermission = (userPermissions, requiredPermissions) => {
    if (!requiredPermissions || userPermissions.includes('all')) {
        return true;
    }

    if (!Array.isArray(requiredPermissions)) {
        return userPermissions.includes(requiredPermissions);
    }

    return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

// Legacy role checking function (for backward compatibility with quick actions and bottom items)
export const hasRole = (userRoles, requiredRoles) => {
    if (!requiredRoles || userRoles.includes('all')) {
        return true;
    }

    return requiredRoles.some((role) => userRoles.includes(role));
};

// Filter menu items based on permissions for main items, roles for others
export const filterMenuItems = (items, userRoles, usePermissions = false) => {
    const userPermissions = getUserPermissions(userRoles);

    return items.filter((item) => {
        // For main navigation items, use permission-based filtering
        if (usePermissions && item.permissions) {
            if (!hasPermission(userPermissions, item.permissions)) {
                return false;
            }
        }
        // For other items (quick actions, bottom items), use role-based filtering
        else if (item.roles) {
            if (!hasRole(userRoles, item.roles)) {
                return false;
            }
        }
        // If no permissions or roles specified, show the item

        if (item.subItems) {
            item.subItems = filterMenuItems(item.subItems, userRoles, usePermissions);
        }

        return true;
    });
};

export const getUserRoleInfo = (userRoles) => {
    // Find the highest priority role
    const rolePriority = ['all', 'admin', 'manager', 'cashier', 'checkin', 'none'];

    for (const role of rolePriority) {
        if (userRoles.includes(role)) {
            return {
                key: role,
                info: sidebarConfig.roles[role],
            };
        }
    }

    return {
        key: 'checkin',
        info: sidebarConfig.roles.checkin,
    }; // Default role
};

// Debug utility: Get detailed information about user's roles and permissions
export const getUserDebugInfo = (userRoles) => {
    const permissions = getUserPermissions(userRoles);
    const roleInfo = getUserRoleInfo(userRoles);

    return {
        roles: userRoles,
        permissions: permissions,
        primaryRole: roleInfo,
        canAccess: {
            tickets: hasPermission(permissions, ['tickets']),
            checkin: hasPermission(permissions, ['checkin']),
            snacks: hasPermission(permissions, ['snacks']),
            movies: hasPermission(permissions, ['movies']),
            schedules: hasPermission(permissions, ['schedules']),
            screens: hasPermission(permissions, ['screens']),
            promotions: hasPermission(permissions, ['promotions']),
            users: hasPermission(permissions, ['users']),
            branches: hasPermission(permissions, ['branches']),
            analytics: hasPermission(permissions, ['analytics']),
        },
    };
};

export default sidebarConfig;
