import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ticketService } from '@services';
import { promotionService } from '@services/promotion.service';
import { useUser } from '@contexts/UserContext';
import { buildApiUrl, getApiUrl } from '@config/api.config';
import { v4 as uuidv4 } from 'uuid';

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
            console.log('gettingseat');
            const data = await ticketService.getSeatMapBySchedule(scheduleId, {}, token);
            setSeats(data);
            return data;
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
            const response = await ticketService.getSeatMapBySchedule(scheduleId, {}, token);
            setAvailableSeats(response);
            return { success: true, data: response };
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
            const response = await ticketService.calculateDiscountedTotal({ promotionCode, snackTotal, movieTotal, noLoginCustomerInfo }, token);
            console.log('Promotion applied successfully:', response.data);
            setAppliedPromotion(response.data);
            return { success: true, data: response };
        } catch (err) {
            // Preserve the complete error response including user data
            const errorResponse = err.response?.data?.error || err.response?.data || {};
            const errorMessage = errorResponse.message || err.response?.data?.message || 'Invalid promotion code';
            
            setAppliedPromotion(null);
            // Set the complete error object so frontend can access user info
            setError({
                message: errorMessage,
                user: errorResponse.user || null,
                details: errorResponse.details || null,
                status: errorResponse.status || err.response?.status || 400
            });
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };
    return { applyPromotion, appliedPromotion, loading, error };
};

