import { useState } from 'react';
import axios from 'axios';
import { getApiUrl, buildApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';
import  { v4 as uuidv4 } from 'uuid';

/**
 * Ticket logic hooks for managing ticket booking, seat selection, and related operations
 */
export const useGetSeatsBySchedule = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useUser();
  const fetchSeats = async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('gettingseat')
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

  // Accepts promotionCode, snackTotal, movieTotal
  const applyPromotion = async ({ promotionCode, snackTotal, movieTotal, noLoginCustomerInfo }) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Applying promotion:', { promotionCode, snackTotal, movieTotal, noLoginCustomerInfo });
      const response = await axios.post(
        getApiUrl('checkDiscountedTotal'),
        { promotionCode, snackTotal, movieTotal, noLoginCustomerInfo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Promotion applied successfully:', response.data.data);
      setAppliedPromotion(response.data.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Invalid promotion code';
      setAppliedPromotion(null);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  return { applyPromotion, appliedPromotion, loading, error };
};

export const useCreateTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const { token } = useUser();

  // Utility to adapt movieTicketData and snackTicketData to API format
  const buildTicketData = ({movieTicketData, snackTicketData}) => {
    let ticketData = {};
    console.log(movieTicketData, snackTicketData)

    // Add customer/noLoginCustomerInfo if present
    if (movieTicketData?.customer) {
        ticketData.customer = movieTicketData.customer;
    }
    if (movieTicketData?.noLoginCustomerInfo || snackTicketData?.noLoginCustomerInfo) {
        ticketData.noLoginCustomerInfo = movieTicketData?.noLoginCustomerInfo || snackTicketData?.noLoginCustomerInfo;
    }

    // Add branch ID (required field)
    if (movieTicketData?.branch?._id) {
        ticketData.branch = movieTicketData.branch._id;
    } else if (snackTicketData?.branch?._id) {
        ticketData.branch = snackTicketData.branch._id;
    }

    // Add seller if present
    if (movieTicketData?.seller) {
        ticketData.seller = movieTicketData.seller;
    } else if (snackTicketData?.seller) {
        ticketData.seller = snackTicketData.seller;
    }

    // Add promotion code if present
    if (movieTicketData?.promotion || snackTicketData?.promotion) {
        ticketData.promotionCode = movieTicketData?.promotion || snackTicketData?.promotion;
    }

    // Movie ticket data
    if (
        movieTicketData &&
        movieTicketData.schedule?._id &&
        Array.isArray(movieTicketData.seats) && 
        movieTicketData.seats.length > 0
    ) {
        ticketData.movieTicket = {
            schedule: movieTicketData.schedule._id,
            seats: movieTicketData.seats,
            total: movieTicketData.total || 0
        };
    }

    // Snack ticket data
    if (
        snackTicketData &&
        Array.isArray(snackTicketData.snackList) && 
        snackTicketData.snackList.length > 0
    ) {
        // Process and validate snack list
        const snackList = snackTicketData.snackList
            .map(item => {
                // Extract shortname from various possible structures
                let shortname = item.shortname;
                
                // Handle nested object structures
                if (typeof shortname === 'object' && shortname !== null) {
                    if (shortname.shortname) {
                        shortname = shortname.shortname;
                    } else if (shortname._id) {
                        // If it's a populated object, try to get shortname or use _id
                        shortname = shortname.shortname;
                    }
                }

                return {
                    shortname: shortname,
                    quantity: parseInt(item.quantity) || 0
                };
            })
            .filter(item => 
                // Only include valid items
                typeof item.shortname === 'string' && 
                item.shortname.trim().length > 0 && 
                item.quantity > 0
            );

        if (snackList.length > 0) {
            ticketData.snackTicket = { snackList, total: snackTicketData.total || 0 };
        }
    }

    console.log('[buildTicketData] Final ticketData:', ticketData);
    return ticketData;
};
  const createTicket = async ({movieTicketData, snackTicketData}) => {
    setLoading(true);
    setError(null);
    try {
      console.log(movieTicketData, snackTicketData)
      const ticketData = buildTicketData({movieTicketData, snackTicketData});
      console.log('Creating ticket with data:', ticketData);
      const response = await axios.post(buildApiUrl(`/api/tickets/create`), ticketData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Ticket created successfully:', response.data);
      setTicket(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createTicket, ticket, loading, error };
};

export const useStartHoldSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holdSeatData, setHoldSeatData] = useState(null);
  const { token } = useUser();

  const startHoldSession = async ({ scheduleId, seatNumbers, holdDurationMinutes = 10, replaceExisting = false }) => {
  console.log('🔄 Starting hold session...');
  setLoading(true);
  setError(null);
  
  let sessionId = sessionStorage.getItem('sessionId');

  try {
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('sessionId', sessionId);
      console.log('✅ New session created:', sessionId);
    }

    const response = await axios.post(getApiUrl('holdSeat'), {
      scheduleId,
      seatNumbers,
      sessionId,
      holdDurationMinutes
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setError(null);
    setHoldSeatData(response.data);
    console.log('✅ Hold session started:', response.data);
    
    return { success: true, data: response.data };
  } catch (err) {
    console.error('❌ Error in hold session:', err);
    setHoldSeatData(null);
    const errorMessage = err?.response?.data?.error || 'Failed to hold seats';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
    console.log('🏁 Hold session complete');
  }
};

const clearHoldSeatData = () => {
  console.log('🔄 Clearing hold session...');
  setLoading(true);
  setError(null);
  setHoldSeatData(null);
};

  return { startHoldSession, clearHoldSeatData, holdSeatData, loading, error };
};


export const useClearSession = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useUser();

  const clearSession = async () => {
    setLoading(true);
    const sessionId = sessionStorage.getItem('sessionId');

    try {
      console.log(sessionId)
      console.log('clearingsession')
      if (sessionId) {
        await axios.patch(getApiUrl('holdSeat'), {
          action: 'release', sessionId: sessionId
        }, {
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

export const useGetTicketDetailsByCode = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticket, setTicket] = useState(null);
    const { token } = useUser();

    // Hàm getTicket giờ không cần ticketType nữa
    const getTicket = async (ticketCode) => {
        if (!ticketCode) return;
        setLoading(true);
        setError(null);
        setTicket(null);
        
        try {
            // Luôn gọi đến một URL chung (backend sẽ tự xử lý)
            // Chúng ta có thể dùng URL của vé phim làm đại diện
            const url = buildApiUrl(`/api/tickets/movie/admin/${ticketCode}`);
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTicket(response.data); // Dữ liệu trả về giờ đã có trường ticketType
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ticket not found or an error occurred.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };
    return { getTicket, ticket, loading, error };
};

export const useGetSnacksByBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snacks, setSnacks] = useState([]);
  const { token } = useUser();
  // const { currentBranch } = useSetCurrentBranch();

  const getSnacks = async (branchId) => {
    console.log('Fetching snacks for branch:', branchId);
    if (!branchId) {
      setError('No branch selected');
      return { success: false, error: 'No branch selected' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(buildApiUrl(`/api/tickets/${branchId}/snacks`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnacks(response.data.snacks);
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