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
        return <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500 shadow-sm">Không có lịch chiếu nào được tìm thấy.</div>;
    }

    const { movie_id, branch_id, movie_title, branch_location, date, schedules, total_schedules } = scheduleData;

    // Report schedule list view interaction when component mounts
    React.useEffect(() => {
        if (onScheduleInteraction && scheduleData) {
            onScheduleInteraction(scheduleData, 'schedule_list_view', {
                movie_id,
                branch_id,
                date,
                total_schedules,
            });
        }
    }, [scheduleData, onScheduleInteraction, movie_id, branch_id, date, total_schedules]);
    return (
        <div className="space-y-3">
            {/* Schedule Header Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium break-words">{branch_location}</span>
                    <span>•</span>
                    <span className="break-words">{date}</span>
                </div>
                <h4 className="text-sm font-semibold break-words text-gray-800">{movie_title}</h4>
                <p className="mt-1 text-xs text-gray-500">{total_schedules} suất chiếu có sẵn</p>
            </div>
            {/* Schedule List */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
                {schedules.map((schedule, index) => (
                    <div key={schedule._id || index} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                        {' '}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {/* Time & Room Info */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-blue-500" />
                                    <span className="text-sm font-semibold text-gray-800">{schedule.time}</span>
                                </div>

                                <div className="text-xs text-gray-600">
                                    <div>Phòng: {schedule.room}</div>
                                </div>
                            </div>

                            {/* Availability & Price */}
                            <div className="text-right text-xs">
                                {/* Available Seats */}
                                <div className="mb-1 flex items-center gap-1 text-green-600">
                                    <Users className="h-3 w-3" />
                                    <span>{schedule.available_seats} ghế trống</span>
                                </div>

                                {/* Price */}
                                {schedule.price !== 'N/A' && (
                                    <div className="flex items-center gap-1 text-gray-700">
                                        <DollarSign className="h-3 w-3" />
                                        <span className="font-medium">{schedule.price}</span>
                                    </div>
                                )}
                            </div>
                        </div>{' '}
                        {/* Quick Actions for this schedule */}
                        {schedule.quick_actions && schedule.quick_actions.length > 0 && (
                            <div className="mt-3 border-t border-gray-100 pt-3">
                                <div className="flex gap-2">
                                    {schedule.quick_actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={() => {
                                                // Report schedule interaction
                                                onScheduleInteraction &&
                                                    onScheduleInteraction(schedule, 'quick_action', {
                                                        action: action.action,
                                                        text: action.text,
                                                        movie_id,
                                                        branch_id,
                                                        date,
                                                        time: schedule.time,
                                                        room: schedule.room,
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
                                                        room: schedule.room,
                                                    },
                                                };
                                                onAction(actionWithData);
                                            }}
                                            className="transform rounded-lg bg-gradient-to-r from-green-500 to-blue-600 px-2 py-1 text-xs font-medium break-words text-white shadow-md transition-all hover:scale-105 hover:from-green-600 hover:to-blue-700"
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>{' '}
            {/* General Suggestions */}
            {suggestions && suggestions.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-xs text-gray-600">Các tùy chọn khác:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    // Report suggestion interaction
                                    onScheduleInteraction &&
                                        onScheduleInteraction(suggestion, 'suggestion_click', {
                                            text: suggestion.text,
                                            action: suggestion.action,
                                            movie_id,
                                            branch_id,
                                        });

                                    const suggestionWithData = {
                                        ...suggestion,
                                        data: {
                                            ...suggestion.data,
                                            movie_id: movie_id,
                                            movie_title: movie_title,
                                            branch_id: branch_id,
                                        },
                                    };
                                    onAction(suggestionWithData);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs break-words text-gray-700 transition-colors hover:bg-gray-100"
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
