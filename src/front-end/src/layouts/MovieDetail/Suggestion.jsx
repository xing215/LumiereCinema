import React, { useEffect } from 'react';
import MovieCard from '@components/UI/MovieCard.jsx';
import { useFetchNowShowing } from '@hooks/useMovie';

const SuggestionFame = ({ excludeMovieId }) => {
    const { fetchNowShowing, movies: nowShowingMovies, loading } = useFetchNowShowing();
    React.useEffect(() => {
        fetchNowShowing();
        // eslint-disable-next-line
    }, []);
    // Sort movies by number of branches (descending) and filter out current movie
    const sortedMovies = (nowShowingMovies || [])
        .filter((m) => m._id !== excludeMovieId)
        .sort((a, b) => {
            const aBranches = Array.isArray(a.branches) ? a.branches.length : 0;
            const bBranches = Array.isArray(b.branches) ? b.branches.length : 0;
            return bBranches - aBranches;
        });
    return (
        <div className="grid h-120 w-full grid-cols-2 gap-3 py-3 sm:h-50 sm:grid-cols-4 md:h-80 md:gap-5 md:py-4 lg:h-120 lg:gap-7.5 lg:py-6">
            {loading ? (
                <div className="flex w-full items-center justify-center py-10">
                    <div className="font-['Unbounded'] text-lg text-white">Loading movies...</div>
                </div>
            ) : sortedMovies.length > 0 ? (
                sortedMovies.slice(0, 4).map((movie, idx) => <MovieCard key={movie._id || idx} movie={movie} page="Suggestion" />)
            ) : (
                <div className="font-[Merriweather Sans] col-span-4 text-center text-lg text-gray-300">No movies found.</div>
            )}
        </div>
    );
};

const Suggestion = ({ currentMovieId }) => {
    return (
        <div className="relative flex w-full flex-col items-center py-6 sm:py-10 md:py-14 lg:py-16">
            <p className="font-unbounded text-lg font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">YOU MIGHT LIKE THIS</p>
            <SuggestionFame excludeMovieId={currentMovieId} />
        </div>
    );
};

export default Suggestion;
