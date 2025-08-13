// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useEffect } from 'react';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getDateString = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};

const formatDateMMDD = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${dd}/${mm}`;
};

// =============================================================================
// MAIN SCHEDULE COMPONENT
// =============================================================================

const Schedule = ({ schedules = [], loading, onScheduleSelect }) => {
    // =============================================================================
    // STATE AND DATA PROCESSING
    // =============================================================================

    const uniqueDates = [...new Set(schedules.map((s) => getDateString(s.startTime)))].sort((a, b) => new Date(a) - new Date(b));
    const [selectedDate, setSelectedDate] = useState(uniqueDates[0] || null);

    useEffect(() => {
        if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [uniqueDates, selectedDate]);

    const filteredSchedules = selectedDate ? schedules.filter((s) => getDateString(s.startTime) === selectedDate).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) : [];

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
            <div className="relative flex h-[80vh] w-[90%] items-start justify-center overflow-hidden rounded-xl">
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-zinc-300/30 mix-blend-color-dodge" />

                <div className="flex max-h-full w-full flex-col items-center gap-6 px-6 py-4">
                    {loading ? (
                        <div className="md:text-md mx-2 h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white">• • •</div>
                    ) : (
                        <>
                            <div className="mb-4 flex w-full flex-row flex-wrap items-center justify-center gap-2">
                                {uniqueDates.map((dateStr) => (
                                    <button
                                        key={dateStr}
                                        className={`rounded-lg px-6 py-5 text-center font-['Unbounded'] text-2xl font-semibold text-white mix-blend-color-dodge ${selectedDate === dateStr ? 'bg-zinc-300/70 ring-2 ring-zinc-500' : 'bg-zinc-300/30'}`}
                                        onClick={() => setSelectedDate(dateStr)}
                                    >
                                        {formatDateMMDD(dateStr)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex w-full flex-row flex-wrap items-start justify-center gap-4">
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((schedule) => (
                                        <button
                                            key={schedule._id}
                                            className={`w-[23%] rounded-xl px-5 py-1 text-white mix-blend-color-dodge shadow ${schedule.availableSeatsCount <= 0 ? 'bg-zinc-300/30' : 'cursor-pointer bg-zinc-300/60 hover:bg-zinc-300/80'} flex flex-col items-center transition`}
                                            onClick={() => onScheduleSelect(schedule)}
                                            disabled={schedule.availableSeatsCount <= 0}
                                        >
                                            <div className="font-['Unbounded'] text-2xl font-bold">
                                                {new Date(schedule.startTime).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false,
                                                    timeZone: 'Asia/Ho_Chi_Minh',
                                                })}
                                            </div>
                                            <div className="font-['Unbounded'] text-sm font-normal">{schedule.availableSeatsCount} seats left</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="font-semibold text-gray-500">No showtimes for this date.</div>
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
