import { useState } from 'react';
import axios from 'axios';
import { getApiUrl, getMovieApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';

/**
 * Administration logic hooks for system-wide administration tasks
 */

export const useGetAccounts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { token } = useUser();

  const getAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Making request to: http://localhost:5000/api/admin/users');
      console.log('🔍 Token:', token);
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🔍 Raw response:', response);
      console.log('🔍 Response data:', response.data);
      setAccounts(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('🔍 Error details:', err);
      console.error('🔍 Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Failed to fetch accounts';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getAccounts, accounts, setAccounts, loading, error };
};

export const useAddAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const addAccount = async (accountData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/admin/users', accountData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { addAccount, loading, error };
};

export const useUpdateAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateAccount = async (accountId, accountData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Separate roles from other data
      const { roles, ...otherData } = accountData;
      
      // First update basic user details if any
      if (Object.keys(otherData).length > 0) {
        const requestBody = {
          userId: accountId,
          updateData: otherData
        };
        
        await axios.put(`http://localhost:5000/api/admin/users/${accountId}`, requestBody, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Then update roles if provided
      if (roles && Array.isArray(roles)) {
        const rolesRequestBody = {
          userId: accountId,
          updateData: { roles }
        };
        
        await axios.patch(`http://localhost:5000/api/admin/users/${accountId}/roles`, rolesRequestBody, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateAccount, loading, error };
};

export const useUpdateUserPermission = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateUserPermission = async (userId, permissions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(`/api/admin/users/${userId}/roles`, 
        { permissions }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update permissions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateUserPermission, loading, error };
};

export const useRemoveAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeAccount = async (accountId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeAccount, loading, error };
};

export const useGetPromotions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const { token } = useUser();

  const getPromotions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch promotions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getPromotions, promotions, loading, error };
};

export const useAddPromotion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const addPromotion = async (promotionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/admin/promotions', promotionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add promotion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { addPromotion, loading, error };
};

export const useUpdatePromotion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updatePromotion = async (promotionId, promotionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/admin/promotions/${promotionId}`, promotionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update promotion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updatePromotion, loading, error };
};

export const useRemovePromotion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removePromotion = async (promotionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/admin/promotions/${promotionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove promotion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removePromotion, loading, error };
};

export const useGetMovies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const { token } = useUser();

  const getMovies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('allMovies'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch movies';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getMovies, movies, setMovies, loading, error };
};

export const useAddMovie = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const addMovie = async (movieData) => {
    setLoading(true);
    setError(null);
    
    console.log('Adding movie with data:', movieData);
    console.log('API URL:', getApiUrl('addMovie'));
    
    try {
      const response = await axios.post(getApiUrl('addMovie'), movieData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Add movie response:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Add movie error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to add movie';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { addMovie, loading, error };
};

export const useUpdateMovie = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateMovie = async (movieId, movieData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(getMovieApiUrl(movieId), movieData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update movie';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateMovie, loading, error };
};

export const useRemoveMovie = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeMovie = async (movieId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(getMovieApiUrl(movieId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove movie';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeMovie, loading, error };
};

export const useAddBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const addBranch = async (branchData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/admin/branches', branchData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add branch';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { addBranch, loading, error };
};

export const useUpdateBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateBranch = async (branchId, branchData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/admin/branches/${branchId}`, branchData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update branch';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateBranch, loading, error };
};

export const useRemoveBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeBranch = async (branchId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/admin/branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove branch';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeBranch, loading, error };
};

export const useGetBranches = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const { token } = useUser();

  const getBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Making request to: http://localhost:5000/api/admin/branches');
      console.log('🔍 Token:', token);
      const response = await axios.get('http://localhost:5000/api/admin/branches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🔍 Branches response:', response.data);
      setBranches(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('🔍 Error fetching branches:', err);
      console.error('🔍 Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Failed to fetch branches';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getBranches, branches, setBranches, loading, error };
};
