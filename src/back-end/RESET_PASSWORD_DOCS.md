# Reset Password Implementation

## Overview
This implementation provides a complete reset password flow for the Lumiere Cinema application, including both backend API endpoints and frontend integration.

## Backend Implementation

### Routes Added
1. **POST /api/auth/forgot-password** - User enters email and system sends reset link
2. **POST /api/auth/reset-password** - User clicks email link and resets password with token

### Controller Functions
1. **forgotPassword()** - Generates a reset token and sends email with reset link
2. **resetPassword()** - Validates token and updates user password

## Frontend Integration

### Components Modified
1. **ChangePwdForm.jsx** - Added ResetToken parameter support
2. **ResetPwdForm.jsx** - Integrated with reset password API
3. **ResetPwdEmail.jsx** - Extract token from URL and pass to ChangePwdForm

### Key Features
- **Conditional UI**: Current password field is hidden when using ResetToken
- **API Integration**: Both forms connect to backend APIs
- **Loading States**: UI shows loading states during API calls
- **Error Handling**: Proper error messages and success notifications
- **Auto-redirect**: After successful password reset, user is redirected to login

## Setup Instructions

### 1. Environment Variables
Add these to your backend `.env` file:
```
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Email Configuration
- Use Gmail or another SMTP service
- For Gmail, use App Password (not regular password)
- Configure the nodemailer transporter as needed

### 3. Database
The User model already includes required fields:
- `passwordResetToken` - Stores the reset token
- `passwordResetExpires` - Token expiration time

## Usage Flow

### Regular Password Change
1. User navigates to `/change-password`
2. Must provide current password
3. Form validates and calls `/api/auth/change-password`

### Reset Password via Email
1. User goes to `/reset-password` and enters email
2. Backend generates token and sends email via `/api/auth/forgot-password`
3. User clicks link in email (goes to `/reset-password/confirm?token=xyz`)
4. Form skips current password field
5. User enters new password
6. Form calls `/api/auth/reset-password` with token

## Security Features
- Tokens expire after 1 hour
- Secure token generation using crypto.randomBytes
- Password strength validation
- Email existence not revealed for security
- Tokens are cleared after use

## Testing
1. Start backend server
2. Start frontend server
3. Test email functionality (ensure email credentials are configured)
4. Test both password change flows

## Dependencies Added
- `nodemailer` - For sending emails
- `crypto` - Built-in Node.js module for token generation

## API Request Function
Added `apiRequest` function to `api.config.js` for making HTTP requests:
- Automatically handles authorization tokens
- Provides consistent error handling
- Supports all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Automatically adds Content-Type headers
