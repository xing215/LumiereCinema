import { useState } from 'react';
import { adminService, movieService, promotionService } from '@services';
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
      const data = await adminService.getAllUsers(token);
      setAccounts(data);
      return { success: true, data };
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
      const data = await adminService.createUser(accountData, token);
      return { success: true, data };
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
        await adminService.updateUserDetails(accountId, otherData, token);
      }

      // Then update roles if provided
      if (roles && Array.isArray(roles)) {
        await adminService.updateUserRoles(accountId, { roles }, token);
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
      const data = await adminService.updateUserRoles(userId, { permissions }, token);
      return { success: true, data };
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
      const data = await adminService.deleteUser(accountId, token);
      return { success: true, data };
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
      const response = await promotionService.getAllPromotions(token);
      // Backend returns direct array of promotions
      const data = Array.isArray(response) ? response : [];
      setPromotions(data);
      return { success: true, data };
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
      const response = await promotionService.createPromotion(promotionData, token);
      // Backend returns { message: '...', promotion: {...} }
      return { success: true, data: response.promotion || response };
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
      const response = await promotionService.updatePromotion(promotionId, promotionData, token);
      // Backend returns { message: '...', promotion: {...} }
      return { success: true, data: response.promotion || response };
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
      const response = await promotionService.deletePromotion(promotionId, token);
      // Backend returns { message: '...' }
      return { success: true, data: response };
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
      const data = await movieService.getAllMovies(token);
      setMovies(data);
      return { success: true, data };
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
    
    try {
      const data = await movieService.addMovie(movieData, token);
      console.log('Add movie response:', data);
      return { success: true, data };
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
      const data = await movieService.updateMovie(movieId, movieData, token);
      return { success: true, data };
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
      const data = await movieService.deleteMovie(movieId, token);
      return { success: true, data };
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
      const data = await adminService.createBranch(branchData, token);
      return { success: true, data };
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
      const data = await adminService.updateBranch(branchId, branchData, token);
      return { success: true, data };
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
      const data = await adminService.deleteBranch(branchId, token);
      return { success: true, data };
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
      const data = await adminService.getAllBranches(token);
      setBranches(data);
      return { success: true, data };
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