export const useGetPublicPromotions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const { token } = useUser();

    const fetchPublicPromotions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await promotionService.getPublicPromotions(token);
            console.log('Public promotions fetched successfully:', response);
            setPromotions(response);
            return { success: true, data: response };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch promotions';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { fetchPublicPromotions, promotions, loading, error };
};
export const useCreateTicket = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticket, setTicket] = useState(null);
    const { token } = useUser();

    // Utility to adapt movieTicketData and snackTicketData to API format
    const buildTicketData = ({ movieTicketData, snackTicketData }) => {
        let ticketData = {};
        console.log(movieTicketData, snackTicketData);

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
        if (movieTicketData && movieTicketData.schedule?._id && Array.isArray(movieTicketData.seats) && movieTicketData.seats.length > 0) {
            ticketData.movieTicket = {
                schedule: movieTicketData.schedule._id,
                seats: movieTicketData.seats,
                total: movieTicketData.total || 0,
                adultTickets: movieTicketData.adultTickets || 0,
                discountedTickets: movieTicketData.discountedTickets || 0,
            };
        }

        // Snack ticket data
        if (snackTicketData && Array.isArray(snackTicketData.snackList) && snackTicketData.snackList.length > 0) {
            // Process and validate snack list
            const snackList = snackTicketData.snackList
                .map((item) => {
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
                        quantity: parseInt(item.quantity) || 0,
                    };
                })
                .filter(
                    (item) =>
                        // Only include valid items
                        typeof item.shortname === 'string' && item.shortname.trim().length > 0 && item.quantity > 0,
                );

            if (snackList.length > 0) {
                ticketData.snackTicket = { snackList, total: snackTicketData.total || 0 };
            }
        }

        console.log('[buildTicketData] Final ticketData:', ticketData);
        return ticketData;
    };
    const createTicket = async ({ movieTicketData, snackTicketData }) => {
        setLoading(true);
        setError(null);
        try {
            console.log(movieTicketData, snackTicketData);
            const ticketData = buildTicketData({ movieTicketData, snackTicketData });
            console.log('Creating ticket with data:', ticketData);
            const response = await ticketService.createTicket(ticketData, token);
            console.log('Ticket created successfully:', response);
            setTicket(response);
            return { success: true, data: response };
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
            }

            const response = await ticketService.holdSeats(
                {
                    scheduleId,
                    seatNumbers,
                    sessionId,
                    holdDurationMinutes,
                    replaceExisting: true, // Always replace existing holds for this session
                },
                token,
            );

            setError(null);
            setHoldSeatData(response);

            return { success: true, data: response };
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
            console.log(sessionId);
            console.log('clearingsession');
            if (sessionId) {
                await ticketService.manageSeatHold(
                    {
                        action: 'release',
                        sessionId: sessionId,
                    },
                    token,
                );
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
            const response = await ticketService.checkinTicket(ticketCode, token);
            return { success: true, data: response };
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

// Note: useActiveTicket is commented out as there's no 'Active' status in the backend ticket model
// The ticket status enum only includes: 'Confirmed', 'CheckedIn', 'Cancelled'
/*
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
*/

export const useGetTicketDetailsByCode = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ticket, setTicket] = useState(null);
    const { token } = useUser();

    // Cache system để tránh gọi API trùng lặp
    const ticketCache = useRef(new Map());
    const CACHE_DURATION = 60000; // 1 phút cache

    // Debounce system
    const lastRequestTime = useRef(0);
    const activeRequest = useRef(null);
    const REQUEST_DEBOUNCE = 500; // 500ms debounce

    const getTicket = async (ticketCode, forceRefresh = false) => {
        if (!ticketCode) return;

        const cleanCode = ticketCode.trim().toUpperCase();
        const currentTime = Date.now();

        // Kiểm tra debounce (skip nếu forceRefresh)
        if (!forceRefresh && currentTime - lastRequestTime.current < REQUEST_DEBOUNCE) {
            return activeRequest.current;
        }

        // Kiểm tra cache (skip nếu forceRefresh)
        if (!forceRefresh) {
            const cachedData = ticketCache.current.get(cleanCode);
            if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION) {
                setTicket(cachedData.data);
                setError(null);
                return { success: true, data: cachedData.data, fromCache: true };
            }
        } else {
            // Clear cache entry if forcing refresh
            ticketCache.current.delete(cleanCode);
        }

        // Hủy request trước đó nếu có
        if (activeRequest.current && activeRequest.current.controller) {
            activeRequest.current.controller.abort();
        }

        setLoading(true);
        setError(null);
        setTicket(null);
        lastRequestTime.current = currentTime;

        // Tạo AbortController cho request mới
        const controller = new AbortController();
        const requestPromise = performTicketRequest(cleanCode, controller);
        activeRequest.current = { controller, promise: requestPromise };

        return requestPromise;
    };

    const performTicketRequest = async (ticketCode, controller) => {
        try {
            // Try movie ticket first, then snack ticket if movie ticket fails
            let response;
            try {
                response = await ticketService.getMovieTicketDetails(ticketCode, token, { signal: controller.signal });
            } catch (movieError) {
                // If movie ticket fails, try snack ticket
                try {
                    response = await ticketService.getSnackTicketDetails(ticketCode, token, { signal: controller.signal });
                } catch (snackError) {
                    // If both fail, throw the original movie error
                    throw movieError;
                }
            }

            // Cache kết quả
            ticketCache.current.set(ticketCode, {
                data: response,
                timestamp: Date.now(),
            });

            setTicket(response);
            activeRequest.current = null;
            return { success: true, data: response };
        } catch (err) {
            if (err.name === 'AbortError') {
                return { success: false, error: 'Request cancelled' };
            }

            const errorMessage = err.response?.data?.message || 'Ticket not found or an error occurred.';
            setError(errorMessage);
            activeRequest.current = null;
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Cleanup function để clear cache khi component unmount
    useEffect(() => {
        return () => {
            if (activeRequest.current && activeRequest.current.controller) {
                activeRequest.current.controller.abort();
            }
        };
    }, []);

    return { getTicket, ticket, loading, error };
};

export const useUpdateTicketStatus = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useUser();

    const updateTicketStatus = async (ticketCode, newStatus) => {
        setLoading(true);
        setError(null);

        try {
            const response = await ticketService.updateTicketStatus(ticketCode, newStatus, token);
            return { success: true, data: response };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update ticket status';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { updateTicketStatus, loading, error };
};

export const useGetSnacksByBranch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snacks, setSnacks] = useState([]);
    const { token } = useUser();

    const getSnacks = async (branchId) => {
        console.log('Fetching snacks for branch:', branchId);
        if (!branchId) {
            setError('No branch selected');
            return { success: false, error: 'No branch selected' };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await ticketService.getSnacksByBranch(branchId, token);
            setSnacks(response.snacks);
            return { success: true, data: response };
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
