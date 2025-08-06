import React from 'react';
import fallbackImg from '@assets/img/PosterNotFound.png';

/**
 * SearchMovieCard - Compact movie card component specifically designed for search autocomplete
 * Thu nhỏ và tối ưu cho search suggestions dropdown
 */
const SearchMovieCard = ({ movie, onClick }) => {
    console.log('🎬 SearchMovieCard render:', movie);
    
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
    };    return (
        <div
            className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-md"
            onClick={() => {
                console.log('🎬 Movie card clicked:', movie);
                onClick?.(movie);
            }}
        >
            <div className="flex items-start space-x-3">
                {/* Movie Poster - Compact size for search */}
                <div className="flex-shrink-0 relative">
                    <img
                        src={movie.posterURL || fallbackImg}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded shadow-sm hover:shadow-md transition-shadow duration-200"
                        onError={handleImageError}
                    />
                    {movie.ratingsAverage > 0 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs px-1 py-0.5 rounded-full font-bold shadow-sm min-w-[18px] text-center">
                            {movie.ratingsAverage.toFixed(1)}
                        </div>
                    )}
                </div>
                
                {/* Movie Info - Compact layout */}
                <div className="flex-1 min-w-0 space-y-1">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm truncate hover:text-blue-600 transition-colors duration-200 pr-2">
                            {movie.title}
                        </h4>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm whitespace-nowrap ${
                            movie.status === 'Now Showing' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                            {movie.status}
                        </span>
                    </div>
                    
                    {/* Meta Info - Compact */}
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                        {movie.ageRating && (
                            <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium">
                                {movie.ageRating}
                            </span>
                        )}
                        {movie.duration && (
                            <span className="flex items-center">
                                <span className="text-gray-400 mr-1">⏱</span>
                                {movie.duration}min
                            </span>
                        )}
                        {movie.releaseDate && (
                            <span className="text-gray-400">
                                {getReleaseYear(movie.releaseDate)}
                            </span>
                        )}
                    </div>
                    
                    {/* Genres - Only show first 2 for compactness */}
                    {movie.genre && Array.isArray(movie.genre) && movie.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {movie.genre.slice(0, 2).map((genre, idx) => (
                                <span 
                                    key={idx}
                                    className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium"
                                >
                                    {genre}
                                </span>
                            ))}
                            {movie.genre.length > 2 && (
                                <span className="text-xs text-gray-400 font-medium">
                                    +{movie.genre.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                    
                    {/* Director - Only if exists */}
                    {movie.director && (
                        <p className="text-xs text-gray-600 truncate">
                            <span className="font-medium text-gray-500">🎬</span> {movie.director}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchMovieCard;
