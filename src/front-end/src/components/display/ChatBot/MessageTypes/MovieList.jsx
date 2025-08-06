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
    return (
      <div className="text-gray-500 text-center p-4">
        Không tìm thấy phim nào.
      </div>
    );
  }

  // Report movie list view interaction when component mounts
  React.useEffect(() => {
    if (onMovieInteraction && movies && movies.length > 0) {
      onMovieInteraction(movies, 'list_view', { 
        count: movies.length, 
        status 
      });
    }
  }, [movies, onMovieInteraction, status]);

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {movies.map((movie, index) => (
        <div 
          key={movie._id || index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-3">
            {/* Movie Poster Thumbnail */}
            {movie.posterURL && (
              <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded overflow-hidden">
                <img 
                  src={movie.posterURL} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.jpg';
                  }}
                />
              </div>
            )}            {/* Movie Info */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4 className="font-semibold text-gray-800 text-xs line-clamp-1 mb-1 break-words">
                {movie.title}
              </h4>

              {/* Meta info */}
              <div className="space-y-1 text-xs text-gray-600">
                {/* Genre */}
                {movie.genre && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs break-words">
                      {movie.genre}
                    </span>
                    {movie.ageRating && (
                      <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs break-words">
                        {movie.ageRating}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating & Duration */}
                <div className="flex items-center gap-2 flex-wrap">
                  {movie.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{movie.rating}</span>
                    </div>
                  )}
                  {movie.duration && (
                    <span className="text-xs">{movie.duration}</span>
                  )}
                </div>

                {/* Description preview */}
                {movie.description && (
                  <p className="text-gray-700 line-clamp-2">
                    {movie.description}
                  </p>
                )}
              </div>              {/* Quick Actions */}
              {movie.quick_actions && movie.quick_actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {movie.quick_actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => {
                        // Report quick action interaction
                        onMovieInteraction && onMovieInteraction(movie, 'quick_action', {
                          action: action.action,
                          text: action.text
                        });
                        
                        const actionWithData = {
                          ...action,
                          data: {
                            ...action.data,
                            movie_id: movie._id || movie.id,
                            movie_title: movie.title
                          }
                        };
                        onAction(actionWithData);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-1 rounded text-xs font-medium hover:from-purple-600 hover:to-indigo-700 transition-all break-words"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              )}
            </div>            {/* Arrow for detailed view */}
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => {
                  // Report movie details click interaction
                  onMovieInteraction && onMovieInteraction(movie, 'details_click');
                  
                  const movieDetailsAction = {
                    action: 'movie_details',
                    data: { movie_id: movie._id || movie.id }
                  };
                  onAction(movieDetailsAction);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}      {/* Show more button if there are many movies */}
      {movies.length > 5 && (
        <div className="text-center pt-2">
          <button
            onClick={() => {
              // Xác định status URL param dựa trên status từ backend
              let statusParam = '';
              if (status === 'upcoming') {
                statusParam = 'up';  // Sắp chiếu -> ?status=up
              } else if (status === 'now-showing') {
                statusParam = 'now'; // Đang chiếu -> ?status=now
              }
                const browseAction = {
                action: 'browse_movies',
                text: 'Xem tất cả phim',
                data: { status: statusParam }
              };
              
              onAction(browseAction);
            }}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Xem tất cả {movies.length} phim →
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieList;
