import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovieDetailsPath } from '@routes/routeConfig';
import fallbackImg from '@assets/img/PosterNotFound.png';

/**
 * SearchMovieCard - Compact movie card component specifically designed for search autocomplete
 * Thu nhỏ và tối ưu cho search suggestions dropdown
 */
const SearchMovieCard = ({ movie, onClick }) => {
    console.log('🎬 SearchMovieCard render:', movie);
    const navigate = useNavigate();

    if (!movie) {
        console.log('❌ SearchMovieCard: No movie data');
        return null;
    }

    const handleImageError = (e) => {
        e.target.src = fallbackImg;
    };

    const getReleaseYear = (releaseDate) => {
        if (!releaseDate) return '';
        return new Date(releaseDate).getFullYear();
    };

    // Handle card click - navigate to movie details
    const handleCardClick = () => {
        console.log('🎬 Movie card clicked:', movie);

        // Check if movie has ID for navigation
        if (!movie._id) {
            console.warn('⚠️ No movie_id found in movie data');
            return;
        }

        // Call the onClick callback first (for AiSearch state management)
        if (onClick) {
            onClick(movie);
        }

        // Navigate to movie details page using the same method as MessageRenderer
        const movieDetailsPath = getMovieDetailsPath(movie._id);
        navigate(movieDetailsPath);
    };
    return (
        <div
            className="cursor-pointer border-b border-gray-100 px-4 py-3 transition-all duration-200 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md"
            onClick={handleCardClick}
        >
            <div className="flex items-start space-x-3">
                {/* Movie Poster - Compact size for search */}
                <div className="relative flex-shrink-0">
                    <img
                        src={movie.posterURL || fallbackImg}
                        alt={movie.title}
                        className="h-16 w-12 rounded object-cover shadow-sm transition-shadow duration-200 hover:shadow-md"
                        onError={handleImageError}
                    />
                    {movie.ratingsAverage > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-yellow-400 px-1 py-0.5 text-center text-xs font-bold text-white shadow-sm">
                            {movie.ratingsAverage.toFixed(1)}
                        </div>
                    )}
                </div>

                {/* Movie Info - Compact layout */}
                <div className="min-w-0 flex-1 space-y-1">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between">
                        <h4 className="truncate pr-2 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:text-blue-600">{movie.title}</h4>
                        <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap shadow-sm ${
                                movie.status === 'Now Showing' ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-blue-200 bg-blue-100 text-blue-800'
                            }`}
                        >
                            {movie.status}
                        </span>
                    </div>

                    {/* Meta Info - Compact */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {movie.ageRating && <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">{movie.ageRating}</span>}
                        {movie.duration && (
                            <span className="flex items-center">
                                <span className="mr-1 text-gray-400">⏱</span>
                                {movie.duration}min
                            </span>
                        )}
                        {movie.releaseDate && <span className="text-gray-400">{getReleaseYear(movie.releaseDate)}</span>}
                    </div>

                    {/* Genres - Only show first 2 for compactness */}
                    {movie.genre && Array.isArray(movie.genre) && movie.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {movie.genre.slice(0, 2).map((genre, idx) => (
                                <span key={idx} className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
                                    {genre}
                                </span>
                            ))}
                            {movie.genre.length > 2 && <span className="text-xs font-medium text-gray-400">+{movie.genre.length - 2}</span>}
                        </div>
                    )}

                    {/* Director - Only if exists */}
                    {movie.director && (
                        <p className="truncate text-xs text-gray-600">
                            <span className="font-medium text-gray-500">🎬</span> {movie.director}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchMovieCard;
