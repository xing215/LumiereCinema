// components/display/ChatBot/MessageRenderer/MessageRenderer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieCard, MovieList, ScheduleList, QuickActions } from '../MessageTypes';

/**
 * MessageRenderer - Component render tin nhắn dựa theo type từ backend
 * 
 * Kiến thức: Component này sẽ nhận botResponse từ backend và render
 * UI phù hợp với từng loại response:
 * 
 * 1. 'movie_details' -> MovieCard component
 * 2. 'movie_list' -> MovieList component  
 * 3. 'schedule_list' -> ScheduleList component
 * 4. 'follow_up_question' -> QuickActions với suggestions
 * 5. 'text' hoặc default -> Plain text message
 */
const MessageRenderer = ({ message, onQuickAction }) => {
  const navigate = useNavigate();
  
  // Nếu message không có botData, render text thường
  if (!message.botData || !message.botData.type) {
    return (
      <div className="inline-block px-3 py-2 rounded-xl bg-purple-600 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)] text-white max-w-xs lg:max-w-md">
        {message.message}
      </div>
    );
  }

  const { type, data, quick_actions, suggestions } = message.botData;

  /**
   * Xử lý click vào quick action
   * @param {object} action - Object chứa action type và data
   */
  const handleQuickAction = (action) => {
    switch (action.action) {
      case 'find_schedules':
        // Gửi query tìm lịch chiếu
        onQuickAction(`Tôi muốn xem lịch chiếu phim ${action.data.movie_title}`);
        break;
        
      case 'movie_details':
        // Navigate đến trang chi tiết phim
        navigate(`/movies/${action.data.movie_id}`);
        break;
        
      case 'book_ticket':
        // Navigate đến trang đặt vé với schedule_id
        navigate(`/booking?schedule=${action.data.schedule_id}`);
        break;
        
      case 'browse_movies':
        // Navigate đến trang danh sách phim
        navigate('/movies');
        break;
        
      default:
        // Gửi text action
        onQuickAction(action.text);
    }
  };

  // Render theo type
  switch (type) {
    case 'movie_details':
      return (
        <div className="space-y-3">
          {/* Text message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-purple-600 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Movie Card */}
          <MovieCard 
            movie={data} 
            onAction={handleQuickAction}
            quickActions={quick_actions}
          />
        </div>
      );

    case 'movie_list':
      return (
        <div className="space-y-3">
          {/* Header message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-purple-600 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Movie List */}
          <MovieList 
            movies={data} 
            onAction={handleQuickAction}
          />
        </div>
      );

    case 'schedule_list':
      return (
        <div className="space-y-3">
          {/* Header message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-purple-600 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Schedule List */}
          <ScheduleList 
            scheduleData={data}
            onAction={handleQuickAction}
            suggestions={suggestions}
          />
        </div>
      );

    case 'follow_up_question':
      return (
        <div className="space-y-3">
          {/* Question message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-purple-600 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Quick Actions */}
          <QuickActions 
            suggestions={suggestions}
            quickActions={message.botData.quick_actions}
            onAction={handleQuickAction}
          />
        </div>
      );

    case 'non_movie_related':
      return (
        <div className="space-y-3">
          {/* Polite decline message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-orange-500 shadow-[inset_0px_0px_50px_3px_rgba(251,113,133,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Suggestions to redirect to movie topics */}
          {suggestions && (
            <QuickActions 
              suggestions={suggestions}
              onAction={handleQuickAction}
            />
          )}
        </div>
      );

    default:
      // Fallback cho text message
      return (
        <div className="inline-block px-3 py-2 rounded-xl bg-purple-600 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)] text-white max-w-xs lg:max-w-md">
          {message.message}
        </div>
      );
  }
};

export default MessageRenderer;
