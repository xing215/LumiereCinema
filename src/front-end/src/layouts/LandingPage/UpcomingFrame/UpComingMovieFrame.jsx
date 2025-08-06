import React from 'react';
import MovieCard from '@components/UI/MovieCard.jsx';
import BackwardButton from '@components/buttons/backwardButton.jsx';
import ForwardButton from '@components/buttons/forwardButton.jsx';
import { useFetchComingSoon } from '@hooks/useMovie';
import SeeMoreButton from '@components/buttons/seeMoreButton.jsx';

const UpComingFrame = () => {
    // Scroll handlers for navigation buttons
    const handleScrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -scrollByAmount, behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: scrollByAmount, behavior: 'smooth' });
        }
    };
    const { fetchComingSoon, movies: upcomingMovies, loading } = useFetchComingSoon();
    React.useEffect(() => { fetchComingSoon(); }, []);
    
    // Sort movies: movies with schedules (branches) first, then movies without schedules
    const sortedUpcomingMovies = React.useMemo(() => {
        if (!upcomingMovies) return [];
        return [...upcomingMovies].sort((a, b) => {
            const aHasSchedules = Array.isArray(a.branches) && a.branches.length > 0;
            const bHasSchedules = Array.isArray(b.branches) && b.branches.length > 0;
            
            if (aHasSchedules && !bHasSchedules) return -1;
            if (!aHasSchedules && bHasSchedules) return 1;
            return 0; // Keep original order for movies with same schedule status
        });
    }, [upcomingMovies]);
    
    const scrollRef = React.useRef(null);
    const scrollByAmount = 350;
    const [showScrollButtons, setShowScrollButtons] = React.useState(false);

    // When showScrollButtons changes from false to true, trigger a scroll event to update overlays
    React.useEffect(() => {
        if (showScrollButtons && scrollRef.current) {
            // Wait for DOM update
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.dispatchEvent(new Event('scroll'));
                }
            }, 0);
        }
    }, [showScrollButtons]);
    // Check if scrolling is needed
    React.useEffect(() => {
        const checkScroll = () => {
            if (!scrollRef.current) return;
            setShowScrollButtons(scrollRef.current.scrollWidth > scrollRef.current.clientWidth + 1);
        };
        checkScroll();
        window.addEventListener('resize', checkScroll);
        if (scrollRef.current) {
            scrollRef.current.addEventListener('scroll', checkScroll);
        }
        return () => {
            window.removeEventListener('resize', checkScroll);
            if (scrollRef.current) {
                scrollRef.current.removeEventListener('scroll', checkScroll);
            }
        };
    }, [sortedUpcomingMovies]);

    // Hide the component if not loading and no movies
    if (!loading && (!sortedUpcomingMovies || sortedUpcomingMovies.length === 0)) {
        return null;
    }
    return (
        <div className="relative w-screen bg-transparent flex flex-col items-center py-8">
            <div className="justify-start text-center font-['Unbounded'] text-sm font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">UPCOMING MOVIES</div>
            <div className="h-4 w-full" />
            <div className="relative w-screen flex items-center">
                {/* Backward Button (md and up) */}
                {showScrollButtons && (
                    <div className="hidden md:block mr-4 z-30">
                        <BackwardButton onClick={handleScrollLeft} position="absolute" />
                    </div>
                )}
                {/* Movie Cards Row with overlay logic */}
                <div
                    ref={scrollRef}
                    className={`flex gap-4 w-full px-2 md:pl-32 md:pr-32 py-2 ${showScrollButtons ? 'overflow-x-auto no-scrollbar' : 'justify-center'}`}
                    style={showScrollButtons ? { scrollBehavior: 'smooth' } : {}}
                >
                    {loading ? (
                        <div className="flex items-center justify-center w-full py-10">
                            <div className="text-white font-['Unbounded'] text-lg">Loading movies...</div>
                        </div>
                    ) : sortedUpcomingMovies && sortedUpcomingMovies.length > 0 ? (
                        sortedUpcomingMovies.map((movie, idx) => (
                            <MovieCardWithOverlay
                                key={movie._id || idx}
                                movie={movie}
                                page="LandingPage"
                                cardIdx={idx}
                                scrollRef={scrollRef}
                            />
                        ))
                    ) : null}
                </div>
                {/* Forward Button (md and up) */}
                {showScrollButtons && (
                    <div className="hidden md:block ml-4 z-30">
                        <ForwardButton onClick={handleScrollRight} position="absolute" />
                </div>
                )}
            </div>
            <div className="flex justify-center items-center mt-4">
                <SeeMoreButton statusFilter="up" />
            </div>
        </div>
    );
};

// Helper component to wrap MovieCard and add overlay if >40% out of visible area
const MovieCardWithOverlay = ({ movie, page, cardIdx, scrollRef }) => {
    const cardRef = React.useRef(null);
    const [overlayOpacity, setOverlayOpacity] = React.useState(0);
    React.useEffect(() => {
        let rafId;
        const checkOverlay = () => {
            if (!cardRef.current || !scrollRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const cardWidth = cardRect.width;
            if (cardWidth === 0) {
                rafId = requestAnimationFrame(checkOverlay);
                return;
            }
            const windowWidth = window.innerWidth;
            // Calculate how much of the card is out of the viewport (left or right)
            let outLeft = Math.max(0, 0 - cardRect.left);
            let outRight = Math.max(0, cardRect.right - windowWidth);
            let out = Math.min(Math.max(outLeft, outRight) + 10, cardWidth);
            let percentOut = Math.min(1, out / cardWidth);
            setOverlayOpacity(percentOut);
        };
        checkOverlay();
        window.addEventListener('resize', checkOverlay);
        if (scrollRef.current) {
            scrollRef.current.addEventListener('scroll', checkOverlay);
        }
        return () => {
            window.removeEventListener('resize', checkOverlay);
            if (scrollRef.current) {
                scrollRef.current.removeEventListener('scroll', checkOverlay);
            }
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [scrollRef]);
    return (
        <div ref={cardRef} className="flex-shrink-0 w-56 md:w-64 lg:w-72 relative">
            <MovieCard movie={movie} page={page} />
            {overlayOpacity > 0 && (
                <div
                    className="absolute inset-0 z-20 pointer-events-none rounded-xl"
                    style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
                />
            )}
        </div>
    );
};

export default UpComingFrame;