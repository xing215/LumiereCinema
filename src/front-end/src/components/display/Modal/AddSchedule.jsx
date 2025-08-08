// Removed useUpdateSchedule, will use scheduleMovieScreening from props
import CustomDropdown from '@components/UI/CustomDropdown.jsx'; 
import { useState, useEffect, useCallback } from 'react';
import { useUpdateSchedule } from '@hooks/useBranch';

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
    movies = [] // Add movies as prop
}) => {
    // scheduleMovieScreening will be passed as a prop
    const [formData, setFormData] = useState({
        movie: '',
        movieId: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        screen: selectedScreen || '', // screen number for display
        screenId: '', // will be set in useEffect
        startTime: selectedTime || '',
        endTime: ''
    });

    // Utility function to convert date to Vietnam timezone string
    const toVietnamDateString = useCallback((date) => {
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        const vietnamTime = new Date(utcTime + (7 * 3600000)); // UTC+7
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
        return new Date(vietnamDate.getTime() - (7 * 3600000));
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
                const screenByName = screens.find(screen => screen.screenName === initialScreen);
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
                endTime: ''
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
            const selectedMovie = movies.find(movie => movie._id === formData.movieId);
            if (selectedMovie && selectedMovie.duration) {
                const endTime = calculateEndTime(formData.startTime, selectedMovie.duration);
                setFormData(prev => ({
                    ...prev,
                    endTime
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMovieChange = (e) => {
        const { value } = e.target;
        const selectedMovie = movies.find(movie => movie._id === value);
        setFormData(prev => ({
            ...prev,
            movie: selectedMovie ? selectedMovie.title : '',
            movieId: value
        }));

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
            alert('Branch ID not found.');
            return;
        }
        scheduleMovieScreening(branchId, screeningData).then(result => {
            if (result.success) {
                if (fetchSchedule) fetchSchedule;
 // Call success callback
                // Add a small delay before closing modal to show loading
                setTimeout(() => {
                    onClose();
                    if (onScheduleSuccess) onScheduleSuccess();
                }, 500); // 500ms delay
            } else {
                alert(result.error || 'Failed to add schedule');
            }
        });
    };

    const handleCancel = () => {
        onClose();
    };

    // Prepare movie options for dropdown
    const movieOptions = movies.map(movie => ({
        value: movie._id,
        label: `${movie.title} (${movie.duration}min)`
    }));

    // Prepare screen options for dropdown
    const screenOptions = screens.map((screen, index) => ({
        value: screen.screenName,
        label: `${screen.screenName} (${screen.screenType})`
    }));

    const handleScreenChange = (e) => {
        const { value } = e.target;
        const selectedScreen = screens.find(screen => screen.screenName === value);
        setFormData(prev => ({
            ...prev,
            screen: value, // display the screen name
            screenId: selectedScreen ? selectedScreen._id : '' // save id for API
        }));
    };
    

    return (
        <div 
            className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-10000 flex items-center justify-center w-full h-full bg-slate-900/10 backdrop-blur-[20px]`}
            onClick={handleBackdropClick}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                    <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="text-lg font-semibold text-gray-800">Adding Schedule...</span>
                    </div>
                </div>
            )}
            
            <div className="relative w-auto h-auto rounded-xl shadow-xl flex flex-col items-center justify-center">
                {/* Close button */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        if (!isLoading) onClose();
                    }}
                    disabled={isLoading}
                    className={`absolute -top-12 -right-2 md:-top-15 lg:-right-12 z-100 text-white font-['Unbounded'] text-4xl font-bold hover:bg-white/40 rounded-full h-auto px-4 aspect-square ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    ×
                </button>
                
                {/* Modal Content */}
                <div className="w-auto h-auto relative">
                    <div className="w-auto h-auto rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)]" />
                    <div className='absolute -z-1 bg-slate-950/90 w-full h-full rounded-xl' />
                    <form onSubmit={handleSubmit} className=" inset-0 p-17 flex flex-col justify-between">
                        {/* Form Fields */}
                        <div className="w-[525px] h-auto flex flex-col justify-start items-start gap-3.5">
                            {/* Movie Field */}
                            <div className="w-[529px] flex flex-col justify-start items-start gap-1">
                                     <div className="w-36 justify-start text-white text-xl font-normal font-['Libre_Franklin']">Movie</div>
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
                            <div className="inline-flex justify-start items-start gap-3.5">
                                <div className="w-64 h-auto rounded-xl flex flex-col gap-1 justify-start">
                                    <div className="w-60 justify-start text-white text-xl font-normal font-['Libre_Franklin']">Date</div>

                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="bg-opacity-70 h-10 disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg"
                                        required
                                    />
                                </div>
                                <div className="w-64 h-auto rounded-xl flex flex-col gap-1 justify-start">
                                    <div className="w-36 justify-start text-white text-xl font-normal font-['Libre_Franklin']">Screen</div>
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
                            <div className="w-[525px] h-auto rounded-xl flex flex-col gap-1 justify-start">
                            <div className="justify-start text-white text-xl font-normal font-['Libre_Franklin']">Start Time</div>

                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="bg-opacity-70 h-10 disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg"
                                />
                            </div>
                            
                            {/* End Time Field (Auto-calculated) */}
                            <div className="w-[525px] h-auto rounded-xl flex flex-col gap-1 justify-start">
                                <div className="justify-start text-white text-xl font-normal font-['Libre_Franklin']">End Time</div>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    className="bg-opacity-70 h-10 disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg"
                                    readOnly
                                />
                            </div>
                            
                            <div className="w-20 h-3.5 bg-zinc-300/0" />
                        </div>

                        {/* Action Buttons */}
                        <div className="h-9 inline-flex justify-center items-center gap-3.5">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-48 h-10 relative"
                            >
                                <div className="w-48 h-10 left-0 top-0 absolute bg-slate-900 rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
                                <div className="w-40 h-5 left-[14.42px] top-[8.91px] absolute text-center justify-start text-white text-lg font-bold font-['Unbounded']">CANCEL</div>
                            </button>
                            <button
                                type="submit"
                                className="w-48 h-10 relative"
                                disabled={!formData.movieId || !movies.length || isLoading}
                            >
                                <div className={`w-48 h-10 left-0 top-0 absolute rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${!formData.movieId || !movies.length || isLoading ? 'bg-gray-500' : 'bg-pink-400'}`} />
                                <div className="w-40 h-5 left-[14.42px] top-[8.91px] absolute text-center justify-start text-white text-lg font-bold font-['Unbounded']">
                                    {isLoading ? '• • •' : (!movies.length ? '• • •' : 'CONFIRM')}
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