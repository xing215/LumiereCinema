import { useState, useEffect } from 'react';
import ManageTable from '@components/UI/ManageTable';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton';
import CancelButton from '@components/buttons/Staff/CancelButton';

const ScheduleUploadModal = ({
    isOpen,
    onClose,
    uploadedData = [],
    onConfirm,
    isLoading = false,
    screens = [],
    movies = [],
    existingSchedules = [], // Add existing schedules for overlap checking
}) => {
    const [tickedRows, setTickedRows] = useState(new Set());
    const [processedData, setProcessedData] = useState([]);

    // Helper function to get date in Vietnam timezone (UTC+7)
    const getVietnamDateString = (date) => {
        const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
        const vietnamTime = new Date(utcTime + 7 * 3600000); // UTC+7
        return vietnamTime.toISOString().split('T')[0];
    };

    // Helper function to add minutes to time string
    const addMinutesToTime = (timeString, minutesToAdd) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + minutesToAdd;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    };

    // Helper function to check if two time ranges overlap
    const checkTimeOverlap = (start1, end1, start2, end2, date1, date2) => {
        // Only check overlap if on the same date
        if (date1 !== date2) return false;

        const parseTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const start1Minutes = parseTime(start1);
        const end1Minutes = parseTime(end1);
        const start2Minutes = parseTime(start2);
        const end2Minutes = parseTime(end2);

        // Check if ranges overlap
        return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
    };

    // Process and validate uploaded data
    useEffect(() => {
        if (uploadedData.length > 0) {
            const processed = uploadedData.map((row, index) => {
                const errors = [];
                let calculatedEndTime = row.endTime;

                // Find the movie to get duration and validate existence
                let foundMovie = null;
                if (row.movieName && row.movieName.trim() !== '') {
                    foundMovie = movies.find((movie) => movie.title.toLowerCase() === row.movieName.toLowerCase());

                    if (!foundMovie) {
                        errors.push(`Movie "${row.movieName}" not found`);
                    } else {
                        // Auto-calculate end time if not provided or if start time is valid
                        if (row.startTime && row.startTime.trim() !== '') {
                            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                            if (timeRegex.test(row.startTime)) {
                                const movieDuration = foundMovie.duration || 120; // Default 2 hours if no duration
                                calculatedEndTime = addMinutesToTime(row.startTime, movieDuration);
                            }
                        }
                    }
                } else {
                    errors.push('Movie name is required');
                }

                // Validate screen name
                if (!row?.screenName) {
                    errors.push('Screen name is required');
                } else {
                    const screenExists = screens.some((screen) => screen.screenName.toString() === row.screenName.toString());
                    if (!screenExists) {
                        errors.push(`Screen "${row.screenName}" not found`);
                    }
                }

                // Validate date
                if (!row.date || row.date.trim() === '') {
                    errors.push('Date is required');
                } else {
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(row.date)) {
                        errors.push('Date must be in YYYY-MM-DD format');
                    } else {
                        const date = new Date(row.date);
                        if (isNaN(date.getTime())) {
                            errors.push('Invalid date');
                        }
                    }
                }

                // Validate start time
                if (!row.startTime || row.startTime.trim() === '') {
                    errors.push('Start time is required');
                } else {
                    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(row.startTime)) {
                        errors.push('Start time must be in HH:MM format');
                    }
                }

                // Check for overlaps with existing schedules
                if (row.startTime && calculatedEndTime && row.date && row.screenName && errors.length === 0) {
                    // Check against existing schedules
                    for (const existingSchedule of existingSchedules) {
                        const existingDate = getVietnamDateString(new Date(existingSchedule.startTime));
                        const existingStartTime = new Date(existingSchedule.startTime).toTimeString().slice(0, 5);
                        const existingEndTime = new Date(existingSchedule.endTime).toTimeString().slice(0, 5);
                        const existingScreenName = existingSchedule.screen?.screenName?.toString();

                        if (existingScreenName === row.screenName.toString() && checkTimeOverlap(row.startTime, calculatedEndTime, existingStartTime, existingEndTime, row.date, existingDate)) {
                            errors.push(`Overlaps with existing schedule: ${existingSchedule.movie?.title} (${existingStartTime}-${existingEndTime})`);
                            break;
                        }
                    }

                    // Check against other rows in the upload batch
                    for (let i = 0; i < uploadedData.length; i++) {
                        if (i === index) continue; // Skip self

                        const otherRow = uploadedData[i];
                        if (otherRow.screenName?.toString() === row.screenName.toString() && otherRow.date === row.date && otherRow.startTime && otherRow.startTime.trim() !== '') {
                            let otherEndTime = otherRow.endTime;
                            // Calculate other row's end time if needed
                            const otherMovie = movies.find((movie) => movie.title.toLowerCase() === otherRow.movieName?.toLowerCase());
                            if (otherMovie && otherRow.startTime) {
                                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                                if (timeRegex.test(otherRow.startTime)) {
                                    const movieDuration = otherMovie.duration || 120;
                                    otherEndTime = addMinutesToTime(otherRow.startTime, movieDuration);
                                }
                            }

                            if (otherEndTime && checkTimeOverlap(row.startTime, calculatedEndTime, otherRow.startTime, otherEndTime, row.date, otherRow.date)) {
                                errors.push(`Overlaps with row ${i + 1}: ${otherRow.movieName} (${otherRow.startTime}-${otherEndTime})`);
                                break;
                            }
                        }
                    }
                }

                return {
                    id: index,
                    movieName: row.movieName || '',
                    screenName: row.screenName || '',
                    date: row.date || '',
                    startTime: row.startTime || '',
                    endTime: calculatedEndTime || '', // Use calculated end time
                    status: errors.length === 0 ? 'Valid' : 'Invalid',
                    errors: errors.join(', '),
                    isValid: errors.length === 0,
                };
            });

            setProcessedData(processed);
            // Auto-select invalid rows for review/correction
            const invalidRowIds = new Set(processed.filter((row) => !row.isValid).map((row) => row.id));
            setTickedRows(invalidRowIds);
        }
    }, [uploadedData, screens, movies, existingSchedules]);

    // Convert object data to array format for ManageTable
    const getTableData = () => {
        return processedData.map((row) => [
            'TickButton', // Column 0: checkbox
            row.movieName,
            row.screenName,
            row.date,
            row.startTime,
            row.endTime,
            // Status indicator with styling
            {
                type: 'StatusIndicator',
                isValid: row.isValid,
                status: row.status,
                errors: row.errors,
            },
        ]);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const handleConfirm = () => {
        // Import valid rows that are NOT selected (unselected = keep, selected = exclude)
        const selectedData = processedData
            .filter((row) => !tickedRows.has(row.id) && row.isValid)
            .map((row) => ({
                movieName: row.movieName,
                screenName: row.screenName,
                date: row.date,
                startTime: row.startTime,
                endTime: row.endTime, // Include the calculated endTime from processedData
            }));
        onConfirm(selectedData);
    };

    const handleCancel = () => {
        if (!isLoading) {
            onClose();
        }
    };

    // Table configuration
    const header = [
        '', // Checkbox column
        'Movie',
        'Screen',
        'Date',
        'Start Time',
        'End Time',
        'Status',
    ];

    // Column configuration for ManageTable (width percentages)
    const columnConfig = [
        { width: 'w-12', truncate: false }, // Checkbox
        { width: 'w-80', truncate: true }, // Movie name
        { width: 'w-20', truncate: false }, // Screen
        { width: 'w-38', truncate: false }, // Date
        { width: 'w-30', truncate: false }, // Start time
        { width: 'w-30', truncate: false }, // End time
        { width: 'w-40', truncate: false }, // Status
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex h-full w-full items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={handleBackdropClick}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/30">
                    <div className="flex items-center gap-3 rounded-lg bg-white p-6">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600"></div>
                        <span className="text-lg font-semibold text-gray-800">Importing Schedules...</span>
                    </div>
                </div>
            )}

            <div className="relative flex h-[80%] w-[90%] max-w-7xl flex-col rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6">
                    <h2 className="font-['Unbounded'] text-2xl font-bold text-gray-800">Import Schedule Data</h2>
                    <button onClick={handleCancel} disabled={isLoading} className={`text-2xl font-bold text-gray-500 hover:text-gray-700 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-start gap-2 overflow-hidden">
                    <div className="">
                        <p className="font-libre-franklin mt-1 pl-6 text-sm text-black">
                            Total rows: {processedData.length} | Valid: {processedData.filter((row) => row.isValid).length} | Invalid: {processedData.filter((row) => !row.isValid).length} | To Import:{' '}
                            {processedData.filter((row) => !tickedRows.has(row.id) && row.isValid).length}
                        </p>
                    </div>
                </div>
                <div className="absolute -top-10 h-full w-full flex-1 overflow-hidden">
                    <ManageTable
                        data={getTableData()}
                        anyTicked={tickedRows}
                        setTickedRows={setTickedRows}
                        header={header}
                        columnConfig={columnConfig}
                        editableFields={[]} // No inline editing for import preview
                        editingCell={null}
                        onStartEdit={() => {}}
                        onSaveEdit={() => {}}
                        onCancelEdit={() => {}}
                        isUpdating={false}
                        fieldTypes={{}}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 border-t border-gray-200 p-6">
                    <CancelButton onClick={handleCancel} disabled={isLoading} />
                    <ConfirmButton onClick={handleConfirm} disabled={isLoading || processedData.filter((row) => !tickedRows.has(row.id) && row.isValid).length === 0} />
                </div>
            </div>
        </div>
    );
};

export default ScheduleUploadModal;
