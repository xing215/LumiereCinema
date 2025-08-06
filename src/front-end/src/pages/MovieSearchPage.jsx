import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEnhancedMovieSearch, useSearchHistory } from '@hooks/useMovieSearch';
import Header from '@layouts/LandingPage/Header';
import Footer from '@layouts/LandingPage/Footer';
import ChatBot from '@components/display/ChatBot';
import AiSearch from '@components/display/AiSearch';

const MovieCard = ({ movie, onClick }) => {
    const handleCardClick = () => {
        onClick && onClick(movie);
    };

    return (
        <div 
            className="bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-700"
            onClick={handleCardClick}
        >
            <div className="relative">
                <img
                    src={movie.posterURL}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                        e.target.src = '/placeholder-movie-poster.jpg';
                    }}
                />
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        movie.status === 'Now Showing' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {movie.status}
                    </span>
                </div>
                {movie.score && (
                    <div className="absolute top-2 right-2">
                        <span className="bg-black/70 text-white px-2 py-1 text-xs rounded-full">
                            Score: {movie.score.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white">
                    {movie.title}
                </h3>
                
                <div className="text-sm text-gray-300 space-y-1">
                    <p className="line-clamp-2">{movie.description}</p>
                    
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{movie.duration}min</span>
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                            {movie.ageRating}
                        </span>
                    </div>
                    
                    {movie.genre && Array.isArray(movie.genre) && (
                        <p className="text-purple-400 font-medium line-clamp-1">
                            {movie.genre.join(', ')}
                        </p>
                    )}
                    
                    {movie.director && (
                        <p className="text-gray-400">
                            Director: {movie.director}
                        </p>
                    )}
                    
                    {movie.ratingsAverage > 0 && (
                        <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span className="font-medium text-white">{movie.ratingsAverage.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Search highlights */}
                {Object.keys(movie.highlights || {}).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Matches:</p>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(movie.highlights).map(([field, texts]) => (
                                <span 
                                    key={field}
                                    className="text-xs bg-yellow-900 text-yellow-200 px-2 py-1 rounded capitalize"
                                >
                                    {field}: {texts.some(t => t.isHighlighted) ? '✓' : '○'}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Pagination = ({ pagination, onPageChange, loading }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;
    
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        
        for (let i = Math.max(2, currentPage - delta); 
             i <= Math.min(totalPages - 1, currentPage + delta); 
             i++) {
            range.push(i);
        }
        
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }
        
        rangeWithDots.push(...range);
        
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }
        
        return rangeWithDots;
    };

    return (
        <div className="flex justify-center items-center space-x-2 py-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage || loading}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            
            <div className="flex space-x-1">
                {getVisiblePages().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-2 text-sm font-medium text-gray-500">
                                ...
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                disabled={loading}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage || loading}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

const MovieSearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get initial search query from URL
    const initialQuery = searchParams.get('q') || '';
    const initialPage = parseInt(searchParams.get('page')) || 1;
    const initialLimit = parseInt(searchParams.get('limit')) || 12;
    
    const {
        results,
        pagination,
        currentKeyword,
        loading,
        error,
        searchMovies,
        goToPage,
        hasResults,
        isEmpty,
        totalResults
    } = useEnhancedMovieSearch();

    const { addToHistory } = useSearchHistory();

    // Load initial search if query exists
    useEffect(() => {
        if (initialQuery) {
            searchMovies(initialQuery, initialPage, initialLimit);
        }
    }, []);

    // Handle new search from search component
    const handleSearch = (keyword) => {
        const params = new URLSearchParams();
        params.set('q', keyword);
        params.set('page', '1');
        params.set('limit', initialLimit.toString());
        setSearchParams(params);
        
        searchMovies(keyword, 1, initialLimit);
        addToHistory(keyword);
    };

    // Handle page change
    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
        
        goToPage(page);
    };    // Handle movie selection
    const handleMovieClick = (movie) => {
        navigate(`/movie?movieId=${movie._id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-6">
                    <AiSearch 
                        onSearch={handleSearch}
                        placeholder="Search movies, actors, directors..."
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Results Header */}
                {currentKeyword && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Search Results for "{currentKeyword}"
                        </h1>
                        {totalResults > 0 && (
                            <p className="text-gray-600">
                                Found {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''}
                                {pagination && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                            </p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-lg font-medium text-gray-600">
                                Searching movies...
                            </span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-red-800 mb-2">
                                Search Error
                            </h3>
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {isEmpty && !loading && (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="text-6xl mb-4">🎬</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                No movies found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your search terms or browse our movie categories.
                            </p>
                            <button
                                onClick={() => navigate('/movies')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse All Movies
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Results Grid */}
                {hasResults && !loading && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">                            {results.map((movie, index) => (
                                <MovieCard
                                    key={movie._id || index}
                                    movie={movie}
                                    onClick={handleMovieClick}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            loading={loading}
                        />
                    </>
                )}

                {/* No search query state */}
                {!currentKeyword && !loading && (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Search for Movies
                            </h3>
                            <p className="text-gray-600">
                                Enter a movie title, actor name, or director to get started.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieSearchPage;
