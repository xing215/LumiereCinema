import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useRateMovie, useGetMyRatings } from '@hooks/useUser';
import { useGetWatchHistory } from '@hooks/useUser';
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom';
import { Star } from 'lucide-react';
import ErrorModal from '../../layouts/Error';

// userCount: number of users who rated
const Rating = ({ rated = 0, movieId, userCount = 0 }) => {
    const { user, isAuthenticated } = useUser();
    const [selected, setSelected] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const { rateMovie } = useRateMovie();
    const { getMyRatings, ratings, loading: ratingsLoading } = useGetMyRatings();
    const { getWatchHistory, loading: watchHistoryLoading } = useGetWatchHistory();
    const [preloaded, setPreloaded] = useState(false);
    const [showLoginError, setShowLoginError] = useState(false);
    // Preload watch history and ratings on mount
    const [watchHistory, setWatchHistory] = useState(null);
    useEffect(() => {
        let isMounted = true;
        const preload = async () => {
            if (!isAuthenticated) {
                setWatchHistory([]);
                setPreloaded(true);
                return;
            }
            const [wh] = await Promise.all([
                getWatchHistory(),
                movieId ? getMyRatings(movieId) : getMyRatings()
            ]);
            if (isMounted) {
                setWatchHistory(wh?.data?.watchHistory || []);
                setPreloaded(true);
            }
        };
        preload();
        return () => { isMounted = false; };
    }, [movieId, user]);

    const handleStarClick = async (idx) => {
        // Pre-check: not logged in
        if (!user) {
            setShowLoginError(true);
            return;
        }
        // Pre-check: require movie in watch history (use preloaded)
        if (!movieId || !Array.isArray(watchHistory) || !watchHistory.some(m => m?.schedule?.movie?._id === movieId)) {
            await Swal.fire({
                title: `<span style='color:#fff;font-size:1.5rem;font-weight:500;'>Not Allowed</span>`,
                html: `<div style='color:#f1f5f9;font-size:1.1rem;font-weight:400;margin-bottom:8px;'>You can only rate movies you have watched.</div>`,
                background: '#23222a',
                color: '#fff',
                customClass: { popup: 'swal2-popup-rating', confirmButton: 'swal2-btn-gradient' },
                confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Close</span>',
            });
            return;
        }

        // Pre-check: already rated (use preloaded ratings)
        const alreadyRated = ratings && ratings[movieId] && ratings[movieId].rating;
        if (alreadyRated) {
            const { isConfirmed } = await Swal.fire({
                title: `<span style='color:#fff;font-size:1.5rem;font-weight:500;'>Already Rated</span>`,
                html: `<div style='color:#f1f5f9;font-size:1.1rem;font-weight:400;margin-bottom:8px;'>You already rated this movie ${alreadyRated} star${alreadyRated > 1 ? 's' : ''}.</div>` +
                    `<div style='color:#f1f5f9;font-size:1rem;font-weight:400;margin-bottom:8px;'>Would you like to edit your rating?</div>`,
                background: '#23222a',
                color: '#fff',
                showDenyButton: true,
                confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Edit</span>',
                denyButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Close</span>',
                customClass: { popup: 'swal2-popup-rating', confirmButton: 'swal2-btn-gradient', denyButton: 'swal2-btn-gradient' },
            });
            if (!isConfirmed) return;
            // else, continue to rerate
        }

        let tempSelected = idx + 1;
        setSelected(tempSelected);
        function renderStars(val) {
            return Array.from({ length: 5 }, (_, i) =>
                `<span data-star="${i + 1}" style="cursor:pointer;display:inline-block;">
                    <svg width='28' height='28' viewBox='0 0 24 24' fill='${i < val ? '#facc15' : 'none'}' stroke='${i < val ? '#facc15' : '#d1d5db'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
                        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'></polygon>
                    </svg>
                </span>`
            ).join('');
        }

        await Swal.fire({
            title: `<span id='swal-rating-title' style='color:#fff;font-size:1.5rem;font-weight:500;'>Rate this movie ${tempSelected} star${tempSelected > 1 ? 's' : ''}</span>`,
            html: `
                <div id='swal-rating-stars' style='display:flex;justify-content:center;gap:8px;margin-bottom:18px;'></div>
            `,
            background: '#23222a',
            color: '#fff',
            showCancelButton: true,
            confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">CONFIRM</span>',
            cancelButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">CANCEL</span>',
            focusConfirm: false,
            customClass: {
                popup: 'swal2-popup-rating',
                confirmButton: 'swal2-btn-gradient',
                cancelButton: 'swal2-btn-gradient',
            },
            didOpen: () => {
                const starsContainer = document.getElementById('swal-rating-stars');
                const titleContainer = document.getElementById('swal-rating-title');
                if (starsContainer) {
                    starsContainer.innerHTML = renderStars(tempSelected);
                    starsContainer.addEventListener('click', (e) => {
                        const star = e.target.closest('[data-star]');
                        if (star) {
                            const val = parseInt(star.getAttribute('data-star'));
                            tempSelected = val;
                            setSelected(val);
                            starsContainer.innerHTML = renderStars(val);
                            if (titleContainer) {
                                titleContainer.innerText = `Rate this movie ${val} star${val > 1 ? 's' : ''}`;
                            }
                        }
                    });
                }
            },
            preConfirm: () => {
                return tempSelected;
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                setConfirmed(true);
                setSelected(tempSelected);
                if (movieId) {
                    try {
                        const result = await rateMovie(movieId, tempSelected);
                        await getMyRatings(movieId);
                        if (result && result.success) {
                            await Swal.fire({
                                title: `<span style='color:#fff;font-size:1.5rem;font-weight:500;'>Thank you!</span>`,
                                html: `<div style='color:#f1f5f9;font-size:1.1rem;font-weight:400;margin-bottom:8px;'>${result.data?.message || `You rated this movie ${tempSelected} star${tempSelected > 1 ? 's' : ''}.`}</div>`,
                                background: '#23222a',
                                color: '#fff',
                                customClass: { popup: 'swal2-popup-rating', confirmButton: 'swal2-btn-gradient' },
                                confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Close</span>',
                            });
                        } else {
                            await Swal.fire({
                                icon: 'error',
                                title: `<span style='color:#fff;font-size:1.5rem;font-weight:500;'>Rating Failed</span>`,
                                html: `<div style='color:#f1f5f9;font-size:1.1rem;font-weight:400;margin-bottom:8px;'>${result?.error || 'Failed to rate movie.'}</div>`,
                                background: '#23222a',
                                color: '#fff',
                                customClass: { popup: 'swal2-popup-rating', confirmButton: 'swal2-btn-gradient' },
                                confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Close</span>',
                            });
                        }
                    } catch (err) {
                        console.error('Error rating movie:', err);
                        await Swal.fire({
                            icon: 'error',
                            title: `<span style='color:#fff;font-size:1.5rem;font-weight:500;'>Rating Failed</span>`,
                            html: `<div style='color:#f1f5f9;font-size:1.1rem;font-weight:400;margin-bottom:8px;'>${err?.message || 'Failed to rate movie.'}</div>`,
                            background: 'rgba(15, 23, 42, 0.4)',
                            color: '#f1f5f9',
                            customClass: { popup: 'swal2-popup-rating' },
                            confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Close</span>',
                            confirmButtonColor: '#a259e6',
                            backdrop: '#18181b', // solid bg-zinc-900 for overlay
                        });
                    }
                }
            } else {
                setSelected(null);
            }
        });
// SweetAlert2 custom styles for Figma-like glassmorphism popup and Tailwind colors
const swalStyle = document.createElement('style');
swalStyle.innerHTML = `
.swal2-popup-rating {
  background: rgba(15, 23, 42, 0.4) !important; /* bg-slate-900/40 */
  color: #f1f5f9 !important; /* slate-100 */
  border-radius: 0.75rem !important; /* rounded-xl */
  box-shadow: 8px 8px 20px 0px rgba(0,0,0,0.25) !important; /* shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] */
  backdrop-filter: blur(20px) !important;
}
.swal2-btn-gradient {
  background: linear-gradient(90deg, #a259e6 0%, #7f4be1 100%) !important;
  color: #f1f5f9 !important; /* slate-100 */
  border: none !important;
  border-radius: 0.75rem !important; /* rounded-xl */
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  padding: 0.5em 2.5em !important;
  margin: 0 0.5em !important;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15) !important;
  transition: background 0.2s;
}
.swal2-btn-gradient:hover {
  background: linear-gradient(90deg, #7f4be1 0%, #a259e6 100%) !important;
}
.swal2-popup-rating #swal-rating-title {
  color: #f1f5f9 !important; /* slate-100 */
}
.swal2-popup-rating .swal2-html-container {
  color: #f1f5f9 !important; /* slate-100 */
}
.swal2-popup-rating .swal2-cancel, .swal2-popup-rating .swal2-confirm {
  text-shadow: none !important;
}
.swal2-popup-rating .swal2-html-container div[style*='color:#ef4444'] {
  color: #f43f5e !important; /* rose-500 */
}
`;
if (!document.head.querySelector('style[data-swal2-dark]')) {
  swalStyle.setAttribute('data-swal2-dark', 'true');
  document.head.appendChild(swalStyle);
}
    };

    return (
        <>
            {showLoginError && (
                <ErrorModal errorMsg="Please login to rate this movie." onClose={() => setShowLoginError(false)} />
            )}
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-5 md:py-1 xl:py-2 relative">
                <div className="flex items-center gap-0.5 md:gap-1 lg:gap-1.5 xl:gap-2">
                    {Array.from({ length: 5 }, (_, i) => {
                        const halfPercent = (rated - i) * 100;
                        const isSelected = selected ? i < selected : false;
                        const isLoading = ratingsLoading || watchHistoryLoading || !preloaded;
                        return (
                            <div
                                key={i}
                                className={`relative h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={isLoading ? undefined : () => handleStarClick(i)}
                                aria-disabled={isLoading}
                                tabIndex={isLoading ? -1 : 0}
                                role="button"
                                aria-label={`Rate ${i + 1} star${i === 0 ? '' : 's'}`}
                            >
                                <Star className="h-full w-full text-gray-300" />
                                <Star
                                    className={`absolute top-0 left-0 h-full w-full fill-yellow-400 text-yellow-400`}
                                    style={{ clipPath: `inset(0 ${100 - halfPercent}% 0 0)` }}
                                    aria-hidden="true"
                                />
                            </div>
                        );
                    })}
                </div>
                <p className="font-libre-franklin text-sm font-normal md:text-[16px] lg:text-xl xl:text-2xl">
                    {userCount} {userCount !== 1 ? 'users' : 'user'}
                </p>
            </div>
        </>
    );
};

export default Rating;
