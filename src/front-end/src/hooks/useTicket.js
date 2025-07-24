import { useState } from 'react';
import axios from 'axios';
import { getApiUrl, getTicketApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';

/**
 * Ticket logic hooks for managing ticket booking, seat selection, and related operations
 */

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

export const useSelectSeat = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const selectSeat = (seat) => {
    setSelectedSeats(prev => {
      const isAlreadySelected = prev.find(s => s.id === seat.id);
      if (isAlreadySelected) {
        return prev; // Don't add duplicate
      }
      return [...prev, seat];
    });
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
  };

  return { selectSeat, selectedSeats, clearSelectedSeats };
};

export const useRemoveSeat = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const removeSeat = (seatId) => {
    setSelectedSeats(prev => prev.filter(seat => seat.id !== seatId));
  };

  const updateSelectedSeats = (seats) => {
    setSelectedSeats(seats);
  };

  return { removeSeat, selectedSeats, updateSelectedSeats };
};

export const useSelectSnack = () => {
  const [selectedSnacks, setSelectedSnacks] = useState({});

  const selectSnack = (snackId, quantity) => {
    setSelectedSnacks(prev => ({
      ...prev,
      [snackId]: {
        ...prev[snackId],
        quantity: (prev[snackId]?.quantity || 0) + quantity
      }
    }));
  };

  const updateSnackQuantity = (snackId, quantity) => {
    if (quantity <= 0) {
      setSelectedSnacks(prev => {
        const updated = { ...prev };
        delete updated[snackId];
        return updated;
      });
    } else {
      setSelectedSnacks(prev => ({
        ...prev,
        [snackId]: { ...prev[snackId], quantity }
      }));
    }
  };

  const clearSelectedSnacks = () => {
    setSelectedSnacks({});
  };

  return { selectSnack, updateSnackQuantity, selectedSnacks, clearSelectedSnacks };
};

export const useCalculateTotal = () => {
  const calculateTotal = (seats, snacks, promotion = null) => {
    const seatTotal = seats.reduce((total, seat) => total + (seat.price || 0), 0);
    
    const snackTotal = Object.entries(snacks).reduce((total, [snackId, snackData]) => {
      return total + (snackData.price * snackData.quantity);
    }, 0);

    let subtotal = seatTotal + snackTotal;
    let discount = 0;

    if (promotion) {
      if (promotion.type === 'percentage') {
        discount = subtotal * (promotion.value / 100);
      } else if (promotion.type === 'fixed') {
        discount = Math.min(promotion.value, subtotal);
      }
    }

    const total = Math.max(0, subtotal - discount);

    return {
      seatTotal,
      snackTotal,
      subtotal,
      discount,
      total
    };
  };

  return { calculateTotal };
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
  const [sessionId, setSessionId] = useState(null);
  const { token } = useUser();

  const startHoldSession = async (scheduleId, seatIds) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/seats/hold', {
        scheduleId,
        seatIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionId(response.data.sessionId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to hold seats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { startHoldSession, sessionId, loading, error };
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
