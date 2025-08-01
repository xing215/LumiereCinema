// components/display/ChatBot/MessageRenderer/MessageRenderer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieCard, MovieList, ScheduleList, QuickActions } from '../MessageTypes';
import { ROUTES, getMovieDetailsPath, getBuyTicketPath } from '@routes/routeConfig';

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
  const navigate = useNavigate();  // Nếu message không có botData, render text thường
  if (!message.botData || !message.botData.type) {
    return (
      <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
        {message.message}
      </div>
    );
  }

  const { type, data, quick_actions, suggestions } = message.botData;

  /**
   * Xử lý click vào quick action
   * @param {object} action - Object chứa action type và data
   */  const handleQuickAction = (action) => {
    console.log('🎬 MessageRenderer - handleQuickAction called with:', action);
    console.log('🎬 Action type:', action.action);
    console.log('🎬 Action data:', action.data);
    
    switch (action.action) {
      case 'find_schedules':
        // Gửi query tìm lịch chiếu
        console.log('🎬 Finding schedules for movie:', action.data.movie_title);
        onQuickAction(`Tôi muốn xem lịch chiếu phim ${action.data.movie_title}`);
        break;
          case 'schedule_conversation':
        // Bắt đầu cuộc hội thoại về lịch chiếu
        console.log('🎬 Starting schedule conversation');
        onQuickAction('Xem lịch chiếu');
        break;
        
      case 'search_conversation':
        // Bắt đầu cuộc hội thoại tìm kiếm
        console.log('🎬 Starting search conversation');
        onQuickAction('Tìm phim hay');
        break;
        
      case 'get_now_showing':
        // Lấy danh sách phim đang chiếu
        console.log('🎬 Getting now showing movies');
        onQuickAction('Phim gì đang chiếu?');
        break;
        
      case 'get_upcoming':
        // Lấy danh sách phim sắp chiếu
        console.log('🎬 Getting upcoming movies');
        onQuickAction('Phim gì sắp chiếu?');
        break;
          case 'movie_details':
        // Navigate đến trang chi tiết phim với đúng route pattern
        console.log('🎬 Navigating to movie details for ID:', action.data.movie_id);
        console.log('🎬 Full action object:', JSON.stringify(action, null, 2));
        
        if (!action.data.movie_id) {
          console.warn('⚠️ No movie_id found in action data');
          return;
        }
        
        const movieDetailsPath = getMovieDetailsPath(action.data.movie_id);
        console.log('🎬 Generated path:', movieDetailsPath);
        console.log('🎬 About to navigate to:', movieDetailsPath);
        navigate(movieDetailsPath);
        break;
          case 'book_ticket':
        // Navigate đến trang đặt vé với đúng route pattern
        console.log('🎬 Navigating to book ticket for movie ID:', action.data.movie_id);
        console.log('🎬 Full action data for book_ticket:', action.data);
        
        // Kiểm tra nếu không có movie_id, có thể lấy từ schedule_id thông qua backend
        if (!action.data.movie_id) {
          console.warn('⚠️ No movie_id found in action data, redirecting to movies page');
          navigate(ROUTES.MOVIES);
          return;
        }
        
        const buyTicketPath = getBuyTicketPath(action.data.movie_id, action.data.branch_id);
        console.log('🎬 Generated path:', buyTicketPath);
        navigate(buyTicketPath);
        break;
          case 'browse_movies':
        // Navigate đến trang danh sách phim với status parameter
        console.log('🎬 Navigating to movies list with status:', action.data?.status);
        
        let moviesUrl = ROUTES.MOVIES;
        if (action.data?.status) {
          moviesUrl += `?status=${action.data.status}`;
        }
        
        console.log('🎬 Generated movies URL:', moviesUrl);
        navigate(moviesUrl);
        break;
        
      default:
        // Gửi text action
        console.log('🎬 Default action - sending text:', action.text);
        onQuickAction(action.text);
    }
  };

  // Render theo type
  switch (type) {    case 'movie_details':
      return (
        <div className="space-y-3">
          {/* Text message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Movie Card */}
          <MovieCard 
            movie={data} 
            onAction={handleQuickAction}
            quickActions={quick_actions}
          />
        </div>
      );    case 'movie_list':
      return (
        <div className="space-y-3">
          {/* Header message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Movie List */}
          <MovieList 
            movies={data} 
            onAction={handleQuickAction}
            status={message.botData.status} // Truyền status vào MovieList
          />
        </div>
      );

    case 'movie_list_for_schedule':
      return (
        <div className="space-y-3">
          {/* Header message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Movie List với focus vào lịch chiếu */}
          <MovieList 
            movies={data} 
            onAction={handleQuickAction}
            context="schedule" // Đánh dấu context để MovieList biết ưu tiên button lịch chiếu
          />
          
          {/* Quick Actions */}
          {(suggestions || []).length > 0 && (
            <QuickActions 
              suggestions={suggestions} 
              onAction={handleQuickAction} 
            />
          )}
        </div>
      );case 'schedule_list':
      return (
        <div className="space-y-3">
          {/* Header message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Schedule List */}
          <ScheduleList 
            scheduleData={data}
            onAction={handleQuickAction}
            suggestions={suggestions}
          />
        </div>
      );    case 'follow_up_question':
      return (
        <div className="space-y-3">
          {/* Question message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Quick Actions */}
          <QuickActions 
            suggestions={suggestions}
            quickActions={message.botData.quick_actions}
            onAction={handleQuickAction}
          />
        </div>
      );    case 'non_movie_related':
      return (
        <div className="space-y-3">
          {/* Polite decline message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
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

    case 'schedule_conversation':
      return (
        <div className="space-y-3">
          {/* Schedule conversation message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Quick Actions để người dùng chọn phim */}
          <QuickActions 
            suggestions={suggestions}
            quickActions={message.botData.quick_actions}
            onAction={handleQuickAction}
          />
        </div>
      );

    case 'search_conversation':
      return (
        <div className="space-y-3">
          {/* Search conversation message */}
          <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
            {message.message}
          </div>
          
          {/* Quick Actions để người dùng chọn thể loại */}
          <QuickActions 
            suggestions={suggestions}
            quickActions={message.botData.quick_actions}
            onAction={handleQuickAction}
          />
        </div>
      );default:
      // Fallback cho text message
      return (
        <div className="inline-block px-3 py-2 rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] text-white max-w-xs lg:max-w-md">
          {message.message}
        </div>
      );
  }
};

export default MessageRenderer;
