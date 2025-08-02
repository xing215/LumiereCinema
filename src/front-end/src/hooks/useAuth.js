import { useState, useEffect } from 'react';
import { useUser } from '@contexts/UserContext';
import { authService } from '@services';
import { useError } from '@contexts/ErrorContext';

/**
 * Authentication hooks for handling user login, registration, logout, and password management
 */

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useUser();

  const loginUser = async (credentials, isStaff = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = isStaff 
        ? await authService.staffLogin(credentials)
        : await authService.login(credentials);
      
      const { token, user } = data;
      login(user, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, loading, error };
};

export const useAuthInterceptor = () => {
  const { logout } = useUser();
  const { showError } = useError();
  useEffect(() => {
    const axios = require('axios');
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
          showError('', 'You have to login to access this resource.');
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout, showError]);
};

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userData);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { registerUser, loading, error };
};

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { logout, token } = useUser();

  const logoutUser = async () => {
    setLoading(true);
    
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      setLoading(false);
    }
  };

  return { logoutUser, loading };
};


export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await authService.forgotPassword(email);
      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
};

export const useStaffForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await authService.staffForgotPassword(email);
      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Staff password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
};

// Hook for both user and staff password reset
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (resetData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await authService.resetPassword(resetData);
      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
};

export const useActivateAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const activateAccount = async (activateToken) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const data = await authService.activateAccount(activateToken);
      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Account activation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { activateAccount, loading, error, success };
};

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.changePassword(passwordData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
};

export const useStaffLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useUser();

  const staffLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.staffLogin(credentials);
      const { token, user } = data;
      
      login(user, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Staff login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { staffLogin, loading, error };
};
