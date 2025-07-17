import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@contexts/UserContext';
import { getApiUrl } from '@config/api.config';

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
      const endpoint = isStaff ? 'staffLogin' : 'login';
      const response = await axios.post(getApiUrl(endpoint), credentials);
      const { token, user } = response.data;
      
      login(user, token);
      return { success: true, data: response.data };
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

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(getApiUrl('register'), userData);
      return { success: true, data: response.data };
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
        await axios.post(getApiUrl('logout'), {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await axios.post(getApiUrl('forgotPassword'), { email });
      setSuccess(true);
      return { success: true, data: response.data };
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

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(getApiUrl('changePassword'), passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
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
      const response = await axios.post(getApiUrl('staffLogin'), credentials);
      const { token, user } = response.data;
      
      login(user, token);
      return { success: true, data: response.data };
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
