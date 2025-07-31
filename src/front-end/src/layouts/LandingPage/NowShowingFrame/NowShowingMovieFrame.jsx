import Sample1 from '@assets/sample/ThamTuKien.jpg';
import Sample2 from '@assets/sample/Divided.png';
import MovieCard from '@components/UI/MovieCard.jsx';
import BackwardButton from '@components/buttons/backwardButton.jsx';
import ForwardButton from '@components/buttons/forwardButton.jsx';


import React, { useEffect } from 'react';
import { useFetchNowShowing } from '@hooks/useMovie';

const NowShowingFrame = () => {
    const { fetchNowShowing, movies: nowShowingMovies, loading } = useFetchNowShowing();

    useEffect(() => {
        fetchNowShowing();
        // eslint-disable-next-line
    }, []);

    // Ref for horizontal scroll
    const scrollRef = React.useRef(null);

    const scrollByAmount = 350; // px, adjust as needed for card width

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

    return (
        <div className="relative w-screen bg-transparent flex flex-col items-center py-8">
            <div className="relative w-screen flex items-center">
                {/* Backward Button (md and up) */}
                <div className="hidden md:block mr-4 z-30">
                    <BackwardButton onClick={handleScrollLeft} position="absolute" />
                </div>
                {/* Movie Cards Row with overlay logic */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto no-scrollbar gap-4 w-full px-2 md:pl-32 md:pr-32 py-2"
                    style={{ scrollBehavior: 'smooth' }}
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
                    ) : (
                        <div className="text-center text-gray-300 text-lg font-[Merriweather Sans]">No movies found.</div>
                    )}
                </div>
                {/* Forward Button (md and up) */}
                <div className="hidden md:block ml-4 z-30">
                    <ForwardButton onClick={handleScrollRight} position="absolute" />
                </div>
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
