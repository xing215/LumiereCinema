import MovieCard from '@components/UI/MovieCard.jsx';
import BackwardButton from '@components/buttons/backwardButton.jsx';
import ForwardButton from '@components/buttons/forwardButton.jsx';
import SeeMoreButton from '@components/buttons/seeMoreButton.jsx';

import React, { useEffect } from 'react';
import { useFetchNowShowing } from '@hooks/useMovie';


const NowShowingFrame = () => {
    const { fetchNowShowing, movies: nowShowingMovies, loading } = useFetchNowShowing();
    React.useEffect(() => { fetchNowShowing(); }, []);
    const scrollRef = React.useRef(null);
    const scrollByAmount = 350;
    const [showScrollButtons, setShowScrollButtons] = React.useState(false);
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
    }, [nowShowingMovies]);

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

    // Hide the component if not loading and no movies
    if (!loading && (!nowShowingMovies || nowShowingMovies.length === 0)) {
        return null;
    }
    return (
        <div className="relative w-screen bg-transparent flex flex-col items-center py-8">
            <div className="justify-start text-center font-['Unbounded'] text-sm font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">NOW SHOWING</div>
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
                    ) : nowShowingMovies && nowShowingMovies.length > 0 ? (
                        nowShowingMovies.map((movie, idx) => (
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
                <SeeMoreButton statusFilter="now" />
            </div>
        </div>
    );
};


// Helper component to wrap MovieCard and add overlay if >40% out of visible area

const MovieCardWithOverlay = ({ movie, page, cardIdx, scrollRef }) => {
    const cardRef = React.useRef(null);
    const [overlayOpacity, setOverlayOpacity] = React.useState(0);

    React.useEffect(() => {
        const checkOverlay = () => {
            if (!cardRef.current || !scrollRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const scrollRect = scrollRef.current.getBoundingClientRect();
            const cardWidth = cardRect.width;
            // Define the logical visible area (screen minus padding on both sides)
            const logicalLeft = scrollRect.left;
            const logicalRight = scrollRect.right;
            // Calculate visible width inside logical area
            const visibleLeft = Math.max(cardRect.left, logicalLeft);
            const visibleRight = Math.min(cardRect.right, logicalRight);
            const visibleWidth = Math.max(0, visibleRight - visibleLeft);
            // Calculate percent out of logical area (0 = fully in, 1 = fully out)
            let percentOut = 1 - visibleWidth / cardWidth;
            percentOut = Math.max(0, Math.min(1, percentOut));
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
        };
    }, [scrollRef]);

    return (
        <div ref={cardRef} className="flex-shrink-0 w-56 md:w-64 lg:w-72 relative">
            <MovieCard movie={movie} page={page} />
            {overlayOpacity > 0 && (
                <div
                    className="absolute inset-0 z-20 pointer-events-none rounded-xl"
                    style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity * 0.6})` }}
                />
            )}
        </div>
    );
};

export default NowShowingFrame;
