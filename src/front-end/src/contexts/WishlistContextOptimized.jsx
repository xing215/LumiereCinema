import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

// Lightweight cache manager
const wishlistCache = {
    data: new Set(),
    timestamp: 0,
    duration: 5 * 60 * 1000, // 5 minutes

    get: function() {
        if (Date.now() - this.timestamp < this.duration) {
            return Array.from(this.data);
        }
        return null;
    },

    set: function(wishlist) {
        this.data = new Set(wishlist.map(item => String(item._id || item)));
        this.timestamp = Date.now();
        
        // Persist to localStorage
        try {
            localStorage.setItem('lumiere_wishlist_cache', JSON.stringify(Array.from(this.data)));
            localStorage.setItem('lumiere_wishlist_cache_time', this.timestamp.toString());
        } catch (error) {
            console.warn('Cache save error:', error);
        }
    },

    load: function() {
        try {
            const cached = localStorage.getItem('lumiere_wishlist_cache');
            const cacheTime = localStorage.getItem('lumiere_wishlist_cache_time');
            
            if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < this.duration) {
                this.data = new Set(JSON.parse(cached));
                this.timestamp = parseInt(cacheTime);
                return Array.from(this.data);
            }
        } catch (error) {
            console.warn('Cache load error:', error);
        }
        return null;
    },

    clear: function() {
        this.data.clear();
        this.timestamp = 0;
        localStorage.removeItem('lumiere_wishlist_cache');
        localStorage.removeItem('lumiere_wishlist_cache_time');
    }
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const { token, user } = useUser();

    // Load from cache on mount
    useEffect(() => {
        if (token && user && !initialized) {
            const cached = wishlistCache.load();
            if (cached) {
                setWishlist(cached.map(id => ({ _id: id })));
                setInitialized(true);
                // Load fresh data silently
                loadWishlist(true);
            } else {
                loadWishlist();
            }
        } else if (!token) {
            setWishlist([]);
            setInitialized(false);
            wishlistCache.clear();
        }
    }, [token, user, initialized]);

    const loadWishlist = async (silent = false) => {
        if (!token) return { success: false, error: 'No token' };

        if (!silent) setLoading(true);
        setError(null);

        try {
            const data = await userService.getWishlist(token);
            const wishlistData = data.wishlist || data || [];
            
            setWishlist(wishlistData);
            setInitialized(true);
            wishlistCache.set(wishlistData);

            return { success: true, data: wishlistData };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch wishlist';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const isInWishlist = useCallback((movieId) => {
        return wishlist.some(item => String(item._id) === String(movieId));
    }, [wishlist]);

    const addToWishlist = async (movieId) => {
        if (!token) {
            setError('You must be logged in');
            return { success: false, error: 'You must be logged in' };
        }

        // Optimistic update
        const newMovie = { _id: movieId };
        setWishlist(prev => [...prev, newMovie]);
        wishlistCache.data.add(String(movieId));

        try {
            const result = await userService.addToWishlist(movieId, token);
            
            // Background sync occasionally
            if (Math.random() < 0.2) {
                setTimeout(() => loadWishlist(true), 1000);
            }
            
            return { success: true, data: result };
        } catch (err) {
            // Revert optimistic update
            setWishlist(prev => prev.filter(item => String(item._id) !== String(movieId)));
            wishlistCache.data.delete(String(movieId));
            
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

        // Store previous state
        const previousWishlist = [...wishlist];
        
        // Optimistic update
        setWishlist(prev => prev.filter(item => String(item._id) !== String(movieId)));
        wishlistCache.data.delete(String(movieId));

        try {
            const result = await userService.removeFromWishlist(movieId, token);
            
            // Background sync occasionally
            if (Math.random() < 0.2) {
                setTimeout(() => loadWishlist(true), 1000);
            }
            
            return { success: true, data: result };
        } catch (err) {
            // Revert optimistic update
            setWishlist(previousWishlist);
            wishlistCache.data.add(String(movieId));
            
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
        loadWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
