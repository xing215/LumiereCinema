// components/display/ChatBot/MessageTypes/MovieCard.jsx
import React from 'react';
import { Play, Calendar, Clock, Star } from 'lucide-react';

/**
 * MovieCard - Component hiển thị chi tiết phim trong chat
 * 
 * Kiến thức: Component này nhận data phim từ backend response
 * và render thành card đẹp với các action buttons
 */
const MovieCard = ({ movie, onAction, quickActions = [] }) => {
  if (!movie) return null;

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
          />
          {/* Play button overlay */}
          {movie.trailerURL && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
              <button 
                onClick={() => window.open(movie.trailerURL, '_blank')}
                className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
              >
                <Play className="w-6 h-6 fill-current" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Movie Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
          {movie.title}
        </h3>

        {/* Meta Info */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Genre & Age Rating */}
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
              {movie.genre}
            </span>
            {movie.ageRating && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                {movie.ageRating}
              </span>
            )}
          </div>

          {/* Duration & Release Date */}
          <div className="flex items-center gap-4">
            {movie.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.duration}</span>
              </div>
            )}
            {movie.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{movie.releaseDate}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {movie.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{movie.rating}</span>
            </div>
          )}

          {/* Director */}
          {movie.director && (
            <div>
              <span className="font-medium">Đạo diễn:</span> {movie.director}
            </div>
          )}

          {/* Cast */}
          {movie.cast && (
            <div>
              <span className="font-medium">Diễn viên:</span> {movie.cast}
            </div>
          )}
        </div>

        {/* Description */}
        {movie.description && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {movie.description}
          </p>
        )}

        {/* Quick Actions */}
        {quickActions && quickActions.length > 0 && (
          <div className="pt-3 border-t border-gray-100">            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (                <button
                  key={index}
                  onClick={() => {
                    const actionWithData = {
                      ...action,
                      data: {
                        ...action.data,
                        movie_id: movie._id || movie.id,
                        movie_title: movie.title
                      }
                    };
                    console.log('🎬 MovieCard - Button clicked with action:', actionWithData);
                    console.log('🎬 MovieCard - Movie object:', movie);
                    console.log('🎬 MovieCard - Movie ID being used:', movie._id || movie.id);
                    onAction(actionWithData);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md"
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
