import { useState, useCallback } from 'react';
import { branchService, ticketService } from '@services';
import { useUser } from '@contexts/UserContext';

/**
 * Branch logic hooks for handling branch-level data operations
 */

export const useFetchBranches = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.getAvailableBranches();
      setBranches(data.branches || []);
      return { success: true, data };
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
  const [branch, setBranch] = useState(null);
  const { token } = useUser();

  const getBranchById = async (branchId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await branchService.getBranchDetails(branchId, token);
      setBranch(data);
      return { success: true, data };
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
    console.log('🔄 [useGetScreens] Starting fetch');
    console.log('🏢 [useGetScreens] branchId:', branchId);
    console.log('🔑 [useGetScreens] token available:', !!token);
    
    if (!branchId) {
      console.log('❌ [useGetScreens] No branch selected');
      setError('No branch selected');
      return { success: false, error: 'No branch selected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 [useGetScreens] Calling branchService.getBranchScreens');
      const data = await branchService.getBranchScreens(branchId, token);
      console.log('✅ [useGetScreens] API call success, data:', data);
      
      setScreens(data);
      return { success: true, data };
    } catch (err) {
      console.error('❌ [useGetScreens] API call failed:', err);
      console.error('🔍 [useGetScreens] Error response:', err.response);
      
      const errorMessage = err.response?.data?.message || 'Failed to fetch screens';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getScreens, screens, setScreens, loading, error };
};

export const useCreateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const createScreen = async (branchId, screenData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.createBranchScreen(branchId, screenData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create screen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createScreen, loading, error };
};

export const useUpdateScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateScreen = useCallback(async (branchId, screenId, screenData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.updateBranchScreen(branchId, screenId, screenData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update screen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      const data = await branchService.deleteBranchScreen(branchId, screenId, token);
      return { success: true, data };
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
  const { token, user } = useUser();
  
  const fetchSchedules = async (movieId, branchId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching schedules for movie:', movieId, 'at branch:', branchId);
      const params = movieId ? { movieId } : {};
      const response = await branchService.getBranchSchedules(branchId, params, token);
      console.log('Fetched schedules response:', response);
      
      let transformedSchedules = [];
      
      // Check if response has the new format with direct schedules array
      if (response.schedules && Array.isArray(response.schedules)) {
        // New format: direct schedules array (for branch managers)
        transformedSchedules = response.schedules.map(schedule => ({
          _id: schedule._id,
          movie: schedule.movie,
          screen: {
            _id: schedule.screen._id,
            name: schedule.screen.screenName,
            totalSeats: schedule.screen.size ? (schedule.screen.size.rows * schedule.screen.size.columns) : 0,
            screenType: schedule.screen.screenType,
            size: schedule.screen.size
          },
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          ticketsSold: schedule.ticketsSold || 0,
          occupiedSeats: schedule.OccupiedSeat || [],
          availableSeatsCount: schedule.screen.size ? 
            (schedule.screen.size.rows * schedule.screen.size.columns) - (schedule.ticketsSold || 0) : 0,
        }));
      } else if (response.screens && Array.isArray(response.screens)) {
        // Old format: nested screens with schedules (for customers/cashiers)
        transformedSchedules = response.screens.flatMap(screen =>
          (screen.schedules || []).map(schedule => ({
            _id: schedule._id,
            movie: schedule.movie,
            screen: {
              _id: screen.screenInfo?._id || screen._id,
              name: screen.screenInfo?.screenName || screen.screenName,
              totalSeats: screen.screenInfo?.totalSeats || screen.totalSeats,
              screenType: screen.screenInfo?.screenType || screen.screenType,
              size: screen.screenInfo?.size || screen.size
            },
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            availableSeatsCount: schedule.seatInfo?.availableSeatsCount || 0,
            occupiedSeats: schedule.seatInfo?.occupiedSeats || [],
            heldSeats: schedule.seatInfo?.heldSeats || [],
            ticketsSold: schedule.seatInfo?.occupiedSeatsCount || 0,
          }))
        );
      } else {
        console.warn('Unexpected response format:', response);
      }
      
      console.log('Transformed schedules:', transformedSchedules);
      setSchedules(transformedSchedules);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch schedules';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { schedules, loading, error, fetchSchedules };
};

export const useScheduleMovieScreening = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const scheduleMovieScreening = async (branchId, screeningData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchService.createBranchSchedule(branchId, screeningData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to schedule movie screening';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { scheduleMovieScreening, loading, error };
};

export const useUpdateSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateSchedule = async (branchId, scheduleData) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (scheduleData.id) {
        // Update existing schedule
        data = await branchService.editBranchSchedule(branchId, scheduleData.id, scheduleData, token);
      } else {
        // Create new schedule
        data = await branchService.createBranchSchedule(branchId, scheduleData, token);
      }
      
      return { success: true, data };
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
      const data = await branchService.deleteBranchSchedule(branchId, scheduleId, token);
      return { success: true, data };
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
    console.log('Fetching snacks for branch:', branchId);
    if (!branchId) {
      setError('No branch selected');
      return { success: false, error: 'No branch selected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.getBranchSnacks(branchId, token);
      setSnacks(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch snacks';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { getSnacks, snacks, setSnacks, loading, error };
};

export const useUpdateSnack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateSnack = async (branchId, snackId, snackData) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (snackId) {
        // Update existing snack
        console.log('Updating snack:', snackId, 'in branch:', branchId);
        data = await branchService.editBranchSnack(branchId, snackId, snackData, token);
      } else {
        // Add new snack
        console.log('Adding new snack to branch:', branchId, 'Data:', snackData);
        data = await branchService.createBranchSnack(branchId, snackData, token);
      }
      console.log('Snack operation success:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Snack operation failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update snack';
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
      const data = await branchService.deleteBranchSnack(branchId, snackId, token);
      return { success: true, data };
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

// Seat Management Hooks

export const useGetScreenSeats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seats, setSeats] = useState([]);
  const { token } = useUser();

  const getScreenSeats = useCallback(async (branchId, screenId) => {
    if (!branchId || !screenId) {
      const errorMsg = 'Branch ID and Screen ID are required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.getScreenSeats(branchId, screenId, token);
      setSeats(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch seats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { getScreenSeats, seats, setSeats, loading, error };
};

export const useCreateSeat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const createSeat = async (branchId, screenId, seatData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.createSeat(branchId, screenId, seatData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create seat';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createSeat, loading, error };
};

export const useBulkCreateSeats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const bulkCreateSeats = useCallback(async (branchId, screenId, seatsData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.bulkCreateSeats(branchId, screenId, seatsData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create seats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { bulkCreateSeats, loading, error };
};

export const useUpdateSeat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const updateSeat = useCallback(async (branchId, screenId, seatId, seatData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.updateSeat(branchId, screenId, seatId, seatData, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update seat';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { updateSeat, loading, error };
};

export const useRemoveSeat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const removeSeat = async (branchId, screenId, seatId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await branchService.deleteSeat(branchId, screenId, seatId, token);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove seat';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { removeSeat, loading, error };
};
