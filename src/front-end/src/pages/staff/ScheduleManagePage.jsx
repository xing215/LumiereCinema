import UploadCSVButton from '@components/buttons/Staff/uploadCsvButton.jsx';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';
import DownloadTemplateButton from '@components/buttons/Staff/DownloadTemplateButton.jsx';
import DateChosenButton from "@components/buttons/Staff/DateChosenButton.jsx";
import AddButton from "@components/buttons/Staff/AddButton.jsx";
import { useEffect, useRef, useCallback, useMemo, useState } from 'react'; 
import { useUser } from '@contexts/UserContext';
import { useGetBranchById, useGetSchedules, useUpdateSchedule, useRemoveSchedule } from '@hooks/useBranch';
import { useScheduleMovieScreening } from '@hooks/useBranch';
import { useGetMovies } from '@hooks/useAdmin';
import AddScheduleModal from '@/components/display/Modal/AddSchedule';
import EditScheduleModal from '@/components/display/Modal/EditSchedule';
import ScheduleUploadModal from '@/components/display/Modal/ScheduleUploadModal';

const Schedule = ({screen = 1, schedules = [], selectedDate, onAddSchedule, onEditSchedule, screens = [], toVietnamTime}) => {
    const scheduleGridRef = useRef(null);

    // Helper function to convert time to position on timeline (allows negative values)
    const getTimePosition = useCallback((timeString, selectedDate) => {
        // Parse the schedule time string and convert to Vietnam timezone
        const scheduleTime = new Date(timeString);
        const vietnamScheduleTime = toVietnamTime(scheduleTime);
        
        
        // Timeline starts at 23:30 the previous day in Vietnam timezone
        const timelineStart = new Date(selectedDate);
        timelineStart.setDate(timelineStart.getDate() - 1);
        timelineStart.setHours(23, 30, 0, 0);
        
        // Convert timeline start to Vietnam timezone for proper comparison
        const vietnamTimelineStart = toVietnamTime(timelineStart);
        

        // Calculate minutes from timeline start using Vietnam timezone
        const timeDiff = vietnamScheduleTime - vietnamTimelineStart;
        const minutes = timeDiff / (1000 * 60);
        
        // Timeline covers 24 hours = 1440 minutes
        const timelineMinutes = 24 * 60;
        
        // Return percentage (can be negative for continuous effect)
        return (minutes / timelineMinutes) * 100;
    }, [toVietnamTime]);
    
    // Helper function to get schedule duration in percentage
    const getScheduleDuration = useCallback((startTime, endTime) => {
        // Convert both times to Vietnam timezone
        const start = toVietnamTime(new Date(startTime));
        const end = toVietnamTime(new Date(endTime));
        
        const durationMs = end - start;
        const durationMinutes = durationMs / (1000 * 60);
        
        // Timeline covers 24 hours = 1440 minutes
        const timelineMinutes = 24 * 60;
        
        // Return percentage width
        return (durationMinutes / timelineMinutes) * 100;
    }, [toVietnamTime]);
    
    // Group schedules by screen index
    const schedulesByScreen = useMemo(() => {
        const grouped = {};
        
        schedules.forEach(schedule => {
            // Find the screen index based on screen ID or screen name
            let screenIndex = 0;
            if (schedule.screen) {
                // Try to find screen index by matching screen ID or name
                const foundScreenIndex = screens.findIndex(s => 
                    s._id === schedule.screen._id || 
                    s._id === schedule.screen.id ||
                    s.screenName === schedule.screen.screenName ||
                    s.screenName === schedule.screen.name
                );
                screenIndex = foundScreenIndex !== -1 ? foundScreenIndex : 0;
            }
            
            if (!grouped[screenIndex]) {
                grouped[screenIndex] = [];
            }
            grouped[screenIndex].push(schedule);
        });
        return grouped;
    }, [schedules, screens]);
    
    const handleScheduleClick = useCallback((event) => {
        if (!scheduleGridRef.current) return;
        
        const rect = scheduleGridRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calculate which time was clicked (24 hours across the width, starting from 23:30 the night before)
        const timelineMinutes = 24 * 60; // 1440 minutes in a day
        const minuteWidth = rect.width / timelineMinutes;
        
        // Minutes since the start of the timeline (23:30 previous day)
        const clickedMinute = Math.floor(x / minuteWidth);
        
        // Create the timeline start time in Vietnam timezone
        const timelineStart = new Date(selectedDate);
        timelineStart.setDate(timelineStart.getDate() - 1);
        timelineStart.setHours(23, 30, 0, 0);
        
        // Add clicked minutes to timeline start to get the actual clicked time
        const clickedTime = new Date(timelineStart.getTime() + (clickedMinute * 60 * 1000));
        
        // Snap to nearest 15-minute interval
        const minutes = clickedTime.getMinutes();
        const snappedMinutes = Math.round(minutes / 15) * 15;
        clickedTime.setMinutes(snappedMinutes, 0, 0);
        
        // Handle minute overflow
        if (clickedTime.getMinutes() >= 60) {
            clickedTime.setMinutes(0);
            clickedTime.setHours(clickedTime.getHours() + 1);
        }
        
        // Format time string
        const clickedHour = clickedTime.getHours();
        const clickedMinuteInHour = clickedTime.getMinutes();
        const timeString = `${clickedHour < 10 ? `0${clickedHour}` : clickedHour}:${clickedMinuteInHour < 10 ? `0${clickedMinuteInHour}` : clickedMinuteInHour}`;
        
        // Calculate which screen was clicked
        const screenHeight = 40; // Each screen is 40px height
        const clickedScreen = Math.floor(y / screenHeight);
        
        // Validate the clicked position
        if (clickedScreen >= 0 && clickedScreen < screen) {
            // Call the onAddSchedule callback to show the modal
            if (onAddSchedule) {
                // Pass screen name instead of index + 1
                const screenName = screens[clickedScreen]?.screenName || (clickedScreen + 1).toString();
                onAddSchedule(timeString, screenName);
            }
        }
    }, [screen, screens, onAddSchedule, selectedDate]);
    
    return (
        <div className='absolute bottom-1/10 h-[67%] flex w-full items-start justify-center'>
            {/* Background grid and time markers - behind scrollable content */}
            <div className='absolute h-full pointer-events-none w-[87%] right-[4%]'>
                 <div className="absolute z-20 top-1.5 h-[3px] w-full bg-slate-950" />
                <div className="absolute z-20 w-[97%] h-auto right-[1.4%] -top-4.5">
                    <div className="flex justify-between px-[1px] py-1">
                        {Array.from({ length: 24 }, (_, hour) => {
                            return (
                                <div key={hour} className="font-libre-franklin justify-center text-center text-xs font-bold text-black">
                                    <div>{hour < 10 ? `0${hour}` : hour}h</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className='absolute z-20 w-full h-auto top-2'>
                    <div className="relative flex h-full w-full justify-between px-[2.2%]">
                        {Array.from({ length: 12 }, (_, index) => {
                            return (
                                <div key={index} className="relative h-full w-[4.4%]">
                                    <p className="font-unbounded absolute top-0 left-0 -translate-1/2 transform text-sm font-light">I</p>
                                    <p className="font-unbounded absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 transform text-sm font-light">I</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="absolute z-0 top-2 h-[97.5%] w-full right-0">
                <div className="relative flex h-full w-full justify-between px-[2.2%]">
                    {Array.from({ length: 12 }, (_, index) => {
                        return (
                            <div key={index} className="relative h-full w-[4.4%] bg-slate-900/30"></div>
                        );
                    })}
                </div>
            </div>
            </div>

            {/* Scrollable content - above background grid */}
            <div className="relative z-10 flex flex-row mt-[0.5%]  h-[97%] w-[92%] items-start overflow-y-auto no-scrollbar">
                {/*Calendar*/}
                
                <div className="relative flex min-h-full items-start justify-start w-[4%] flex-col bg-black/20">
                    {Array.from({ length: screen }, (_, index) => {
                        // Get screen name from screens array or fallback to index + 1
                        const screenName = screens[index]?.screenName || (index + 1).toString();
                        return (
                            <div key={index} className="relative flex items-center justify-center h-[40px] w-full flex-shrink-0">
                                <span className="text-bold font-unbounded text-2xl font-black">{screenName}</span>
                                {/* Separator line between screens (not after the last one) */}
                                {index < screen - 1 && (
                                    <div className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-gray-600/60" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Clickable schedule area - OVERFLOW HIDDEN for clipping effect */}
                <div 
                    ref={scheduleGridRef}
                    onClick={handleScheduleClick}
                    className="relative flex-1 cursor-crosshair bg-transparent overflow-hidden ml-[1.4%] hover:bg-blue-50/20 transition-colors" // overflow-hidden is key for clipping
                    style={{ minHeight: `${screen * 40}px` }} // 40px height, no gap
                    title="Click to select time and screen"
                >
                    {/* Screen rows with separator lines and schedule blocks */}
                    {Array.from({ length: screen }, (_, screenIndex) => (
                        <div key={screenIndex} className="relative h-[40px]">
                            {/* Schedule blocks for this screen */}
                            {schedulesByScreen[screenIndex]?.map((schedule, scheduleIndex) => {
                                // Convert schedule times to Vietnam timezone
                                const startTime = toVietnamTime(new Date(schedule.startTime));
                                const endTime = toVietnamTime(new Date(schedule.endTime));
                                
                                // Check if this is a continuous movie (started before the timeline)
                                // Timeline starts at 23:30 the previous day in Vietnam timezone
                                const timelineStart = new Date(selectedDate);
                                timelineStart.setDate(timelineStart.getDate() - 1);
                                timelineStart.setHours(23, 30, 0, 0);
                                const vietnamTimelineStart = toVietnamTime(timelineStart);
                                
                                const isContinuous = startTime < vietnamTimelineStart && endTime > vietnamTimelineStart;


                                
                                // Calculate position and duration (allowing negative values for continuous effect)
                                const startPos = getTimePosition(schedule.startTime, selectedDate);
                                const duration = getScheduleDuration(schedule.startTime, schedule.endTime);
                                
                                // Determine styling based on whether it's continuous
                                let scheduleClasses = '';
                                let movieTitle = schedule.movie.title;
                                let movieIcon = '';
                                
                                if (isContinuous) {
                                    // Orange/red styling for continuous movies with special effects
                                    scheduleClasses = 'bg-pink-400 hover:bg-purple-700 shadow-[inset_0px_0px_30px_3px_rgba(155,47,255,1.00)]';
                                    movieIcon = '◀ '; // Left arrow indicating it continues from before
                                    movieTitle = movieIcon + movieTitle;
                                } else {
                                    // Regular styling for normal schedules
                                    scheduleClasses = 'bg-pink-400 hover:bg-purple-700 shadow-[inset_0px_0px_30px_3px_rgba(155,47,255,1.00)]';
                                }
                                
                                return (
                                    <div
                                        key={schedule._id}
                                        className={`absolute top-1.5 -space-y-1 h-[30px] ${scheduleClasses} rounded-xl cursor-pointer`}
                                        style={{
                                            left: `${startPos}%`, // Can be negative - will be clipped by overflow-hidden
                                            width: `${Math.max(duration, 2)}%`, // Minimum 2% width for visibility
                                            zIndex: isContinuous ? 2 : 1 // Continuous movies on top
                                        }}
                                        title={`${schedule.movie.title}\n${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\nTickets sold: ${schedule.ticketsSold}${isContinuous ? '\n(Continuing from previous period)' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Open edit modal instead of showing alert
                                            if (onEditSchedule) {
                                                onEditSchedule(schedule);
                                            }
                                        }}
                                    >
                                        <div className="relative pt-0.5 px-2 text-[10px] font-libre-franklin text-white font-medium truncate">
                                            {movieTitle}
                                        </div>
                                        <div className="relative px-2 text-[10px] font-libre-franklin text-white truncate">
                                            {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                        
                                        {/* Visual indicator for continuous movies - a glowing left edge */}
                                        {isContinuous && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-300 via-orange-300 to-red-300 shadow-lg animate-pulse" />
                                        )}
                                    </div>
                                );
                            })}
                            
                            {/* Separator line between screens (not after the last one) */}
                            {screenIndex < screen - 1 && (
                                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-400/50" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ScheduleManagePage = () => {
    // Utility function to convert any date to Vietnam timezone (UTC+7)
    const toVietnamTime = useCallback((date) => {
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        return new Date(utcTime + (7 * 3600000)); // UTC+7
    }, []);
    
    // Utility function to get date string in Vietnam timezone
    const getVietnamDateString = useCallback((date) => {
        const vietnamTime = toVietnamTime(date);
        // Format manually to avoid UTC conversion
        const year = vietnamTime.getFullYear();
        const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
        const day = String(vietnamTime.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [toVietnamTime]);

    const { scheduleMovieScreening, loading: postingScreening, error: postScreeningError } = useScheduleMovieScreening();
    const { updateSchedule, loading: updatingSchedule, error: updateScheduleError } = useUpdateSchedule();
    const { removeSchedule, loading: removingSchedule, error: removeScheduleError } = useRemoveSchedule();
    const { getMovies, movies } = useGetMovies();
    const { user } = useUser();
    const { getBranchById, branch: userBranch, loading: branchLoading } = useGetBranchById();
    const {token} = useUser();
    const [selectedDate, setSelectedDate] = useState(() => {
        // Set today's date in Vietnam timezone (UTC+7)
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const vietnamTime = new Date(utcTime + (7 * 3600000));
        vietnamTime.setHours(0, 0, 0, 0);
        return vietnamTime;
    });
    const [isInitialDateSet, setIsInitialDateSet] = useState(false); // Track if initial date was set
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the initial load
    const { schedules, loading, error, fetchSchedules } = useGetSchedules();
    
    // Fixed filtering logic for schedules
    const filteredSchedules = useMemo(() => {
        const selectedDateStr = getVietnamDateString(selectedDate);
        
        
        // Timeline boundaries in Vietnam timezone
        const timelineStart = new Date(selectedDate);
        timelineStart.setDate(timelineStart.getDate() - 1);
        timelineStart.setHours(23, 30, 0, 0);
        const vietnamTimelineStart = toVietnamTime(timelineStart);
        
        const vietnamTimelineEnd = new Date(vietnamTimelineStart);
        vietnamTimelineEnd.setHours(vietnamTimelineEnd.getHours() + 24); // 24 hours later
        
        
        const filtered = schedules.filter(schedule => {
            // Convert schedule times to Vietnam timezone for comparison
            const scheduleStartTime = toVietnamTime(new Date(schedule.startTime));
            const scheduleEndTime = toVietnamTime(new Date(schedule.endTime));
            

            
            // NEW LOGIC: Check if the schedule's "primary day" matches the selected date
            // For schedules that span midnight, we determine the primary day based on which day
            // has more of the schedule's duration
            
            // Calculate the schedule's total duration
            const totalDuration = scheduleEndTime.getTime() - scheduleStartTime.getTime();
            
            // Calculate how much of the schedule falls on each day
            let primaryDay = new Date(scheduleStartTime);
            primaryDay.setHours(0, 0, 0, 0);
            
            // If the schedule spans midnight, we need to determine which day it "belongs to"
            if (scheduleStartTime.getDate() !== scheduleEndTime.getDate()) {
                // Schedule spans midnight - calculate which day gets more duration
                const midnightBoundary = new Date(scheduleStartTime);
                midnightBoundary.setDate(midnightBoundary.getDate() + 1);
                midnightBoundary.setHours(0, 0, 0, 0);
                
                const durationOnStartDay = midnightBoundary.getTime() - scheduleStartTime.getTime();
                const durationOnEndDay = scheduleEndTime.getTime() - midnightBoundary.getTime();
                
                // If more duration is on the end day, that's the primary day
                if (durationOnEndDay > durationOnStartDay) {
                    primaryDay = new Date(scheduleEndTime);
                    primaryDay.setHours(0, 0, 0, 0);
                }
            }
            
            // Convert primary day to Vietnam timezone for comparison
            const vietnamPrimaryDay = toVietnamTime(primaryDay);
            const vietnamSelectedDay = toVietnamTime(new Date(selectedDate));
            vietnamSelectedDay.setHours(0, 0, 0, 0);
            
            // Check if the primary day matches the selected date
            const isPrimaryDayMatch = vietnamPrimaryDay.getTime() === vietnamSelectedDay.getTime();
            

            // Also check if schedule overlaps with the timeline window (for continuous display)
            const startsWithinTimeline = scheduleStartTime >= vietnamTimelineStart && scheduleStartTime < vietnamTimelineEnd;
            const isOngoingDuringTimeline = scheduleStartTime < vietnamTimelineStart && scheduleEndTime > vietnamTimelineStart;
            const overlapsTimeline = startsWithinTimeline || isOngoingDuringTimeline;
            
            // Show schedule if either:
            // 1. Its primary day matches the selected date, OR
            // 2. It overlaps with the timeline (for edge cases and continuous display)
            const shouldShow = isPrimaryDayMatch || overlapsTimeline;
            
            if (shouldShow) {
                return true;
            }
            
            return false;
        });
        
        
        return filtered;
    }, [selectedDate, schedules, getVietnamDateString, toVietnamTime]);
    
    // Debug: Log when schedules change
    useEffect(() => {
    }, [schedules]);
    
    // Modal state management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        selectedTime: '',
        selectedScreen: '',
    });

    // Edit modal state management
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    // Upload modal state management
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadedData, setUploadedData] = useState([]);
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        if (user && user.roles?.includes('branchmanager') && user.branch) {
            getBranchById(user.branch._id);
        }
    }, [user]);

    useEffect(() => {
        // Fetch movies for upload validation
        getMovies();
    }, []);

    useEffect(() => {
        if (userBranch?._id) {
            fetchSchedules(null, userBranch._id).then(() => {
                setIsInitialLoad(false); // Mark initial load as complete
            });
        }
    }, [userBranch]); // Remove fetchSchedules from dependency array

    // Set selected date to earliest schedule date after today when schedules are fetched successfully - ONLY INITIALLY
    useEffect(() => {
        if (!loading && !error && schedules && schedules.length > 0 && !isInitialDateSet) {
            // Get today's date in Vietnam timezone
            const today = toVietnamTime(new Date());
            today.setHours(0, 0, 0, 0);
            
            const futureSchedules = schedules
                .map(s => {
                    const scheduleTime = new Date(s.startTime);
                    const vietnamScheduleTime = toVietnamTime(scheduleTime);
                    vietnamScheduleTime.setHours(0, 0, 0, 0); // Set to start of day for comparison
                    return vietnamScheduleTime;
                })
                .filter(d => d >= today) // Use >= to include today's schedules
                .sort((a, b) => a - b);
                
            if (futureSchedules.length > 0) {
                setSelectedDate(futureSchedules[0]);
            }
            setIsInitialDateSet(true); // Mark that initial date has been set
        }
    }, [schedules, loading, error, isInitialDateSet, toVietnamTime]);
    
    const handleDateChange = useCallback((newDate) => {
        setSelectedDate(newDate);
    }, []);
    
    // Handle opening the add schedule modal
    const handleAddSchedule = useCallback((selectedTime, selectedScreen) => {
        // Parse the clicked time and determine the correct date
        const [hours, minutes] = selectedTime.split(':').map(Number);
        
        // Create a date object for the clicked time
        let scheduleDate = new Date(selectedDate);

        if (hours === 23 && minutes >= 30) {
            scheduleDate.setDate(scheduleDate.getDate() - 1);}
        
        setModalData({
            selectedTime,
            selectedScreen,
            calculatedDate: scheduleDate // Pass the calculated date
        });
        setIsModalOpen(true);
    }, [selectedDate, getVietnamDateString]);
    
    // Handle opening the add schedule modal from the Add button
    const handleAddButtonClick = useCallback(() => {
        const defaultDate = new Date(selectedDate);
        setModalData({
            selectedTime: '09:00', // Default time
            selectedScreen: userBranch?.screens?.[0]?.screenName || '1', // Default to first screen
            calculatedDate: defaultDate
        });
        setIsModalOpen(true);
    }, [userBranch, selectedDate]);
    
    // Handle closing the modal (no need to refresh schedules since success handler already does it)
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setModalData({
            selectedTime: '',
            selectedScreen: '',
            calculatedDate: null
        });
        // Note: No need to refresh schedules here since handleScheduleSuccess already does it
    }, []);

    // Handle successful schedule addition/update
    const handleScheduleSuccess = useCallback(async () => {
        // Add a small delay to ensure database operation is complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Refresh schedules immediately after successful operation while preserving selected date
        if (userBranch?._id) {
            try {
                await fetchSchedules(null, userBranch._id);
            } catch (error) {
            }
        }
        // Note: selectedDate is preserved since isInitialDateSet prevents automatic date changes
    }, [userBranch]); // Remove fetchSchedules from dependency array

    // Handle opening the edit schedule modal
    const handleEditSchedule = useCallback((schedule) => {
        setSelectedSchedule(schedule);
        setIsEditModalOpen(true);
    }, []);

    // Handle closing the edit modal (no need to refresh schedules since success handler already does it)
    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setSelectedSchedule(null);
        // Note: No need to refresh schedules here since handleScheduleSuccess already does it
    }, []);

    // Handle schedule upload
    const handleScheduleUpload = useCallback((data) => {
        setUploadedData(data);
        setIsUploadModalOpen(true);
    }, []);

    // Handle closing upload modal
    const handleCloseUploadModal = useCallback(() => {
        setIsUploadModalOpen(false);
        setUploadedData([]);
    }, []);

    // Handle confirming upload
    const handleConfirmUpload = useCallback(async (selectedData) => {
        setImportLoading(true);
        try {
            
            // Process each schedule
            const promises = selectedData.map(async (schedule) => {
                // Find the screen ID by name
                const screen = userBranch?.screens?.find(s => 
                    s.screenName.toString() === schedule.screenName.toString()
                );
                if (!screen) {
                    throw new Error(`Screen "${schedule.screenName}" not found`);
                }
                // Find the movie ID by title
                const movie = movies.find(m => 
                    m.title.toLowerCase() === schedule.movieName.toLowerCase()
                );
                if (!movie) {
                    throw new Error(`Movie "${schedule.movieName}" not found`);
                }

                const scheduleData = {
                    movieId: movie._id,
                    screenId: screen._id,
                    startTime: `${schedule.date}T${schedule.startTime}`,
                    endTime: `${schedule.date}T${schedule.endTime}`, // Include endTime
                };

                return scheduleMovieScreening(userBranch._id, scheduleData);
            });

            const results = await Promise.all(promises);
            
            // Check if all succeeded
            const failures = results.filter(result => !result.success);
            if (failures.length > 0) {
                alert(`${failures.length} out of ${selectedData.length} schedules failed to import. Check console for details.`);
            } else {
                alert(`Successfully imported ${selectedData.length} schedules!`);
            }

            // Refresh schedules and close modal
            await handleScheduleSuccess();
            handleCloseUploadModal();
            
        } catch (error) {
            alert('Failed to import schedules. Please check the data and try again.');
        } finally {
            setImportLoading(false);
        }
    }, [userBranch, movies, scheduleMovieScreening, handleScheduleSuccess, handleCloseUploadModal]);
    


    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <div className="font-unbounded absolute lg:top-1/10 xl:top-1/20 left-1/12 z-10 justify-start text-5xl font-bold text-black">Schedule</div>

                <div className="absolute right-1/12 z-60 flex items-end gap-4 lg:top-1/14 xl:top-1/24">
                    <AddButton text="Add Schedule" onClick={handleAddButtonClick}/>
                    <div className="flex flex-col items-center">
                        <DownloadTemplateButton 
                            templatePath="/templates/ScheduleList-Template.xlsx"
                            filename="ScheduleList-Template.xlsx"
                            buttonText="Download template"
                            disabled={loading || importLoading}
                        />
                        <UploadCSVButton 
                            templateType="schedule"
                            onDataParsed={handleScheduleUpload}
                            disabled={loading || importLoading}
                        />
                    </div>
                    <DateChosenButton 
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        scheduleDates={schedules.map(schedule => new Date(schedule.startTime))}
                    />
                    
                </div>

                <div className="absolute left-1/2 z-4 w-[95%] -translate-x-1/2 transform rounded-xl bg-black/10 lg:bottom-1/10 lg:h-[70%] xl:bottom-1/10 xl:rounded-3xl"></div>
                
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-500 text-xl p-5 font-bold font-['Unbounded'] bg-white/90 rounded-lg shadow-lg">
                            Error loading schedules: {error}
                        </div>
                    </div>
                ) : (loading && isInitialLoad) ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-white text-2xl p-5 font-bold font-['Unbounded'] animate-pulse">
                            • • •
                        </div>
                    </div>
                ) : (
                    <Schedule 
                        schedules={filteredSchedules} 
                        selectedDate={selectedDate} 
                        screen={userBranch?.screens?.length} 
                        screens={userBranch?.screens || []}
                        onAddSchedule={handleAddSchedule}
                        onEditSchedule={handleEditSchedule}
                        toVietnamTime={toVietnamTime}
                    />
                )}

                <SelectBranchButton isLoading={branchLoading} branchName={userBranch?.name} />
            </MobileNotSupported>

            {/* Add Schedule Modal */}
            <AddScheduleModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedTime={modalData.selectedTime}
                selectedScreen={modalData.selectedScreen}
                selectedDate={modalData.calculatedDate || selectedDate}
                screens={userBranch?.screens || []}
                scheduleMovieScreening={scheduleMovieScreening}
                branchId={user?.branch?._id}
                onScheduleSuccess={handleScheduleSuccess}
                isLoading={postingScreening}
                movies={movies || []}
            />

            {/* Edit Schedule Modal */}
            <EditScheduleModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                schedule={selectedSchedule}
                screens={userBranch?.screens || []}
                updateSchedule={updateSchedule}
                removeSchedule={removeSchedule}
                branchId={user?.branch?._id}
                onScheduleSuccess={handleScheduleSuccess}
                isUpdating={updatingSchedule}
                isDeleting={removingSchedule}
                movies={movies || []}
            />

            {/* Schedule Upload Modal */}
            <ScheduleUploadModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
                uploadedData={uploadedData}
                onConfirm={handleConfirmUpload}
                isLoading={importLoading}
                screens={userBranch?.screens || []}
                movies={movies || []}
                existingSchedules={schedules || []}
            />

            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default ScheduleManagePage;