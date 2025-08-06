import { useState, useRef, useEffect } from 'react';

const DateChosenButton = ({ selectedDate, onDateChange, scheduleDates = [] }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (event) => {
        const newDate = new Date(event.target.value);
        onDateChange(newDate);
        setShowDatePicker(false);
    };

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const decreaseDate = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(newDate);
    };

    const increaseDate = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate);
    };

    // Helper function to check if a date has schedules
    const hasSchedule = (date) => {
        const dateString = formatDateForInput(date);
        return scheduleDates.some(scheduleDate => {
            if (typeof scheduleDate === 'string') {
                return scheduleDate.startsWith(dateString);
            }
            if (scheduleDate instanceof Date) {
                return formatDateForInput(scheduleDate) === dateString;
            }
            return false;
        });
    };

    // Generate calendar days for the current month
    const generateCalendarDays = () => {
        const currentDate = new Date(selectedDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // First day of the month and last day
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Find the start of the calendar (may include previous month days)
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate 42 days (6 weeks x 7 days)
        const days = [];
        const currentCalendarDate = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentCalendarDate));
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
        }
        
        return days;
    };

    const calendarDays = generateCalendarDays();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // Navigation for calendar month
    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        onDateChange(newDate);
    };

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    return (
        <div ref={datePickerRef} className="relative z-20 flex items-center gap-1">
            {/* Decrease Date Button */}
            <button 
                className="font-unbounded h-9 w-9 rounded-xl bg-white text-lg text-slate-950 hover:cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={decreaseDate}
                title="Previous day"
            >
                &lt;
            </button>
            
            {/* Date Display Button */}
            <button 
                className="font-unbounded h-9 rounded-xl bg-white px-5 text-lg text-slate-950 hover:cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowDatePicker(!showDatePicker)}
            >
                {formatDate(selectedDate)}
            </button>
            
            {/* Increase Date Button */}
            <button 
                className="font-unbounded h-9 w-9 rounded-xl bg-white text-lg text-slate-950 hover:cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={increaseDate}
                title="Next day"
            >
                &gt;
            </button>
            
            {/* Date Picker Dropdown */}
            {showDatePicker && (
                <div className="absolute z-100 top-full mt-2 -right-[10%] bg-white rounded-lg shadow-lg border p-4 min-w-[300px]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            &#8249;
                        </button>
                        <h3 className="font-semibold text-lg">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            &#8250;
                        </button>
                    </div>

                    {/* Day Labels */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const isCurrentMonth = day.getMonth() === currentMonth;
                            const isSelected = day.toDateString() === selectedDate.toDateString();
                            const isToday = day.toDateString() === new Date().toDateString();
                            const hasScheduleDate = hasSchedule(day);
                            console.log(`Checking schedule for ${day.toDateString()}: ${hasScheduleDate}`);
                            console.log(`Day ${index + 1}: ${day.toDateString()}, Current Month: ${isCurrentMonth}, Selected: ${isSelected}, Today: ${isToday}, Has Schedule: ${hasScheduleDate}`);

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onDateChange(day);
                                        setShowDatePicker(false);
                                    }}
                                    className={`
                                        p-2 text-sm rounded transition-colors relative
                                        ${!isCurrentMonth 
                                            ? 'text-gray-300 hover:bg-gray-50' 
                                            : 'text-gray-900 hover:bg-gray-100'
                                        }
                                        ${isSelected 
                                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                            : ''
                                        }
                                        ${isToday && !isSelected 
                                            ? 'bg-blue-100 font-semibold' 
                                            : ''
                                        }
                                        ${hasScheduleDate && !isSelected 
                                            ? 'ring-2 ring-green-400 bg-green-50' 
                                            : ''
                                        }
                                    `}
                                >
                                    {day.getDate()}
                                    {hasScheduleDate && (
                                        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateChosenButton;