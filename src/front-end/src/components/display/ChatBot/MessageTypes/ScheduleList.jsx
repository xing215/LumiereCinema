// components/ChatMessage/MessageTypes/ScheduleList.jsx
import React from 'react';
import { Clock, MapPin, Users, DollarSign } from 'lucide-react';

/**
 * ScheduleList - Component hiển thị danh sách lịch chiếu trong chat
 * 
 * Kiến thức: Component này nhận scheduleData từ backend response
 * và render thành danh sách lịch chiếu với booking actions
 */
const ScheduleList = ({ scheduleData, onAction, suggestions = [] }) => {
  console.log('🎬 ScheduleList - Received scheduleData:', JSON.stringify(scheduleData, null, 2));
  
  if (!scheduleData || !scheduleData.schedules || scheduleData.schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center text-gray-500">
        Không có lịch chiếu nào được tìm thấy.
      </div>
    );
  }

  const { movie_id, branch_id, movie_title, branch_location, date, schedules, total_schedules } = scheduleData;
  
  console.log('🎬 ScheduleList - Extracted data:', {
    movie_id,
    branch_id,
    movie_title,
    branch_location,
    date,
    schedulesCount: schedules?.length,
    'scheduleData keys': Object.keys(scheduleData)
  });

  return (
    <div className="space-y-3">
      {/* Schedule Header Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{branch_location}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
        <h4 className="font-semibold text-gray-800">
          {movie_title}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {total_schedules} suất chiếu có sẵn
        </p>
      </div>

      {/* Schedule List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {schedules.map((schedule, index) => (
          <div 
            key={schedule._id || index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              {/* Time & Room Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-lg text-gray-800">
                    {schedule.time}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>Phòng: {schedule.room}</div>
                </div>
              </div>

              {/* Availability & Price */}
              <div className="text-right text-sm">
                {/* Available Seats */}
                <div className="flex items-center gap-1 text-green-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span>{schedule.available_seats} ghế trống</span>
                </div>

                {/* Price */}
                {schedule.price !== 'N/A' && (
                  <div className="flex items-center gap-1 text-gray-700">
                    <DollarSign className="w-4 h-4" />
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
                      onClick={() => {                        const actionWithData = {
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
                        console.log('🎬 ScheduleList - Button clicked with action:', actionWithData);
                        console.log('🎬 ScheduleList - Schedule data:', scheduleData);
                        console.log('🎬 ScheduleList - Schedule object:', schedule);
                        onAction(actionWithData);
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md"
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
          <p className="text-sm text-gray-600 mb-2">Các tùy chọn khác:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {                  const suggestionWithData = {
                    ...suggestion,
                    data: {
                      ...suggestion.data,
                      movie_id: movie_id,
                      movie_title: movie_title,
                      branch_id: branch_id
                    }
                  };
                  console.log('🎬 ScheduleList - Suggestion clicked with action:', suggestionWithData);
                  onAction(suggestionWithData);
                }}
                className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors"
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
