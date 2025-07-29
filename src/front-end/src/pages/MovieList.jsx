import React, { useEffect, useState } from 'react';
import Header from '@layouts/LandingPage/Header';
import Footer from '@layouts/LandingPage/Footer';
import MovieCard from '@components/UI/MovieCard';
import BranchFilterButton from '@components/buttons/branchFilterButton';
import MovieStatusFilterButton from '@components/buttons/movieStatusFilterButton';
import { useFetchNowShowing, useFetchComingSoon } from '@hooks/useMovie';

import Sample1 from '@assets/sample/ThamTuKien.jpg';
import Sample2 from '@assets/sample/Divided.png';

const MovieCardContainer = ({ movies, loading }) => {
    if (loading) {
        return (
            <div className="z-20 aspect-[300/470] flex items-center justify-center w-full pb-10">
                <div className="text-white font-['Unbounded'] text-lg">Loading movies...</div>
            </div>
        );
    }

    return (
        <div className="z-20 grid w-full grid-cols-2 grid-rows-4 gap-3 pb-10 md:grid-cols-3 md:grid-rows-4 md:gap-4 lg:grid-cols-4 lg:grid-rows-3 lg:gap-6 xl:gap-8">
            {movies && movies.length > 0 ? (
                movies.map((movie, index) => (
                    <MovieCard 
                        key={movie.id || index} 
                        linkImg={movie.poster || Sample1} 
                        movie={movie}
                        page="MovieList" 
                    />
                ))
            ) : (
                <>
                    {/* Fallback to sample data */}
                    <MovieCard linkImg={Sample1} page="MovieList" />
                    <MovieCard linkImg={Sample2} page="MovieList" />
                    <MovieCard linkImg={Sample1} page="MovieList" />
                    <MovieCard linkImg={Sample2} page="MovieList" />
                    <MovieCard linkImg={Sample1} page="MovieList" />
                    <MovieCard linkImg={Sample2} page="MovieList" />
                    <MovieCard linkImg={Sample1} page="MovieList" />
                    <MovieCard linkImg={Sample2} page="MovieList" />
                    <MovieCard linkImg={Sample1} page="MovieList" />
                    <MovieCard linkImg={Sample2} page="MovieList" />
                    <MovieCard linkImg={Sample1} page="MovieList" />
                    <MovieCard linkImg={Sample2} page="MovieList" />
                </>
            )}
        </div>
    );
};

const MainBody = () => {
    const { fetchNowShowing, movies: nowShowingMovies, loading: nowShowingLoading } = useFetchNowShowing();
    const { fetchComingSoon, movies: comingSoonMovies, loading: comingSoonLoading } = useFetchComingSoon();
    const [selectedFilter, setSelectedFilter] = useState('now-showing');

    useEffect(() => {
        fetchNowShowing();
        fetchComingSoon();
    }, []);

    const displayMovies = selectedFilter === 'now-showing' ? nowShowingMovies : comingSoonMovies;
    const loading = selectedFilter === 'now-showing' ? nowShowingLoading : comingSoonLoading;

    return (
        <div className="relative flex w-[75%] flex-col pt-20 md:pt-30 lg:pt-35 xl:pt-40">
            <div className="font-unbounded justify-center text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">MOVIES</div>
            <div className="flex w-full justify-between gap-1 py-3 md:justify-start md:gap-2 md:py-6 lg:gap-3 lg:py-8 xl:gap-4 xl:py-10">
                <BranchFilterButton />
                <MovieStatusFilterButton onFilterChange={setSelectedFilter} />
            </div>
            <MovieCardContainer movies={displayMovies} loading={loading} />
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
            <Footer />
        </div>
    );
};

export default MovieListPage;
