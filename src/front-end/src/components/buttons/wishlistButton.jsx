import { Heart } from 'lucide-react';
import { useWishlist } from '@contexts/WishlistContext';
import ErrorModal from '@layouts/Error.jsx';
import React from 'react';

const WishlistButton = ({ movie, className = '' }) => {
    const { 
        isInWishlist, 
        addToWishlist, 
        removeFromWishlist, 
        loading,
        error 
    } = useWishlist();
    
    const [showAuthError, setShowAuthError] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [hasAnimated, setHasAnimated] = React.useState(false);

    const movieInWishlist = movie?._id ? isInWishlist(movie._id) : false;

    const isAuthError = (error) => {
        return error && (error.toString().includes('401') || error.toString().includes('403') || 
                        error.includes('logged in'));
    };

    const handleWishlistClick = async (e) => {
        e.stopPropagation();
        
        // Prevent multiple clicks during processing
        if (isProcessing || loading) return;
        
        // Check for auth errors
        if (isAuthError(error)) {
            setShowAuthError(true);
            return;
        }
        
        if (!movie?._id) return;

        setIsProcessing(true);
        
        // Animation trigger
        setHasAnimated(true);
        setTimeout(() => setHasAnimated(false), 300);

        try {
            let result;
            if (movieInWishlist) {
                result = await removeFromWishlist(movie._id);
            } else {
                result = await addToWishlist(movie._id);
            }

            // Handle auth errors
            if (isAuthError(result?.error)) {
                setShowAuthError(true);
                return;
            }

            // Handle other errors
            if (result?.error) {
                console.warn('Wishlist operation failed:', result.error);
                return;
            }
            
        } catch (error) {
            console.error('Wishlist operation error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = isProcessing || loading;

    return (
        <>
            {showAuthError && <ErrorModal errorMsg="Please login to save your favourite movies." onClose={() => setShowAuthError(false)} />}
            <div
                className={`relative h-7 w-7 hover:cursor-pointer sm:h-10 sm:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12 ${className} ${isLoading ? 'opacity-70' : ''} transition-all duration-200 hover:scale-110 active:scale-95`}
                onClick={handleWishlistClick}
                title={movieInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
                <Heart 
                    className={`absolute h-full w-full transition-all duration-300 ${
                        isLoading ? 'animate-pulse' : ''
                    } ${
                        hasAnimated ? 'animate-bounce' : ''
                    } ${
                        movieInWishlist ? 'text-red-500 scale-110' : 'text-gray-300 hover:text-red-400'
                    }`} 
                    strokeWidth={movieInWishlist ? 2 : 1.5} 
                    fill={movieInWishlist ? 'currentColor' : 'none'} 
                />
                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4"></div>
                    </div>
                )}
            </div>
        </>
    );
};

export default WishlistButton;
