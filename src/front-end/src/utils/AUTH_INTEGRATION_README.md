# Authentication Integration Documentation

This document describes the authentication system integration for the Lumiere Cinema frontend application.

## Overview

The authentication system has been integrated with the backend API to provide secure user authentication, registration, and password management. The system supports role-based access control and maintains user sessions through JWT tokens.

## Components Updated

### 1. User Context (`src/contexts/UserContext.jsx`)
- Enhanced with proper authentication state management
- Includes user data, authentication status, and token management
- Provides login/logout functions and localStorage persistence

### 2. Authentication API (`src/utils/auth.utils.js`)
- Centralized API functions for all authentication operations
- Axios interceptors for automatic token handling
- Password validation utilities
- Role checking utilities

### 3. Login Form (`src/layouts/Login/LoginForm.jsx`)
- Integrated with backend login API
- Proper error handling and loading states
- Role-based navigation after successful login

### 4. Registration Form (`src/layouts/Registration/RegistrationForm.jsx`)
- Integrated with backend registration API
- Enhanced password validation
- Success/error message handling

### 5. Change Password Form (`src/layouts/ChangePwd/ChangePwdForm.jsx`)
- Supports both regular password change and reset password flows
- Integrated with backend change-password and reset-password APIs
- Token-based password reset functionality

### 6. Forgot Password (`src/pages/ForgotPassword.jsx`)
- New page for initiating password reset
- Sends reset email through backend API

### 7. Protected Routes (`src/components/ProtectedRoute.jsx`)
- HOC for protecting routes based on authentication and roles
- Automatic redirect to login for unauthenticated users
- Role-based access control

## API Endpoints

The system integrates with the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/reset-password` - Reset password with token

## User Roles

The system supports the following user roles:

- **`customer`** - Default role for regular users
- **`cashier`** - Staff role for cashier operations
- **`checkincounter`** - Staff role for check-in counter operations
- **`branchmanager`** - Management role for branch operations
- **`administrator`** - Full system administrator role

### Role-Based Access Control

Routes are protected based on user roles:

```jsx
// Customer routes
<Route path="/change-password" element={
    <ProtectedRoute>
        <ChangePwd />
    </ProtectedRoute>
} />

// Staff routes (any staff role)
<Route path="/staff/change-password" element={
    <ProtectedRoute requiredRoles={['cashier', 'checkincounter', 'branchmanager', 'administrator']}>
        <StaffChangePwd />
    </ProtectedRoute>
} />

// Check-in counter access
<Route path="/staff/checkin" element={
    <ProtectedRoute requiredRoles={['checkincounter', 'branchmanager', 'administrator']}>
        <CheckInCounterPage />
    </ProtectedRoute>
} />

// Management access
<Route path="/staff/schedule" element={
    <ProtectedRoute requiredRoles={['branchmanager', 'administrator']}>
        <ScheduleManagePage />
    </ProtectedRoute>
} />

// Administrator only
<Route path="/staff/account" element={
    <ProtectedRoute requiredRoles={['administrator']}>
        <AccountManagePage />
    </ProtectedRoute>
} />
```

## Usage Examples

### Using the User Context

```jsx
import { useUser } from '../contexts/UserContext.jsx';

const MyComponent = () => {
    const { user, isAuthenticated, login, logout } = useUser();

    if (!isAuthenticated) {
        return <div>Please login</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <p>Role: {user.roles.join(', ')}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};
```

### Using Authentication API

```jsx
import { authAPI } from '../utils/auth.utils.js';

const handleLogin = async (credentials) => {
    try {
        const response = await authAPI.login(credentials);
        // Handle successful login
    } catch (error) {
        // Handle login error
    }
};
```

### Role Checking

```jsx
import { hasRole, isStaff, ROLES } from '../utils/auth.utils.js';

const userRoles = ['cashier', 'customer'];

if (hasRole(userRoles, [ROLES.CASHIER])) {
    // User has cashier role
}

if (isStaff(userRoles)) {
    // User has any staff role
}
```

## Security Features

1. **JWT Token Management**: Automatic token storage and transmission
2. **Token Expiration Handling**: Automatic logout on token expiration
3. **Password Validation**: Strong password requirements enforced
4. **Role-Based Access**: Route protection based on user roles
5. **Secure API Calls**: Axios interceptors for consistent authentication

## Environment Variables

Make sure to set the following environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Error Handling

The system includes comprehensive error handling:

- Network errors are caught and displayed to users
- Invalid credentials show appropriate error messages
- Token expiration automatically redirects to login
- Form validation provides real-time feedback

## Testing

To test the authentication system:

1. Start the backend server
2. Register a new user account
3. Login with valid credentials
4. Test password change functionality
5. Test logout functionality
6. Test protected routes with different user roles

## Troubleshooting

Common issues and solutions:

1. **Token not persisting**: Check localStorage support in browser
2. **API calls failing**: Verify backend server is running and CORS is configured
3. **Role access denied**: Verify user has required roles in backend
4. **Password reset not working**: Check email configuration in backend
