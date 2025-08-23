import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { userService } from '@services';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const { token, user } = useUser();

    // Initialize wishlist when user logs in
    useEffect(() => {
        if (token && user && !initialized) {
            loadWishlist();
        } else if (!token) {
            // Clear wishlist when user logs out
            setWishlist([]);
            setInitialized(false);
            clearCache();
        }
    }, [token, user, initialized]);

    const clearCache = () => {
        sessionStorage.removeItem('wishlist_cache');
        sessionStorage.removeItem('wishlist_cache_time');
    };

    const loadWishlist = async (force = false) => {
        if (!token) return;

        // Check cache first (only if not forced)
        if (!force) {
            const cached = sessionStorage.getItem('wishlist_cache');
            const cacheTime = sessionStorage.getItem('wishlist_cache_time');
            const now = Date.now();
            
            // Use cache if less than 5 minutes old
            if (cached && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
                const cachedWishlist = JSON.parse(cached);
                setWishlist(cachedWishlist);
                setInitialized(true);
                return { success: true, data: cachedWishlist };
            }
        }

        setLoading(true);
        setError(null);

        try {
            const data = await userService.getWishlist(token);
            const wishlistData = data.wishlist || data;
            
            setWishlist(wishlistData);
            setInitialized(true);

            // Cache the result
            sessionStorage.setItem('wishlist_cache', JSON.stringify(wishlistData));
            sessionStorage.setItem('wishlist_cache_time', Date.now().toString());

            return { success: true, data: wishlistData };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (movieId) => {
        return wishlist && Array.isArray(wishlist) && 
               wishlist.some((item) => String(item._id) === String(movieId));
    };

    const addToWishlist = async (movieId) => {
        if (!token) {
            setError('You must be logged in');
            return { success: false, error: 'You must be logged in' };
        }

        // Optimistic update
        const newMovie = { _id: movieId };
        setWishlist(prev => [...prev, newMovie]);
        clearCache();

        try {
            const result = await userService.addToWishlist(movieId, token);
            
            // Sync in background occasionally
            if (Math.random() < 0.2) { // 20% chance
                setTimeout(() => loadWishlist(true), 1000);
            }
            
            return { success: true, data: result };
        } catch (err) {
            // Revert optimistic update on error
            setWishlist(prev => prev.filter(item => String(item._id) !== String(movieId)));
            
            const errorMessage = err.response?.data?.message || 'Failed to add to wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const removeFromWishlist = async (movieId) => {
        if (!token) {
            setError('You must be logged in');
            return { success: false, error: 'You must be logged in' };
        }

        // Store previous state for revert
        const previousWishlist = [...wishlist];
        
        // Optimistic update
        setWishlist(prev => prev.filter(item => String(item._id) !== String(movieId)));
        clearCache();

        try {
            const result = await userService.removeFromWishlist(movieId, token);
            
            // Sync in background occasionally
            if (Math.random() < 0.2) { // 20% chance
                setTimeout(() => loadWishlist(true), 1000);
            }
            
            return { success: true, data: result };
        } catch (err) {
            // Revert optimistic update on error
            setWishlist(previousWishlist);
            
            const errorMessage = err.response?.data?.message || 'Failed to remove from wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        wishlist,
        loading,
        error,
        initialized,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        loadWishlist,
        clearCache
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
