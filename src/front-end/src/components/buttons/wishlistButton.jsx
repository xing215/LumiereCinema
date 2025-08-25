import { Heart } from 'lucide-react';
import { useUser } from '@contexts/UserContext';
import { userService } from '@services';
import ErrorModal from '@layouts/Error.jsx';
import React from 'react';

const WishlistButton = ({ movie, className = '' }) => {
    const { token } = useUser();

    // Simple local state for maximum reliability
    const [isInWishlist, setIsInWishlist] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showAuthError, setShowAuthError] = React.useState(false);
    const [hasAnimated, setHasAnimated] = React.useState(false);
    const [initialized, setInitialized] = React.useState(false);

    // Load wishlist status on mount and when movie changes
    React.useEffect(() => {
        if (token && movie?._id && !initialized) {
            loadWishlistStatus();
        } else if (!token) {
            setIsInWishlist(false);
            setInitialized(false);
        }
    }, [token, movie?._id, initialized]);

    const loadWishlistStatus = async () => {
        if (!token || !movie?._id) return;

        try {
            // Try cache first
            const cached = localStorage.getItem('lumiere_wishlist_cache');
            if (cached) {
                const wishlistData = JSON.parse(cached);
                const inWishlist = wishlistData.some((item) => String(item._id || item) === String(movie._id));
                setIsInWishlist(inWishlist);
                setInitialized(true);
            }

            // Load fresh data in background
            const data = await userService.getWishlist(token);
            const wishlistData = data.wishlist || data || [];
            const inWishlist = wishlistData.some((item) => String(item._id || item) === String(movie._id));

            setIsInWishlist(inWishlist);
            setInitialized(true);

            // Update cache
            localStorage.setItem('lumiere_wishlist_cache', JSON.stringify(wishlistData));
        } catch (error) {
            console.warn('Failed to load wishlist status:', error);
            setInitialized(true);
        }
    };

    const handleWishlistClick = async (e) => {
        e.stopPropagation();

        console.log('Wishlist click:', { movieId: movie._id, currentState: isInWishlist, token: !!token });

        // Check auth immediately
        if (!token) {
            setShowAuthError(true);
            return;
        }

        if (isLoading || !movie?._id) return;

        // Immediate visual feedback
        const newState = !isInWishlist;
        setIsInWishlist(newState);
        setIsLoading(true);
        setHasAnimated(true);

        console.log('Optimistic update:', { from: !newState, to: newState });

        // Clear animation after delay
        setTimeout(() => setHasAnimated(false), 400);

        try {
            let result;
            if (!newState) {
                // Removing from wishlist
                console.log('Removing from wishlist...');
                result = await userService.removeFromWishlist(movie._id, token);
            } else {
                // Adding to wishlist
                console.log('Adding to wishlist...');
                result = await userService.addToWishlist(movie._id, token);
            }

            console.log('API Result:', result);

            // Check for errors and revert if needed
            if (result && (result.success === false || result.error)) {
                console.log('API returned error, reverting state');
                setIsInWishlist(!newState); // Revert

                if (result.error?.includes('401') || result.error?.includes('403') || result.error?.includes('logged in')) {
                    setShowAuthError(true);
                }
                console.warn('Wishlist operation failed:', result.error);
            } else {
                console.log('Success! Updating cache...');
                // Success - update cache
                try {
                    const cached = localStorage.getItem('lumiere_wishlist_cache');
                    if (cached) {
                        let wishlistData = JSON.parse(cached);
                        if (newState) {
                            // Add to cache
                            if (!wishlistData.some((item) => String(item._id || item) === String(movie._id))) {
                                wishlistData.push({ _id: movie._id });
                            }
                        } else {
                            // Remove from cache
                            wishlistData = wishlistData.filter((item) => String(item._id || item) !== String(movie._id));
                        }
                        localStorage.setItem('lumiere_wishlist_cache', JSON.stringify(wishlistData));
                        console.log('Cache updated successfully');
                    }
                } catch (cacheError) {
                    console.warn('Cache update failed:', cacheError);
                }
            }
        } catch (error) {
            console.error('Wishlist operation error:', error);
            setIsInWishlist(!newState); // Revert on error

            if (error.response?.status === 401 || error.response?.status === 403) {
                setShowAuthError(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {showAuthError && <ErrorModal errorMsg="Please login to save your favourite movies." onClose={() => setShowAuthError(false)} />}
            <div
                className={`relative h-7 w-7 hover:cursor-pointer sm:h-10 sm:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12 ${className} transition-all duration-200 hover:scale-105 active:scale-95 ${isLoading ? 'animate-pulse' : ''}`}
                onClick={handleWishlistClick}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
                {/* Single Heart with smooth transitions */}
                <Heart
                    className={`absolute h-full w-full transition-all duration-300 ease-out ${hasAnimated ? 'animate-bounce' : ''} ${
                        isInWishlist ? 'scale-110 text-red-500 drop-shadow-lg' : 'text-white/80 hover:text-red-400 sm:text-gray-300 sm:hover:text-red-400'
                    }`}
                    strokeWidth={isInWishlist ? 2.5 : 2}
                    fill={isInWishlist ? 'currentColor' : 'none'}
                    style={{
                        filter: isInWishlist ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : 'none',
                    }}
                />

                {/* Loading ring for feedback */}
                {isLoading && <div className="absolute -inset-1 animate-spin rounded-full border-2 border-red-500/40 border-t-red-500"></div>}

                {/* Success pulse */}
                {hasAnimated && !isLoading && <div className="absolute -inset-2 animate-ping rounded-full bg-red-500/20"></div>}
            </div>
        </>
    );
};

export default WishlistButton;
