// Removed useUpdateSchedule, will use scheduleMovieScreening from props
import CustomDropdown from '@components/UI/CustomDropdown.jsx';
import { useState, useEffect, useCallback } from 'react';
import { useUpdateSchedule } from '@hooks/useBranch';
import { showError, showSuccess } from '@utils/sweetalert.js';

const AddScheduleModal = ({
    isOpen,
    onClose,
    selectedTime,
    selectedScreen,
    selectedDate,
    screens,
    scheduleMovieScreening,
    branchId,
    fetchSchedule,
    onScheduleSuccess,
    isLoading = false,
    movies = [], // Add movies as prop
}) => {
    // scheduleMovieScreening will be passed as a prop
    const [formData, setFormData] = useState({
        movie: '',
        movieId: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        screen: selectedScreen || '', // screen number for display
        screenId: '', // will be set in useEffect
        startTime: selectedTime || '',
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

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            let initialScreen = selectedScreen || '';
            let initialScreenId = '';

            // Handle selectedScreen which might be a screen name already
            if (initialScreen && screens.length > 0) {
                // Check if selectedScreen is already a screen name
                const screenByName = screens.find((screen) => screen.screenName === initialScreen);
                if (screenByName) {
                    // selectedScreen is already a screen name
                    initialScreenId = screenByName._id;
                } else {
                    // selectedScreen might be a number (for backward compatibility)
                    const screenIndex = parseInt(initialScreen, 10) - 1;
                    const screenObj = screens[screenIndex];
                    if (screenObj) {
                        initialScreen = screenObj.screenName;
                        initialScreenId = screenObj._id;
                    }
                }
            }

            setFormData({
                movie: '',
                movieId: '',
                date: selectedDate ? toVietnamDateString(selectedDate) : '',
                screen: initialScreen,
                screenId: initialScreenId,
                startTime: selectedTime || '',
                endTime: '',
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
    }, [isOpen, selectedDate, selectedScreen, selectedTime, screens, toVietnamDateString]);

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
        if (e.target === e.currentTarget && !isLoading) {
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
        
        // Check if the value is a movie ID from dropdown selection
        const selectedMovieById = movies.find((movie) => movie._id === value);
        if (selectedMovieById) {
            // User selected from dropdown - value is movie ID
            setFormData((prev) => ({
                ...prev,
                movie: selectedMovieById.title,
                movieId: selectedMovieById._id,
            }));
        } else {
            // User is typing text - always update the movie field
            // Try to find exact match by title
            const selectedMovieByTitle = movies.find((movie) => 
                movie.title.toLowerCase() === value.toLowerCase()
            );
            
            setFormData((prev) => ({
                ...prev,
                movie: value, // Keep the typed value
                movieId: selectedMovieByTitle ? selectedMovieByTitle._id : '', // Set ID if exact match found
            }));
        }
    };

    const handleMovieFocus = (e) => {
        // When user focuses on the input and there's already a value, select all text
        // This allows them to easily replace the entire value
        if (formData.movie && formData.movieId) {
            e.target.select();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert Vietnam time back to UTC for database storage
        const vietnamTimeString = `${formData.date}T${formData.startTime}`;
        const utcDateTime = vietnamTimeToUTC(vietnamTimeString);

        // Prepare screening data for API
        const screeningData = {
            movieId: formData.movieId,
            screenId: formData.screenId,
            startTime: utcDateTime.toISOString(),
        };
        // Find branchId from screens (assume all screens belong to same branch)
        if (!branchId) {
            showError('Error', 'Branch ID not found. Please try again.');
            return;
        }
        scheduleMovieScreening(branchId, screeningData).then((result) => {
            if (result.success) {
                if (fetchSchedule) fetchSchedule;
                // Close modal first, then show success message
                onClose();
                setTimeout(() => {
                    showSuccess('Schedule Added!', `${formData.movie} has been scheduled successfully for ${formData.screen} at ${formData.startTime}`);
                    if (onScheduleSuccess) onScheduleSuccess();
                }, 300); // Small delay to ensure modal closes first
            } else {
                // Close modal first, then show error message
                onClose();
                setTimeout(() => {
                    showError('Failed to Add Schedule', result.error || 'An error occurred while adding the schedule. Please try again.');
                }, 300); // Small delay to ensure modal closes first
            }
        });
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

    return (
        <div className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-10000 flex h-full w-full items-center justify-center bg-slate-900/10 backdrop-blur-[20px]`} onClick={handleBackdropClick}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                    <div className="flex items-center gap-3 rounded-lg bg-white p-6">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600"></div>
                        <span className="text-lg font-semibold text-gray-800">Adding Schedule...</span>
                    </div>
                </div>
            )}

            <div className="relative flex h-auto w-auto flex-col items-center justify-center rounded-xl shadow-xl">
                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoading) onClose();
                    }}
                    disabled={isLoading}
                    className={`absolute -top-12 -right-2 z-100 aspect-square h-auto rounded-full px-4 font-['Unbounded'] text-4xl font-bold text-white hover:bg-white/40 md:-top-15 lg:-right-12 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
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
                                    onFocus={handleMovieFocus}
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

                            {/* Start Time Field (Read-only, showing clicked time) */}
                            <div className="flex h-auto w-[525px] flex-col justify-start gap-1 rounded-xl">
                                <div className="justify-start font-['Libre_Franklin'] text-xl font-normal text-white">Start Time</div>

                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="bg-opacity-70 focus:bg-opacity-90 h-10 w-full rounded-lg bg-zinc-300 px-3 font-['Unbounded'] text-sm text-black focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 sm:h-11 sm:px-4 sm:text-base md:h-12 md:text-lg lg:h-13 xl:h-14"
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
                            <button type="button" onClick={handleCancel} className="relative h-10 w-48">
                                <div className="absolute top-0 left-0 h-10 w-48 rounded-2xl bg-slate-900 shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
                                <div className="absolute top-[8.91px] left-[14.42px] h-5 w-40 justify-start text-center font-['Unbounded'] text-lg font-bold text-white">CANCEL</div>
                            </button>
                            <button type="submit" className="relative h-10 w-48" disabled={!formData.movieId || !movies.length || isLoading}>
                                <div
                                    className={`absolute top-0 left-0 h-10 w-48 rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${!formData.movieId || !movies.length || isLoading ? 'bg-gray-500' : 'bg-pink-400'}`}
                                />
                                <div className="absolute top-[8.91px] left-[14.42px] h-5 w-40 justify-start text-center font-['Unbounded'] text-lg font-bold text-white">
                                    {isLoading ? '• • •' : !movies.length ? '• • •' : 'CONFIRM'}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddScheduleModal;
