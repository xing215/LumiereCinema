// components/ChatMessage/MessageTypes/MovieList.jsx
import React from 'react';
import { ChevronRight, Star } from 'lucide-react';

/**
 * MovieList - Component hiển thị danh sách phim trong chat
 *
 * Kiến thức: Component này nhận array of movies từ backend
 * và render thành danh sách compact với quick actions
 */
const MovieList = ({ movies, onAction, status, onMovieInteraction }) => {
    if (!movies || movies.length === 0) {
        return <div className="p-4 text-center text-gray-500">Không tìm thấy phim nào.</div>;
    }

    // Report movie list view interaction when component mounts
    React.useEffect(() => {
        if (onMovieInteraction && movies && movies.length > 0) {
            onMovieInteraction(movies, 'list_view', {
                count: movies.length,
                status,
            });
        }
    }, [movies, onMovieInteraction, status]);

    return (
        <div className="max-h-96 space-y-2 overflow-y-auto">
            {movies.map((movie, index) => (
                <div key={movie._id || index} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex gap-3">
                        {/* Movie Poster Thumbnail */}
                        {movie.posterURL && (
                            <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                <img
                                    src={movie.posterURL}
                                    alt={movie.title}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-movie.jpg';
                                    }}
                                />
                            </div>
                        )}{' '}
                        {/* Movie Info */}
                        <div className="min-w-0 flex-1">
                            {/* Title */}
                            <h4 className="mb-1 line-clamp-1 text-xs font-semibold break-words text-gray-800">{movie.title}</h4>
                            {/* Meta info */}
                            <div className="space-y-1 text-xs text-gray-600">
                                {' '}
                                {/* Age Rating */}
                                {movie.ageRating && (
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs break-words text-orange-700">{movie.ageRating}</span>
                                    </div>
                                )}
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
                                {/* Rating & Duration */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {movie.ratingsAverage > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                                            <span className="text-xs">{movie.ratingsAverage.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {movie.duration && <span className="text-xs">{movie.duration}min</span>}
                                </div>
                                {/* Description preview */}
                                {movie.description && <p className="line-clamp-2 text-gray-700">{movie.description}</p>}
                            </div>{' '}
                            {/* Quick Actions */}
                            {movie.quick_actions && movie.quick_actions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {movie.quick_actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
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
                                            className="rounded bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-1 text-xs font-medium break-words text-white transition-all hover:from-purple-600 hover:to-indigo-700"
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>{' '}
                        {/* Arrow for detailed view */}
                        <div className="flex flex-shrink-0 items-center">
                            <button
                                onClick={() => {
                                    // Report movie details click interaction
                                    onMovieInteraction && onMovieInteraction(movie, 'details_click');

                                    const movieDetailsAction = {
                                        action: 'movie_details',
                                        data: { movie_id: movie._id || movie.id },
                                    };
                                    onAction(movieDetailsAction);
                                }}
                                className="text-gray-400 transition-colors hover:text-gray-600"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}{' '}
            {/* Show more button if there are many movies */}
            {movies.length > 5 && (
                <div className="pt-2 text-center">
                    <button
                        onClick={() => {
                            // Xác định status URL param dựa trên status từ backend
                            let statusParam = '';
                            if (status === 'upcoming') {
                                statusParam = 'up'; // Sắp chiếu -> ?status=up
                            } else if (status === 'now-showing') {
                                statusParam = 'now'; // Đang chiếu -> ?status=now
                            }
                            const browseAction = {
                                action: 'browse_movies',
                                text: 'Xem tất cả phim',
                                data: { status: statusParam },
                            };

                            onAction(browseAction);
                        }}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                        Xem tất cả {movies.length} phim →
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovieList;
