import { Heart } from 'lucide-react';
import { useGetWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useUser';
import ErrorModal from '@layouts/Error.jsx';
import React from 'react';

const WishlistButton = ({ movie, className = '' }) => {
    const { getWishlist, wishlist, loading: wishlistLoading, error: wishlistError } = useGetWishlist();
    const { addToWishlist, loading: addLoading } = useAddToWishlist();
    const { removeFromWishlist, loading: removeLoading } = useRemoveFromWishlist();
    const [showAuthError, setShowAuthError] = React.useState(false);
    const [wishlistFetched, setWishlistFetched] = React.useState(false);

    React.useEffect(() => {
        if (!wishlistFetched) {
            getWishlist();
            setWishlistFetched(true);
        }
    }, [wishlistFetched, getWishlist]);

    const isInWishlist = (movieId) => {
        return (
            wishlist.wishlist &&
            Array.isArray(wishlist.wishlist) &&
            wishlist.wishlist.some(item => String(item._id) === String(movieId))
        );
    };

    const handleWishlistClick = async (e) => {
        e.stopPropagation();
        if ((wishlistError && (!wishlist.wishlist || wishlist.wishlist.length === 0)) ||
            (wishlistError && (wishlistError.toString().includes('401') || wishlistError.toString().includes('403')))) {
            setShowAuthError(true);
            return;
        }
        if (!movie?._id) return;
        if (isInWishlist(movie._id)) {
            const result = await removeFromWishlist(movie._id);
            if (result && result.error && (result.error.toString().includes('401') || result.error.toString().includes('403'))) {
                setShowAuthError(true);
                return;
            }
            await getWishlist();
        } else {
            const result = await addToWishlist(movie._id);
            if (result && result.error && (result.error.toString().includes('401') || result.error.toString().includes('403'))) {
                setShowAuthError(true);
                return;
            }
            await getWishlist();
        }
    };

    return (
        <>
            {showAuthError && (
                <ErrorModal errorMsg="Please login to save your favourite movies." onClose={() => setShowAuthError(false)} />
            )}
            <div className={`relative h-7 w-7 hover:cursor-pointer sm:h-10 sm:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12 ${className}`} onClick={handleWishlistClick} title={isInWishlist(movie?._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                <Heart
                    className="absolute h-full w-full"
                    strokeWidth={1.5}
                    fill={isInWishlist(movie?._id) ? 'white' : 'none'}
                />
            </div>
        </>
    );
};

export default WishlistButton;
