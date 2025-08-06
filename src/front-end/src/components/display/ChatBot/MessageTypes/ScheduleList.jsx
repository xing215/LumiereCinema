// components/ChatMessage/MessageTypes/ScheduleList.jsx
import React from 'react';
import { Clock, MapPin, Users, DollarSign } from 'lucide-react';

/**
 * ScheduleList - Component hiển thị danh sách lịch chiếu trong chat
 * 
 * Kiến thức: Component này nhận scheduleData từ backend response
 * và render thành danh sách lịch chiếu với booking actions
 */
const ScheduleList = ({ scheduleData, onAction, suggestions = [], onScheduleInteraction }) => {
  if (!scheduleData || !scheduleData.schedules || scheduleData.schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center text-gray-500">
        Không có lịch chiếu nào được tìm thấy.
      </div>
    );
  }

  const { movie_id, branch_id, movie_title, branch_location, date, schedules, total_schedules } = scheduleData;

  // Report schedule list view interaction when component mounts
  React.useEffect(() => {
    if (onScheduleInteraction && scheduleData) {
      onScheduleInteraction(scheduleData, 'schedule_list_view', {
        movie_id,
        branch_id,
        date,
        total_schedules
      });
    }
  }, [scheduleData, onScheduleInteraction, movie_id, branch_id, date, total_schedules]);
  return (
    <div className="space-y-3">
      {/* Schedule Header Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 flex-wrap">
          <MapPin className="w-3 h-3" />
          <span className="font-medium break-words">{branch_location}</span>
          <span>•</span>
          <span className="break-words">{date}</span>
        </div>
        <h4 className="font-semibold text-gray-800 text-sm break-words">
          {movie_title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {total_schedules} suất chiếu có sẵn
        </p>
      </div>

      {/* Schedule List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {schedules.map((schedule, index) => (
          <div 
            key={schedule._id || index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Time & Room Info */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span className="font-semibold text-sm text-gray-800">
                    {schedule.time}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600">
                  <div>Phòng: {schedule.room}</div>
                </div>
              </div>

              {/* Availability & Price */}
              <div className="text-right text-xs">
                {/* Available Seats */}
                <div className="flex items-center gap-1 text-green-600 mb-1">
                  <Users className="w-3 h-3" />
                  <span>{schedule.available_seats} ghế trống</span>
                </div>

                {/* Price */}
                {schedule.price !== 'N/A' && (
                  <div className="flex items-center gap-1 text-gray-700">
                    <DollarSign className="w-3 h-3" />
                    <span className="font-medium">{schedule.price}</span>
                  </div>
                )}
              </div>
            </div>            {/* Quick Actions for this schedule */}
            {schedule.quick_actions && schedule.quick_actions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  {schedule.quick_actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => {
                        // Report schedule interaction
                        onScheduleInteraction && onScheduleInteraction(schedule, 'quick_action', {
                          action: action.action,
                          text: action.text,
                          movie_id,
                          branch_id,
                          date,
                          time: schedule.time,
                          room: schedule.room
                        });
                        
                        const actionWithData = {
                          ...action,
                          data: {
                            ...action.data,
                            movie_id: movie_id,
                            movie_title: movie_title,
                            schedule_id: schedule._id,
                            branch_id: branch_id,
                            date: date,
                            time: schedule.time,
                            room: schedule.room
                          }
                        };
                        onAction(actionWithData);
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-2 py-1 rounded-lg text-xs font-medium hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md break-words"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>      {/* General Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-2">Các tùy chọn khác:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // Report suggestion interaction
                  onScheduleInteraction && onScheduleInteraction(suggestion, 'suggestion_click', {
                    text: suggestion.text,
                    action: suggestion.action,
                    movie_id,
                    branch_id
                  });
                  
                  const suggestionWithData = {
                    ...suggestion,
                    data: {
                      ...suggestion.data,
                      movie_id: movie_id,
                      movie_title: movie_title,
                      branch_id: branch_id
                    }
                  };
                  onAction(suggestionWithData);
                }}
                className="bg-white text-gray-700 border border-gray-300 px-2 py-1 rounded-lg text-xs hover:bg-gray-100 transition-colors break-words"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
