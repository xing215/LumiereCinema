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
                {/* Left Gradient Overlay (md and up) */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-16 md:w-24 z-20 bg-gradient-to-r from-black/90 via-black/70 to-transparent hidden md:block" />
                {/* Right Gradient Overlay (md and up) */}
                <div className="pointer-events-none absolute right-0 top-0 h-full w-16 md:w-24 z-20 bg-gradient-to-l from-black/90 via-black/70 to-transparent hidden md:block" />

                {/* Backward Button (md and up) */}
                <div className="hidden md:block mr-4 z-30">
                    <BackwardButton onClick={handleScrollLeft} position="absolute" />
                </div>
                {/* Movie Cards Row */}
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
                            <div key={movie._id || idx} className="flex-shrink-0 w-56 md:w-64 lg:w-72">
                                <MovieCard movie={movie} page="LandingPage" />
                            </div>
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

export default NowShowingFrame;
