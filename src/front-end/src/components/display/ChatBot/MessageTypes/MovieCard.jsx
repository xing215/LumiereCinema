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
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm border border-gray-200">
      {/* Movie Poster */}
      {movie.posterURL && (
        <div className="relative h-64 bg-gray-100">
          <img 
            src={movie.posterURL} 
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-movie.jpg'; // Fallback image
            }}
          />          {/* Play button overlay */}
          {movie.trailerURL && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  // Report trailer interaction
                  onMovieInteraction && onMovieInteraction(movie, 'trailer_click');
                  window.open(movie.trailerURL, '_blank');
                }}
                className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
              >
                <Play className="w-6 h-6 fill-current" />
              </button>
            </div>
          )}
        </div>
      )}      {/* Movie Info */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 break-words">
          {movie.title}
        </h3>

        {/* Meta Info */}
        <div className="space-y-1 text-xs text-gray-600">          {/* Genre & Age Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Genres - Only show first 1 genre and +n for others */}
            {movie.genre && (
              <div className="flex flex-wrap gap-1">
                {Array.isArray(movie.genre) ? (
                  <>
                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium">
                      {movie.genre[0]}
                    </span>
                    {movie.genre.length > 1 && (
                      <span className="text-xs text-gray-400 font-medium">
                        +{movie.genre.length - 1}
                      </span>
                    )}
                  </>
                ) : (
                  // If genre is a string, split by comma and show first one
                  <>
                    <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium">
                      {movie.genre.split(',')[0].trim()}
                    </span>
                    {movie.genre.split(',').length > 1 && (
                      <span className="text-xs text-gray-400 font-medium">
                        +{movie.genre.split(',').length - 1}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
            {movie.ageRating && (
              <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-medium break-words">
                {movie.ageRating}
              </span>
            )}
          </div>{/* Duration & Release Date */}
          <div className="flex items-center gap-4 flex-wrap">
            {movie.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{movie.duration}</span>
              </div>
            )}
            {movie.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{movie.releaseDate}</span>
              </div>
            )}
          </div>          {/* Rating */}
          {movie.rating && movie.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
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
        {movie.description && (
          <p className="text-xs text-gray-700 line-clamp-2 break-words">
            {movie.description}
          </p>
        )}

        {/* Quick Actions */}
        {quickActions && quickActions.length > 0 && (
          <div className="pt-3 border-t border-gray-100">            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
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
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-medium hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md break-words"
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
