import CustomDropdown from '@components/UI/CustomDropdown.jsx';
import { useState, useEffect, useCallback } from 'react';

const EditScheduleModal = ({
    isOpen,
    onClose,
    schedule,
    screens,
    updateSchedule,
    removeSchedule,
    branchId,
    onScheduleSuccess,
    isUpdating = false,
    isDeleting = false,
    movies = [], // Add movies as prop
}) => {
    const [formData, setFormData] = useState({
        movie: '',
        movieId: '',
        date: '',
        screen: '',
        screenId: '',
        startTime: '',
        endTime: '',
    });

    // Utility function to convert date to Vietnam timezone string
    const toVietnamDateString = useCallback((date) => {
        const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
        const vietnamTime = new Date(utcTime + 7 * 3600000); // UTC+7
        // Format manually to avoid UTC conversion
        const year = vietnamTime.getFullYear();
        const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
        const day = String(vietnamTime.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // Utility function to convert any date to Vietnam timezone
    const toVietnamTime = useCallback((date) => {
        const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
        return new Date(utcTime + 7 * 3600000); // UTC+7
    }, []);

    // Utility function to convert Vietnam time to UTC - Consistent across environments
    const vietnamTimeToUTC = useCallback((vietnamTimeString) => {
        // Parse the date string components manually to avoid timezone interpretation issues
        const [datePart, timePart] = vietnamTimeString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);

        // Create a date object explicitly in Vietnam timezone (UTC+7)
        // We create it as if it's UTC first, then subtract 7 hours to get the actual UTC time
        const vietnamDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

        // Now subtract 7 hours to convert from Vietnam time to UTC
        return new Date(vietnamDate.getTime() - 7 * 3600000);
    }, []);

    // Calculate end time based on movie duration
    const calculateEndTime = useCallback((startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return '';

        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

        return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen && schedule) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scroll

            // Find screen name and ID
            let screenName = '';
            let screenId = '';
            if (schedule.screen) {
                const foundScreen = screens.find(
                    (s) => s._id === schedule.screen._id || s._id === schedule.screen.id || s.screenName === schedule.screen.screenName || s.screenName === schedule.screen.name,
                );
                if (foundScreen) {
                    screenName = foundScreen.screenName;
                    screenId = foundScreen._id;
                } else {
                    screenName = schedule.screen.screenName || schedule.screen.name || '';
                    screenId = schedule.screen._id || schedule.screen.id || '';
                }
            }

            // Extract date and time from schedule - convert to Vietnam timezone
            const startDateTime = new Date(schedule.startTime);
            const endDateTime = new Date(schedule.endTime);

            // Convert to Vietnam timezone for display
            const vietnamStartTime = toVietnamTime(startDateTime);
            const vietnamEndTime = toVietnamTime(endDateTime);

            setFormData({
                movie: schedule.movie?.title || '',
                movieId: schedule.movie?._id || '',
                date: toVietnamDateString(startDateTime), // Use Vietnam timezone date
                screen: screenName,
                screenId: screenId,
                startTime: vietnamStartTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                endTime: vietnamEndTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            });
        } else {
            // Reset overflow when popup closes
            document.body.style.overflow = '';
        }

        // Cleanup function to ensure overflow is reset
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = ''; // Reset overflow on unmount
        };
    }, [isOpen, schedule, screens, toVietnamDateString, toVietnamTime]);

    // Update end time when movie or start time changes
    useEffect(() => {
        if (formData.movieId && formData.startTime) {
            const selectedMovie = movies.find((movie) => movie._id === formData.movieId);
            if (selectedMovie && selectedMovie.duration) {
                const endTime = calculateEndTime(formData.startTime, selectedMovie.duration);
                setFormData((prev) => ({
                    ...prev,
                    endTime,
                }));
            }
        }
    }, [formData.movieId, formData.startTime, movies, calculateEndTime]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isUpdating && !isDeleting) {
            onClose();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMovieChange = (e) => {
        const { value } = e.target;
        const selectedMovie = movies.find((movie) => movie._id === value);
        setFormData((prev) => ({
            ...prev,
            movie: selectedMovie ? selectedMovie.title : '',
            movieId: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert Vietnam time back to UTC for database storage
        const vietnamTimeString = `${formData.date}T${formData.startTime}`;
        const utcDateTime = vietnamTimeToUTC(vietnamTimeString);

        // Prepare schedule data for API
        const scheduleData = {
            id: schedule._id,
            movieId: formData.movieId,
            screenId: formData.screenId,
            startTime: utcDateTime.toISOString(),
        };

        if (!branchId) {
            alert('Branch ID not found.');
            return;
        }

        try {
            const result = await updateSchedule(branchId, scheduleData);
            if (result.success) {
                setTimeout(() => {
                    onClose();
                    if (onScheduleSuccess) onScheduleSuccess();
                }, 500); // 500ms delay
            } else {
                alert(result.error || 'Failed to update schedule');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update schedule');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        if (!branchId || !schedule?._id) {
            alert('Missing branch ID or schedule ID.');
            return;
        }

        try {
            const result = await removeSchedule(branchId, schedule._id);
            if (result.success) {
                setTimeout(() => {
                    onClose();
                    if (onScheduleSuccess) onScheduleSuccess();
                }, 500); // 500ms delay
            } else {
                alert(result.error || 'Failed to delete schedule');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Failed to delete schedule');
        }
    };

    const handleCancel = () => {
        onClose();
    };

    // Prepare movie options for dropdown
    const movieOptions = movies.map((movie) => ({
        value: movie._id,
        label: `${movie.title} (${movie.duration}min)`,
    }));

    // Prepare screen options for dropdown
    const screenOptions = screens.map((screen, index) => ({
        value: screen.screenName,
        label: `${screen.screenName} (${screen.screenType})`,
    }));

    const handleScreenChange = (e) => {
        const { value } = e.target;
        const selectedScreen = screens.find((screen) => screen.screenName === value);
        setFormData((prev) => ({
            ...prev,
            screen: value, // display the screen name
            screenId: selectedScreen ? selectedScreen._id : '', // save id for API
        }));
    };

    if (!isOpen || !schedule) return null;

    return (
        <div className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-10000 flex h-full w-full items-center justify-center bg-slate-900/10 backdrop-blur-[20px]`} onClick={handleBackdropClick}>
            {/* Loading Overlay */}
            {(isUpdating || isDeleting) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                    <div className="flex items-center gap-3 rounded-lg bg-white p-6">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600"></div>
                        <span className="text-lg font-semibold text-gray-800">{isDeleting ? 'Deleting Schedule...' : 'Updating Schedule...'}</span>
                    </div>
                </div>
            )}

            <div className="relative flex h-auto w-auto flex-col items-center justify-center rounded-xl shadow-xl">
                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isUpdating && !isDeleting) onClose();
                    }}
                    disabled={isUpdating || isDeleting}
                    className={`absolute -top-12 -right-2 z-100 aspect-square h-auto rounded-full px-4 font-['Unbounded'] text-4xl font-bold text-white hover:bg-white/40 md:-top-15 lg:-right-12 ${isUpdating || isDeleting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    ×
                </button>

                {/* Modal Content */}
                <div className="relative h-auto w-auto">
                    <div className="h-auto w-auto rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)]" />
                    <div className="absolute -z-1 h-full w-full rounded-xl bg-slate-950/90" />
                    <form onSubmit={handleSubmit} className="inset-0 flex flex-col justify-between p-17">
                        {/* Form Fields */}
                        <div className="flex h-auto w-[525px] flex-col items-start justify-start gap-3.5">
                            {/* Movie Field */}
                            <div className="flex w-[529px] flex-col items-start justify-start gap-1">
                                <div className="w-36 justify-start font-['Libre_Franklin'] text-xl font-normal text-white">Movie</div>
                                <CustomDropdown
                                    value={formData.movie}
                                    onChange={handleMovieChange}
                                    name="movieId"
                                    bgColor=" bg-indigo-900/30 backdrop-blur-xl"
                                    inputBgColor="zinc-300"
                                    hoverColor="white"
                                    borderColor="white"
                                    textColor="black"
                                    dropdownTextColor="white"
                                    height="h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14"
                                    inputTextSize="text-md"
                                    optionTextSize="text-sm"
                                    openDirection={'down'}
                                    allowOtherInput={true}
                                    textAlign="left"
                                    options={movieOptions}
                                    disabled={!movies.length}
                                />
                            </div>

                            {/* Date and Screen Row */}
                            <div className="inline-flex items-start justify-start gap-3.5">
                                <div className="flex h-auto w-64 flex-col justify-start gap-1 rounded-xl">
                                    <div className="w-60 justify-start font-['Libre_Franklin'] text-xl font-normal text-white">Date</div>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="bg-opacity-70 focus:bg-opacity-90 h-10 w-full rounded-lg bg-zinc-300 px-3 font-['Unbounded'] text-sm text-black focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 sm:text-base md:h-12 md:text-lg lg:h-13 xl:h-14"
                                        required
                                    />
                                </div>
                                <div className="flex h-auto w-64 flex-col justify-start gap-1 rounded-xl">
                                    <div className="w-36 justify-start font-['Libre_Franklin'] text-xl font-normal text-white">Screen</div>
                                    <CustomDropdown
                                        value={formData.screen}
                                        onChange={handleScreenChange}
                                        name="screen"
                                        bgColor=" bg-indigo-900/30 backdrop-blur-xl"
                                        inputBgColor="zinc-300"
                                        hoverColor="white"
                                        borderColor="white"
                                        textColor="black"
                                        dropdownTextColor="white"
                                        height="h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14"
                                        inputTextSize="text-md"
                                        optionTextSize="text-sm"
                                        openDirection={'down'}
                                        allowOtherInput={false}
                                        textAlign="left"
                                        options={screenOptions}
                                        disabled={false}
                                    />
                                </div>
                            </div>

                            {/* Start Time Field */}
                            <div className="flex h-auto w-[525px] flex-col justify-start gap-1 rounded-xl">
                                <div className="justify-start font-['Libre_Franklin'] text-xl font-normal text-white">Start Time</div>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="bg-opacity-70 focus:bg-opacity-90 h-10 w-full rounded-lg bg-zinc-300 px-3 font-['Unbounded'] text-sm text-black focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 sm:text-base md:h-12 md:text-lg lg:h-13 xl:h-14"
                                    required
                                />
                            </div>

                            {/* End Time Field (Auto-calculated) */}
                            <div className="flex h-auto w-[525px] flex-col justify-start gap-1 rounded-xl">
                                <div className="justify-start font-['Libre_Franklin'] text-xl font-normal text-white">End Time</div>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    className="bg-opacity-70 focus:bg-opacity-90 h-10 w-full rounded-lg bg-zinc-300 px-3 font-['Unbounded'] text-sm text-black focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 sm:text-base md:h-12 md:text-lg lg:h-13 xl:h-14"
                                    readOnly
                                />
                            </div>

                            <div className="h-3.5 w-20 bg-zinc-300/0" />
                        </div>

                        {/* Action Buttons */}
                        <div className="inline-flex h-9 items-center justify-center gap-3.5">
                            <button type="button" onClick={handleCancel} className="relative flex h-10 w-36 cursor-pointer items-center justify-center" disabled={isDeleting || isUpdating}>
                                <div
                                    className={`absolute top-0 left-0 z-1 h-full w-full rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${isDeleting || isUpdating ? 'bg-gray-600' : 'bg-slate-900'}`}
                                />
                                <div className="z-2 text-center font-['Unbounded'] text-lg font-bold text-white">CANCEL</div>
                            </button>

                            <button type="button" onClick={handleDelete} className="relative flex h-10 w-36 cursor-pointer items-center justify-center" disabled={isDeleting || isUpdating}>
                                <div
                                    className={`absolute top-0 left-0 z-1 h-full w-full rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${isDeleting || isUpdating ? 'bg-gray-500' : 'bg-red-600'}`}
                                />
                                <div className="z-2 text-center font-['Unbounded'] text-lg font-bold text-white">{isDeleting ? '• • •' : 'DELETE'}</div>
                            </button>
                            <button
                                type="submit"
                                className="relative flex h-10 w-36 cursor-pointer items-center justify-center"
                                disabled={!formData.movieId || !movies.length || isUpdating || isDeleting}
                            >
                                <div
                                    className={`absolute top-0 left-0 z-1 h-full w-full rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${!formData.movieId || !movies.length || isUpdating || isDeleting ? 'bg-gray-500' : 'bg-pink-400'}`}
                                />
                                <div className="z-2 text-center font-['Unbounded'] text-lg font-bold text-white">{isUpdating ? '• • •' : !movies.length ? '• • •' : 'UPDATE'}</div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditScheduleModal;
