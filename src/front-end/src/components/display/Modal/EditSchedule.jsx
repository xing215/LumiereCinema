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
    movies = [] // Add movies as prop
}) => {
    const [formData, setFormData] = useState({
        movie: '',
        movieId: '',
        date: '',
        screen: '',
        screenId: '',
        startTime: '',
        endTime: ''
    });

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
                const foundScreen = screens.find(s => 
                    s._id === schedule.screen._id || 
                    s._id === schedule.screen.id ||
                    s.screenName === schedule.screen.screenName ||
                    s.screenName === schedule.screen.name
                );
                if (foundScreen) {
                    screenName = foundScreen.screenName;
                    screenId = foundScreen._id;
                } else {
                    screenName = schedule.screen.screenName || schedule.screen.name || '';
                    screenId = schedule.screen._id || schedule.screen.id || '';
                }
            }

            // Extract date and time from schedule
            const startDateTime = new Date(schedule.startTime);
            const endDateTime = new Date(schedule.endTime);
            
            setFormData({
                movie: schedule.movie?.title || '',
                movieId: schedule.movie?._id || '',
                date: startDateTime.toISOString().split('T')[0],
                screen: screenName,
                screenId: screenId,
                startTime: startDateTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                endTime: endDateTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
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
    }, [isOpen, schedule, screens]);

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
        if (e.target === e.currentTarget && !isUpdating && !isDeleting) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare schedule data for API
        const scheduleData = {
            id: schedule._id,
            movieId: formData.movieId,
            screenId: formData.screenId,
            startTime: `${formData.date}T${formData.startTime}`,
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

    if (!isOpen || !schedule) return null;

    return (
        <div 
            className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-10000 flex items-center justify-center w-full h-full bg-slate-900/10 backdrop-blur-[20px]`}
            onClick={handleBackdropClick}
        >
            {/* Loading Overlay */}
            {(isUpdating || isDeleting) && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                    <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="text-lg font-semibold text-gray-800">
                            {isDeleting ? 'Deleting Schedule...' : 'Updating Schedule...'}
                        </span>
                    </div>
                </div>
            )}
            
            <div className="relative w-auto h-auto rounded-xl shadow-xl flex flex-col items-center justify-center">
                {/* Close button */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        if (!isUpdating && !isDeleting) onClose();
                    }}
                    disabled={isUpdating || isDeleting}
                    className={`absolute -top-12 -right-2 md:-top-15 lg:-right-12 z-100 text-white font-['Unbounded'] text-4xl font-bold hover:bg-white/40 rounded-full h-auto px-4 aspect-square ${(isUpdating || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                            {/* Start Time Field */}
                            <div className="w-[525px] h-auto rounded-xl flex flex-col gap-1 justify-start">
                                <div className="justify-start text-white text-xl font-normal font-['Libre_Franklin']">Start Time</div>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="bg-opacity-70 h-10 disabled:bg-zinc-300/5 disabled:text-white disabled:ring-1 disabled:ring-amber-50 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg"
                                    required
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
                                className="w-36 h-10 cursor-pointer relative items-center flex justify-center"
                                disabled={isDeleting || isUpdating}
                            >
                                <div className={`w-full h-full z-1 left-0 top-0 absolute rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${isDeleting || isUpdating ? 'bg-gray-600' : 'bg-slate-900'}`} />
                                <div className="z-2 text-center text-white text-lg font-bold font-['Unbounded']">CANCEL</div>
                            </button>
                            
                           <button
                                type="button"
                                onClick={handleDelete}
                                className="w-36 h-10 cursor-pointer relative items-center flex justify-center"
                                disabled={isDeleting || isUpdating}
                            >
                                <div className={`w-full h-full z-1 left-0 top-0 absolute rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${isDeleting || isUpdating ? 'bg-gray-500' : 'bg-red-600'}`} />
                                <div className="z-2 text-center text-white text-lg font-bold font-['Unbounded']">
                                    {isDeleting ? '• • •' : 'DELETE'}
                                </div>
                            </button>
                            <button
                                type="submit"
                                className="w-36 h-10 relative  cursor-pointer items-center flex justify-center"
                                disabled={!formData.movieId || !movies.length || isUpdating || isDeleting}
                            >
                                <div className={`w-full h-full z-1 left-0 top-0 absolute rounded-2xl shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)] ${!formData.movieId || !movies.length || isUpdating || isDeleting ? 'bg-gray-500' : 'bg-pink-400'}`} />
                                <div className="z-2 text-center text-white text-lg font-bold font-['Unbounded']">
                                    {isUpdating ? '• • •' : (!movies.length ? '• • •' : 'UPDATE')}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditScheduleModal;
