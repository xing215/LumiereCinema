import { useState } from 'react';
import { useUser } from '@contexts/UserContext';
import { userService, chatbotService } from '@services';

/**
 * User logic hooks for managing user profile data and user-specific interactions
 */

export const useFetchProfile = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const { token } = useUser();

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await userService.getProfile(token);
            setProfile(data);
            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch profile';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { fetchProfile, profile, loading, error };
};

export const useUpdateProfile = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useUser();

    const updateProfile = async (profileData) => {
        setLoading(true);
        setError(null);

        try {
            const data = await userService.updateProfile(profileData, token);
            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { updateProfile, loading, error };
};

export const useGetWatchHistory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [watchHistory, setWatchHistory] = useState([]);
    const { token } = useUser();

    const getWatchHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await userService.getWatchHistory(token);
            const watchHistoryData = data.watchHistory || data;
            console.log('Watch History Data:', watchHistoryData);
            setWatchHistory(watchHistoryData);

            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch watch history';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { getWatchHistory, watchHistory, loading, error };
};

export const useGetWishlist = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const { token } = useUser();

    const getWishlist = async (force = false) => {
        if (!token) {
            setWishlist([]);
            setError('You must be logged in to view wishlist');
            return { success: false, error: 'You must be logged in to view wishlist' };
        }

        // Check cache first (only if not forced)
        if (!force) {
            const cached = sessionStorage.getItem('wishlist_cache');
            const cacheTime = sessionStorage.getItem('wishlist_cache_time');
            const now = Date.now();

            // Use cache if less than 5 minutes old
            if (cached && cacheTime && now - parseInt(cacheTime) < 5 * 60 * 1000) {
                const cachedWishlist = JSON.parse(cached);
                setWishlist(cachedWishlist);
                return { success: true, data: { wishlist: cachedWishlist } };
            }
        }

        setLoading(true);
        setError(null);
        try {
            const data = await userService.getWishlist(token);
            const wishlistData = data.wishlist || data;
            setWishlist(wishlistData);

            // Cache the result
            sessionStorage.setItem('wishlist_cache', JSON.stringify(wishlistData));
            sessionStorage.setItem('wishlist_cache_time', Date.now().toString());

            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { getWishlist, wishlist, loading, error };
};
export const useAddToWishlist = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useUser();

    const addToWishlist = async (movieId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.addToWishlist(movieId, token);

            // Clear cache to force refresh on next load
            sessionStorage.removeItem('wishlist_cache');
            sessionStorage.removeItem('wishlist_cache_time');

            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add to wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { addToWishlist, loading, error };
};

export const useRemoveFromWishlist = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useUser();

    const removeFromWishlist = async (movieId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.removeFromWishlist(movieId, token);

            // Clear cache to force refresh on next load
            sessionStorage.removeItem('wishlist_cache');
            sessionStorage.removeItem('wishlist_cache_time');

            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to remove from wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { removeFromWishlist, loading, error };
};

export const useRateMovie = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useUser();

    const rateMovie = async (movieId, rating) => {
        setLoading(true);
        setError(null);

        try {
            const data = await userService.rateMovie({ movieId, rating }, token);
            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to rate movie';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { rateMovie, loading, error };
};

export const useGetMyRatings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState({});
    const { token } = useUser();

    const getMyRatings = async (movieId = null) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getUserRating(movieId, token);
            if (movieId) {
                setRatings((prev) => ({ ...prev, [movieId]: data }));
            } else {
                setRatings(data);
            }

            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch ratings';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { getMyRatings, ratings, loading, error };
};

export const useMessageChatBot = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useUser();

    const messageChatBot = async (queryData) => {
        setLoading(true);
        setError(null);

        try {
            const data = await chatbotService.sendQuery(queryData, token);
            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to send message to chatbot';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { messageChatBot, loading, error };
};
