// components/display/ChatBot/MessageTypes/MovieCard.jsx
import React from 'react';
import { Play, Calendar, Clock, Star } from 'lucide-react';

/**
 * MovieCard - Component hiển thị chi tiết phim trong chat
 *
 * Kiến thức: Component này nhận data phim từ backend response
 * và render thành card đẹp với các action buttons
 */
const MovieCard = ({ movie, onAction, quickActions = [], onMovieInteraction }) => {
    if (!movie) return null;

    // Report movie view interaction when component mounts
    React.useEffect(() => {
        if (onMovieInteraction && movie) {
            onMovieInteraction(movie, 'view');
        }
    }, [movie, onMovieInteraction]);

    return (
        <div className="max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
            {/* Movie Poster */}
            {movie.posterURL && (
                <div className="relative h-64 bg-gray-100">
                    <img
                        src={movie.posterURL}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.target.src = '/placeholder-movie.jpg'; // Fallback image
                        }}
                    />{' '}
                    {/* Play button overlay */}
                    {movie.trailerURL && (
                        <div className="bg-opacity-30 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity hover:opacity-100">
                            <button
                                onClick={() => {
                                    // Report trailer interaction
                                    onMovieInteraction && onMovieInteraction(movie, 'trailer_click');
                                    window.open(movie.trailerURL, '_blank');
                                }}
                                className="rounded-full bg-red-600 p-3 text-white transition-colors hover:bg-red-700"
                            >
                                <Play className="h-6 w-6 fill-current" />
                            </button>
                        </div>
                    )}
                </div>
            )}{' '}
            {/* Movie Info */}
            <div className="space-y-2 p-3">
                {/* Title */}
                <h3 className="line-clamp-2 text-sm font-bold break-words text-gray-800">{movie.title}</h3>

                {/* Meta Info */}
                <div className="space-y-1 text-xs text-gray-600">
                    {' '}
                    {/* Genre & Age Rating */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Genres - Only show first 1 genre and +n for others */}
                        {movie.genre && (
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(movie.genre) ? (
                                    <>
                                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">{movie.genre[0]}</span>
                                        {movie.genre.length > 1 && <span className="text-xs font-medium text-gray-400">+{movie.genre.length - 1}</span>}
                                    </>
                                ) : (
                                    // If genre is a string, split by comma and show first one
                                    <>
                                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">{movie.genre.split(',')[0].trim()}</span>
                                        {movie.genre.split(',').length > 1 && <span className="text-xs font-medium text-gray-400">+{movie.genre.split(',').length - 1}</span>}
                                    </>
                                )}
                            </div>
                        )}
                        {movie.ageRating && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium break-words text-orange-700">{movie.ageRating}</span>}
                    </div>
                    {/* Duration & Release Date */}
                    <div className="flex flex-wrap items-center gap-4">
                        {movie.duration && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">{movie.duration}</span>
                            </div>
                        )}
                        {movie.releaseDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">{movie.releaseDate}</span>
                            </div>
                        )}
                    </div>{' '}
                    {/* Rating */}
                    {movie.rating && movie.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span className="text-xs">{movie.rating}</span>
                        </div>
                    )}
                    {/* Director */}
                    {movie.director && (
                        <div className="text-xs break-words">
                            <span className="font-medium">Đạo diễn:</span> {movie.director}
                        </div>
                    )}
                    {/* Cast */}
                    {movie.cast && (
                        <div className="text-xs break-words">
                            <span className="font-medium">Diễn viên:</span> {movie.cast}
                        </div>
                    )}
                </div>

                {/* Description */}
                {movie.description && <p className="line-clamp-2 text-xs break-words text-gray-700">{movie.description}</p>}

                {/* Quick Actions */}
                {quickActions && quickActions.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                        {' '}
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        // Report quick action interaction
                                        onMovieInteraction &&
                                            onMovieInteraction(movie, 'quick_action', {
                                                action: action.action,
                                                text: action.text,
                                            });

                                        const actionWithData = {
                                            ...action,
                                            data: {
                                                ...action.data,
                                                movie_id: movie._id || movie.id,
                                                movie_title: movie.title,
                                            },
                                        };
                                        onAction(actionWithData);
                                    }}
                                    className="transform rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-1 text-xs font-medium break-words text-white shadow-md transition-all hover:scale-105 hover:from-purple-600 hover:to-indigo-700"
                                >
                                    {action.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCard;
