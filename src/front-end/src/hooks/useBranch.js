import { useState } from 'react';
import axios from 'axios';
import { getApiUrl, buildApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';

/**
 * Branch logic hooks for handling branch-level data operations
 */

export const useFetchBranches = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const { token } = useUser();

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(getApiUrl('branches'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(response.data.branches || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch branches';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { fetchBranches, branches, loading, error };
};

export const useGetBranchById = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();
  const [branch, setBranch] = useState(null);

  const getBranchById = async (branchId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(buildApiUrl(`/api/branches/${branchId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranch(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch branch';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getBranchById, branch, loading, error };
};

export const useSetCurrentBranch = () => {
  const [currentBranch, setCurrentBranchState] = useState(() => {
    return localStorage.getItem('currentBranch') || null;
  });

  const setCurrentBranch = (branchId) => {
    setCurrentBranchState(branchId);
    localStorage.setItem('currentBranch', branchId);
  };

  const clearCurrentBranch = () => {
    setCurrentBranchState(null);
    localStorage.removeItem('currentBranch');
  };

  return { currentBranch, setCurrentBranch, clearCurrentBranch };
};

export const useGetScreens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screens, setScreens] = useState([]);
  const { token } = useUser();
  const { currentBranch } = useSetCurrentBranch();

  const getScreens = async (branchId = currentBranch) => {
    if (!branchId) {
      setError('No branch selected');
      return { success: false, error: 'No branch selected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/branches/${branchId}/screens`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScreens(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch screens';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getScreens, screens, loading, error };
};

export const useUpdateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateScreen = async (branchId, screenId, screenData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/branches/${branchId}/screens/${screenId}`, screenData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update screen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateScreen, loading, error };
};

export const useRemoveScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeScreen = async (branchId, screenId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/branches/${branchId}/screens/${screenId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove screen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeScreen, loading, error };
};

export const useGetSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();
  const fetchSchedules = async (movieId, branchId) => {
    setLoading(true);
    setError(null);
    try {
      const url = buildApiUrl(`/api/tickets/${branchId}/schedule`);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: movieId ? { movieId } : {}
      });
      const screens = response.data.screens || [];
    const allSchedules = screens.flatMap(screen =>
      (screen.schedules || []).map(schedule => ({
        _id: schedule._id,
        movie: schedule.movie,
        screen: {
          _id: screen._id,
          name: screen.screenInfo?.screenName || screen.screenName,
          totalSeats: screen.screenInfo?.totalSeats || screen.totalSeats,
        },
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        availableSeatsCount: schedule.seatInfo?.availableSeatsCount || 0,
      }))
    );
    setSchedules(allSchedules);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch schedules';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { schedules, loading, error, fetchSchedules };
};

export const useUpdateSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateSchedule = async (branchId, scheduleData) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = scheduleData.id 
        ? `/api/branches/${branchId}/schedules/${scheduleData.id}`
        : `/api/branches/${branchId}/schedules`;
      
      const method = scheduleData.id ? 'put' : 'post';
      const response = await axios[method](url, scheduleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update schedule';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateSchedule, loading, error };
};

export const useRemoveSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeSchedule = async (branchId, scheduleId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/branches/${branchId}/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove schedule';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeSchedule, loading, error };
};

export const useGetSnacks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snacks, setSnacks] = useState([]);
  const { token } = useUser();
  const { currentBranch } = useSetCurrentBranch();

  const getSnacks = async (branchId = currentBranch) => {
    if (!branchId) {
      setError('No branch selected');
      return { success: false, error: 'No branch selected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(buildApiUrl(`/api/branches/${branchId}/snacks`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnacks(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch snacks';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getSnacks, snacks, loading, error };
};

export const useUpdateSnack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateSnack = async (branchId, snackId, snackData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(getBranchSnackApiUrl(branchId, snackId), snackData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update snack';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateSnack, loading, error };
};

export const useRemoveSnack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeSnack = async (branchId, snackId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(getBranchSnackApiUrl(branchId, snackId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove snack';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeSnack, loading, error };
};
