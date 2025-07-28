import { useState } from 'react';
import axios from 'axios';
import { getApiUrl, buildApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';
import  { v4 as uuidv4 } from 'uuid';

/**
 * Ticket logic hooks for managing ticket booking, seat selection, and related operations
 */

export const useGetSchedulesByBranch = () => {
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
        OccupiedSeat: schedule.seatInfo?.occupiedSeats || [],
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

export const useGetSeatsBySchedule = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();
  const fetchSeats = async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(buildApiUrl(`/api/tickets/screen/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }));
      setSeats(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch seats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { seats, loading, error, fetchSeats };
};

export const useFetchAvailableSeats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const { token } = useUser();

  const fetchAvailableSeats = async (scheduleId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/schedules/${scheduleId}/seats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableSeats(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch available seats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { fetchAvailableSeats, availableSeats, loading, error };
};

export const useApplyPromotion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const { token } = useUser();

  const applyPromotion = async (promotionCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/promotions/validate', { code: promotionCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedPromotion(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid promotion code';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearPromotion = () => {
    setAppliedPromotion(null);
    setError(null);
  };

  return { applyPromotion, appliedPromotion, clearPromotion, loading, error };
};

export const useCreateTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const createTicket = async (ticketData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(getApiUrl('createTicket'), ticketData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createTicket, loading, error };
};

export const useStartHoldSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [res, setRes] = useState(null);
  const { token } = useUser();

  const startHoldSession = async ({ scheduleId, seatNumbers, holdDurationMinutes = 5, replaceExisting = false }) => {
    setLoading(true);
    setError(null);
    let sessionId = localStorage.getItem('sessionId');

    console.log(scheduleId, seatNumbers, holdDurationMinutes, replaceExisting);

    try {
      if (!token) {
        if (!sessionId) {
          sessionId = uuidv4();
          localStorage.setItem('sessionId', sessionId);
          console.log('New session created:', sessionId);
        }
      } else {
        sessionId = null;
      }
     const response = await axios.post(getApiUrl('holdSeat'), {
        scheduleId,
        seatNumbers,
        sessionId,
        holdDurationMinutes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Hold session response:', response.data);
      setRes(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to hold seats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { startHoldSession, res, loading, error };
};

export const useClearSession = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useUser();

  const clearSession = async (sessionId) => {
    setLoading(true);
    
    try {
      if (sessionId) {
        await axios.delete(`/api/seats/hold/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to clear session:', err);
      return { success: false, error: 'Failed to clear session' };
    } finally {
      setLoading(false);
    }
  };

  return { clearSession, loading };
};

export const useCheckin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const checkin = async (ticketCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(`/api/tickets/${ticketCode}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Check-in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { checkin, loading, error };
};

export const useActiveTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();

  const activeTicket = async (ticketCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(`/api/tickets/${ticketCode}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ticket activation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { activeTicket, loading, error };
};
