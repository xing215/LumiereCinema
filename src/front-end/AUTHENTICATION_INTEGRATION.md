# Authentication Integration Documentation

## Overview

This document describes the integration of the Login, Registration, and ChangePwd components with the backend authentication system.

## Features Implemented

### 1. User Authentication System
- **Login**: Email/password authentication with JWT token
- **Registration**: Full user registration with validation
- **Password Reset**: Forgot password with email token system
- **Change Password**: For authenticated users and reset token flow

### 2. User Context Management
- Persistent authentication state using localStorage
- User profile and roles management
- Auto-logout on token expiration

### 3. Backend Integration
- RESTful API calls to `/api/auth/` endpoints
- Proper error handling and user feedback
- Token-based authentication with automatic header injection

## API Endpoints

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## Frontend Components

### 1. Login Form (`/src/layouts/Login/LoginForm.jsx`)
- Email and password validation
- Backend API integration
- Auto-redirect based on user role
- Error handling and loading states

### 2. Registration Form (`/src/layouts/Registration/RegistrationForm.jsx`)
- Full form validation (name, email, phone, password, etc.)
- Strong password validation
- Auto-login after successful registration
- Real-time field validation

### 3. Change Password Form (`/src/layouts/ChangePwd/ChangePwdForm.jsx`)
- Two modes: authenticated user or reset token
- Strong password validation
- Current password verification (for authenticated users)
- Token-based reset flow

### 4. Forgot Password (`/src/pages/ForgotPassword.jsx`)
- Email input for password reset request
- Email validation
- Success/error message display

## Authentication Utils (`/src/utils/auth.utils.js`)

### Functions
- `authAPI.login(credentials)` - Login user
- `authAPI.register(userData)` - Register new user
- `authAPI.logout()` - Logout user
- `authAPI.changePassword(passwordData)` - Change password
- `authAPI.forgotPassword(email)` - Request password reset
- `authAPI.resetPassword(resetData)` - Reset password with token

### Password Validation
- `validatePassword(password)` - Check password strength
- `formatPasswordErrors(errors)` - Format validation errors

## User Context (`/src/contexts/UserContext.jsx`)

### State Management
- `user` - Current user object
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state
- `token` - JWT token

### Methods
- `login(userData, token)` - Login user
- `logout()` - Logout user
- `updateUser(userData)` - Update user profile

## Protected Routes (`/src/components/ProtectedRoute.jsx`)

Higher-order component for protecting routes that require authentication:

```jsx
<ProtectedRoute requiredRoles={['admin']}>
  <AdminComponent />
</ProtectedRoute>
```

## Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Environment Variables

Make sure to set up the following environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Usage Examples

### Login
```jsx
const handleLogin = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    login(response.user, response.token);
    navigate('/dashboard');
  } catch (error) {
    setError(error.response?.data?.message);
  }
};
```

### Registration
```jsx
const handleRegister = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    login(response.user, response.token);
    navigate('/');
  } catch (error) {
    setError(error.response?.data?.message);
  }
};
```

### Using User Context
```jsx
const { isAuthenticated, user, logout } = useUser();

if (isAuthenticated) {
  return <div>Welcome, {user.name}!</div>;
}
```

## Security Features

1. **JWT Token Management**: Automatic token inclusion in API requests
2. **Token Expiration**: Auto-logout when token expires
3. **Password Security**: Strong password requirements
4. **Input Validation**: Real-time form validation
5. **Error Handling**: Proper error messages and user feedback

## Testing

To test the authentication system:

1. Start the backend server
2. Start the frontend development server
3. Navigate to `/register` to create a new account
4. Navigate to `/login` to login with existing credentials
5. Use `/reset-password` to test password reset flow
6. Use `/change-password` to test password change functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend CORS configuration includes the frontend URL
2. **Token Expiration**: Check if JWT_SECRET is set correctly in backend
3. **Email Issues**: Verify email service configuration for password reset
4. **Database Connection**: Ensure MongoDB connection is working

### Error Messages

- "Email or password is incorrect" - Invalid login credentials
- "Password is not strong enough" - Password doesn't meet requirements
- "Email already exists" - User with email already registered
- "Invalid or expired reset token" - Reset token is invalid or expired

## Future Enhancements

1. **OAuth Integration**: Add Google/Facebook login
2. **Two-Factor Authentication**: Add 2FA support
3. **Email Verification**: Verify email addresses during registration
4. **Session Management**: Better session handling
5. **Role-Based Access**: More granular role permissions
