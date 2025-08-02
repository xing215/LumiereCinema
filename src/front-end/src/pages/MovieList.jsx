import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@layouts/LandingPage/Header';
import Footer from '@layouts/LandingPage/Footer';
import ChatBot from '@components/display/ChatBot';
import MovieCard from '@components/UI/MovieCard';
import CinemaPopUp from '@components/UI/CinemaPopUp';
import { useFetchBranches } from '@/hooks/useBranch';
import MovieStatusFilterButton from '@components/buttons/movieStatusFilterButton';
import { useFetchNowShowing, useFetchComingSoon } from '@hooks/useMovie';

const MovieCardContainer = ({ movies, loading, selectedBranch }) => {
    if (loading) {
        return (
            <div className="z-20 flex items-center justify-center w-full pb-10">
                <div className="text-white font-['Unbounded'] text-lg">Loading movies...</div>
            </div>
        );
    }

    return (
        <div className="z-20 grid w-full grid-cols-2 grid-rows-4 gap-3 pb-10 md:grid-cols-3 md:grid-rows-4 md:gap-4 lg:grid-cols-4 lg:grid-rows-3 lg:gap-6 xl:gap-8">
            {movies && movies.length > 0 ? (
                movies.map((movie, index) => (
                    <MovieCard 
                        key={`${movie._id || index}-${selectedBranch?._id || 'all'}`}
                        movie={movie}
                        page="MovieList"
                        selectedBranch={selectedBranch}
                    />
                ))
            ) : null}
        </div>
    );
};

const MainBody = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { fetchNowShowing, movies: nowShowingMovies, loading: loadingNowShowing } = useFetchNowShowing();
    const { fetchComingSoon, movies: upcomingMovies, loading: loadingUpcoming } = useFetchComingSoon();
    // Set initial filter from URL param if present
    const initialStatus = searchParams.get('status') || 'all';
    const [movieStatusFilter, setMovieStatusFilter] = useState(initialStatus);

    // Branch selection state
    const [isCinemaPopupOpen, setIsCinemaPopupOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const { fetchBranches, branches, loading: branchLoading, error: branchError } = useFetchBranches();

    useEffect(() => {
        fetchBranches();
    }, []);

    // When status param changes in URL, update filter
    useEffect(() => {
        const urlStatus = searchParams.get('status') || 'all';
        if (urlStatus !== movieStatusFilter) {
            setMovieStatusFilter(urlStatus);
        }
        // eslint-disable-next-line
    }, [searchParams]);

    // On mount, check for branchId in URL and set selectedBranch accordingly
    useEffect(() => {
        const branchId = searchParams.get('branchId');
        if (branchId && branches && branches.length > 0) {
            const found = branches.find(b => String(b._id) === String(branchId));
            if (found) setSelectedBranch(found);
        }
    }, [branches, searchParams]);

    useEffect(() => {
        fetchNowShowing();
        fetchComingSoon();
    }, []);


    // Combine and filter movies based on status filter and selected branch
    let allMovies = [...nowShowingMovies, ...upcomingMovies];
    let filteredMovies = allMovies;
    if (movieStatusFilter === "now") {
        filteredMovies = filteredMovies.filter(m => m.status === "Now Showing");
    } else if (movieStatusFilter === "up") {
        filteredMovies = filteredMovies.filter(m => m.status === "Upcoming");
    }
    if (selectedBranch && selectedBranch._id) {
        filteredMovies = filteredMovies.filter(m => Array.isArray(m.branches) && m.branches.includes(String(selectedBranch._id)));
    }
    let allLoading = loadingNowShowing || loadingUpcoming;
    
    return (
        <div className="relative w-full max-w-7xl mx-auto flex flex-col min-h-[60vh] pt-20">
            <div className="font-unbounded justify-center text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl mt-8 mb-4">MOVIES</div>
            <div className="flex flex-col w-full gap-y-2 py-3 sm:flex-row sm:gap-x-2 sm:gap-y-0 md:py-6 lg:gap-x-3 lg:py-8 xl:gap-x-4 xl:py-10">
                <ChooseCinemaButton
                    onClick={() => setIsCinemaPopupOpen(true)}
                    label={selectedBranch?.name || 'All Cinemas'}
                    loading={branchLoading}
                    branches={branches}
                    error={branchError}
                />
                <MovieStatusFilterButton
                    value={movieStatusFilter}
                    onChange={val => {
                        setMovieStatusFilter(val);
                        // Update URL with status param
                        const params = new URLSearchParams(window.location.search);
                        params.set('status', val);
                        navigate({ search: params.toString() }, { replace: true });
                    }}
                />
            </div>
            <CinemaPopUp
                isOpen={isCinemaPopupOpen}
                onClose={() => setIsCinemaPopupOpen(false)}
                onCinemaSelect={branch => {
                    setSelectedBranch(branch);
                    // Update URL with branchId
                    const params = new URLSearchParams(window.location.search);
                    params.set('branchId', branch._id);
                    navigate({ search: params.toString() }, { replace: true });
                    setIsCinemaPopupOpen(false);
                }}
                cinemas={branches}
                selectedCinema={selectedBranch}
                getAllCinemas={true}
                getAllCinemasClick={() => {
                    setSelectedBranch(null);
                    // Remove branchId from URL
                    const params = new URLSearchParams(window.location.search);
                    params.delete('branchId');
                    navigate({ search: params.toString() }, { replace: true });
                    setIsCinemaPopupOpen(false);
                }}
            />
            {filteredMovies.length === 0 && !allLoading ? (
                <p className="mb-6 text-center text-sm text-gray-300 sm:mb-8 sm:text-base md:text-lg lg:text-xl xl:text-2xl font-[Merriweather Sans]">
                    No movies found for the selected filter.
                </p>
            ) : (
                <MovieCardContainer movies={filteredMovies} loading={allLoading} selectedBranch={selectedBranch} />
            )}
            <div className="h-5 w-full sm:h-10 md:h-20 lg:h-25" />

            <div className="absolute top-80 right-[-50px] z-10 h-[200px] w-[100px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] md:top-100 md:right-[-140px] md:h-[300px] md:w-[150px] lg:right-[-200px] lg:h-[400px] lg:w-[200px] xl:top-150 xl:right-[-300px] xl:h-[488px] xl:w-[315px]" />

            <div className="absolute bottom-0 left-1/2 h-44 w-44 -translate-x-1/2 transform rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
        </div>
    );
};
const MovieListPage = () => {
    return (
        <div className="no-scrollbar flex w-screen flex-col items-center overflow-hidden bg-slate-950">
            <Header />
            <MainBody />
            <ChatBot />
            <Footer />
        </div>
    );
};

export default MovieListPage;

export const ChooseCinemaButton = ({ onClick, label, loading, branches, error }) => (
    <button
        className="group relative flex h-11 w-full items-center justify-center py-3 md:w-80 lg:w-[calc(100vw*0.28)] max-w-[500px] cursor-pointer hover:cursor-pointer"
        onClick={loading || branches.length === 0 || error ? () => {} : onClick}
    >
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] group-hover:bg-zinc-300/70 z-0" />
        <div className="relative flex w-full items-center justify-center md:text-md h-auto text-white text-base font-bold font-['Unbounded'] z-10">
            {((loading || branches.length === 0 || error) ? '• • •' : (label ? label.toUpperCase() : 'CHOOSE CINEMA'))}
        </div>
    </button>
);