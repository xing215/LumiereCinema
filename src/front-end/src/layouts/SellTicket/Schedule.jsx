// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useEffect } from 'react';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getDateString = date => {
    return new Date(date).toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
};

const formatDateMMDD = dateStr => {
    const d = new Date(dateStr + 'T00:00:00');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
};

// =============================================================================
// MAIN SCHEDULE COMPONENT
// =============================================================================

const Schedule = ({ schedules = [], loading, onScheduleSelect }) => {
    // =============================================================================
    // STATE AND DATA PROCESSING
    // =============================================================================

    const uniqueDates = [...new Set(schedules.map(s => getDateString(s.startTime)))].sort();
    const [selectedDate, setSelectedDate] = useState(uniqueDates[0] || null);

    useEffect(() => {
        if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [uniqueDates, selectedDate]);

    const filteredSchedules = selectedDate
        ? schedules
            .filter(s => getDateString(s.startTime) === selectedDate && s.availableSeatsCount > 0)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        : [];

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
            <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden w-[90%] relative">
                <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge" />
                
                <div className="flex flex-col gap-6 items-center w-full max-h-full py-4 px-6">
                    {loading ? (
                        <div className="md:text-md h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white mx-2">
                            • • •
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-row gap-2 mb-4 justify-center items-center flex-wrap w-full">
                                {uniqueDates.map(dateStr => (
                                    <button
                                        key={dateStr}
                                        className={`rounded-lg text-2xl px-6 py-5 text-center font-['Unbounded'] text-white mix-blend-color-dodge font-semibold  ${selectedDate === dateStr ? 'ring-2 ring-zinc-500 bg-zinc-300/70' : 'bg-zinc-300/30'}`}
                                        onClick={() => setSelectedDate(dateStr)}
                                    >
                                        {formatDateMMDD(dateStr)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-row flex-wrap gap-4 items-start justify-center w-full">
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map(schedule => (
                                        <button
                                            key={schedule._id}
                                            className="px-5 py-1 rounded-xl w-[23%] bg-zinc-300/60 text-white mix-blend-color-dodge shadow hover:bg-zinc-300/80 cursor-pointer transition flex flex-col items-center"
                                            onClick={() => onScheduleSelect(schedule)}
                                            disabled={schedule.availableSeatsCount <= 0}
                                        >
                                            <div className="text-2xl font-['Unbounded'] font-bold">
                                                {new Date(schedule.startTime).toLocaleTimeString('en-US', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit', 
                                                    hour12: false,
                                                    timeZone: 'Asia/Ho_Chi_Minh'
                                                })}
                                            </div>
                                            <div className="text-sm font-['Unbounded'] font-normal">
                                                {schedule.availableSeatsCount} seats left
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-gray-500 font-semibold">
                                        No showtimes for this date.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
