import UploadCSVButton from '@components/buttons/Staff/uploadCsvButton.jsx';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';
import DownloadTemplateButton from '@components/buttons/Staff/DownloadTemplateButton.jsx';
import DateChosenButton from "@components/buttons/Staff/DateChosenButton.jsx";
import AddButton from "@components/buttons/Staff/AddButton.jsx";
import { useEffect, useRef, useCallback, useMemo, useState, use } from 'react'; 
import { useUser } from '@contexts/UserContext';
import { useGetBranchById, useGetSchedules } from '@hooks/useBranch'; 

const Schedule = ({screen = 20, schedules = [], selectedDate}) => {
    const scheduleGridRef = useRef(null);
    
    // Helper function to convert time to position on timeline (allows negative values)
    const getTimePosition = useCallback((timeString, selectedDate) => {
        const time = new Date(timeString);
        
        // Timeline starts at 23:30 the previous day
        const timelineStart = new Date(selectedDate);
        timelineStart.setDate(timelineStart.getDate() - 1);
        timelineStart.setHours(23, 30, 0, 0);
        
        // Calculate minutes from timeline start
        const timeDiff = time - timelineStart;
        const minutes = timeDiff / (1000 * 60);
        
        // Timeline covers 24 hours = 1440 minutes
        const timelineMinutes = 24 * 60;
        
        // Return percentage (can be negative for continuous effect)
        return (minutes / timelineMinutes) * 100;
    }, []);
    
    // Helper function to get schedule duration in percentage
    const getScheduleDuration = useCallback((startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        const durationMinutes = durationMs / (1000 * 60);
        
        // Timeline covers 24 hours = 1440 minutes
        const timelineMinutes = 24 * 60;
        
        // Return percentage width
        return (durationMinutes / timelineMinutes) * 100;
    }, []);
    
    // Group schedules by screen
    const schedulesByScreen = useMemo(() => {
        const grouped = {};
        schedules.forEach(schedule => {
            const screenName = schedule.screen.screenName;
            const screenIndex = parseInt(screenName) - 1; // Convert to 0-based index
            
            if (!grouped[screenIndex]) {
                grouped[screenIndex] = [];
            }
            grouped[screenIndex].push(schedule);
        });
        return grouped;
    }, [schedules]);
    
    const handleScheduleClick = useCallback((event) => {
        if (!scheduleGridRef.current) return;
        
        const rect = scheduleGridRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calculate which time was clicked (24 hours across the width, starting from 23:30 the night before)
        const timelineMinutes = 24 * 60; // 1440 minutes in a day
        const minuteWidth = rect.width / timelineMinutes;
        // Minutes since 23:30
        let clickedMinute = Math.floor(x / minuteWidth);
        // Convert to actual hour/minute
        let clickedHour = Math.floor((clickedMinute + 1410) / 60) % 24; // 1410 = 23*60+30
        let rawMinuteInHour = (clickedMinute + 1410) % 60;
        
        // Snap to nearest 15-minute interval (0, 15, 30, 45)
        const snappedMinute = Math.round(rawMinuteInHour / 15) * 15;
        let clickedMinuteInHour = snappedMinute;
        
        // Handle minute overflow (e.g., 60 minutes becomes next hour)
        if (clickedMinuteInHour >= 60) {
            clickedMinuteInHour = 0;
            clickedHour += 1;
        }
        
        // Calculate which screen was clicked
        const screenHeight = 40; // Each screen is 40px height
        const clickedScreen = Math.floor(y / screenHeight);
        
        // Validate the clicked position
        if (clickedScreen >= 0 && clickedScreen < screen) {
            const timeString = `${clickedHour < 10 ? `0${clickedHour}` : clickedHour}:${clickedMinuteInHour < 10 ? `0${clickedMinuteInHour}` : clickedMinuteInHour}`;
            console.log(`Clicked: Time ${timeString}, Screen ${clickedScreen}`);
            
            // Optional: Show an alert for demonstration
            alert(`You clicked on Screen ${clickedScreen} at ${timeString}`);
        }
    }, [screen]);
    
    return (
        <div className='absolute bottom-1/10 h-[67%] xl:h-[75%] flex w-full items-start justify-center'>
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
                        return (
                            <div key={index} className="relative flex items-center justify-center h-[40px] w-full flex-shrink-0">
                                <span className="text-bold font-unbounded text-2xl font-black">{index + 1}</span>
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
                                const startTime = new Date(schedule.startTime);
                                const endTime = new Date(schedule.endTime);
                                
                                // Check if this is a continuous movie (started before the timeline)
                                const timelineStart = new Date(selectedDate);
                                timelineStart.setDate(timelineStart.getDate() - 1);
                                timelineStart.setHours(23, 30, 0, 0);
                                
                                const isContinuous = startTime < timelineStart && endTime > timelineStart;
                                
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
                                            console.log('Schedule clicked:', schedule);
                                            console.log('Position details:', {
                                                startPos: startPos,
                                                duration: duration,
                                                isContinuous: isContinuous,
                                                actualStartTime: startTime.toISOString(),
                                                timelineStart: timelineStart.toISOString()
                                            });
                                            alert(`Schedule: ${schedule.movie.title}\nTime: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}\nPosition: ${startPos.toFixed(1)}%\nDuration: ${duration.toFixed(1)}%\nTickets sold: ${schedule.ticketsSold}${isContinuous ? '\n(Continuing from previous period)' : ''}`);
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
    const { user } = useUser();
    const { getBranchById, branch: userBranch, loading: branchLoading } = useGetBranchById();
    const {token} = useUser();
    const [selectedDate, setSelectedDate] = useState(new Date()); // Current date state
    const { schedules, loading, error, fetchSchedules } = useGetSchedules();

    useEffect(() => {
        if (user && user.roles?.includes('branchmanager') && user.branch) {
            getBranchById(user.branch._id);
        }
    }, [user]);

    useEffect(() => {
        if (userBranch?._id) {
            fetchSchedules(null, userBranch._id);
        }
    }, [userBranch]);

    // Set selected date to first schedule's date when schedules are fetched successfully
    useEffect(() => {
        if (!loading && !error && schedules && schedules.length > 0) {
            const firstScheduleDate = new Date(schedules[0].startTime);
            setSelectedDate(firstScheduleDate);
        }
    }, [schedules, loading, error]);

    console.log('User token:', token);
    console.log('User branch:', userBranch);
    console.log('Schedules:', schedules);
    console.log('Loading:', loading);
    console.log('Error:', error);
    
    // Filter schedules based on selected date and show ongoing movies
    const filteredSchedules = useMemo(() => {
        const selectedDateStr = selectedDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        const timelineStart = new Date(selectedDate);
        timelineStart.setDate(timelineStart.getDate() - 1);
        timelineStart.setHours(23, 30, 0, 0); // 23:30 of previous day
        
        const timelineEnd = new Date(timelineStart);
        timelineEnd.setHours(timelineEnd.getHours() + 24); // 24 hours later
        
        return schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0];
            const scheduleStartTime = new Date(schedule.startTime);
            const scheduleEndTime = new Date(schedule.endTime);
            
            // Show schedules for the selected date
            if (scheduleDate === selectedDateStr) {
                return true;
            }
            
            // Show movies that overlap with our timeline (even if they start before it)
            if (scheduleStartTime < timelineEnd && scheduleEndTime > timelineStart) {
                return true;
            }
            
            return false;
        });
    }, [selectedDate]);
    
    const handleDateChange = useCallback((newDate) => {
        setSelectedDate(newDate);
    }, []);
    


    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <div className="font-unbounded absolute lg:top-1/10 xl:top-1/20 left-1/12 z-10 justify-start text-5xl font-bold text-black">Schedule</div>

                <div className="absolute right-1/12 z-60 flex items-end gap-4 lg:top-1/14 xl:top-1/24">
                    <AddButton text="Add Schedule"/>
                    <div className="flex flex-col items-center">
                        <DownloadTemplateButton />
                        <UploadCSVButton />
                    </div>
                    <DateChosenButton 
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                    />
                    
                </div>

                <div className="absolute left-1/2 z-4 w-[95%] -translate-x-1/2 transform rounded-xl bg-black/10 lg:bottom-1/10 lg:h-[70%] xl:bottom-1/10 xl:h-[78%] xl:rounded-3xl"></div>
                
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-500 text-xl p-5 font-bold font-['Unbounded'] bg-white/90 rounded-lg shadow-lg">
                            Error loading schedules: {error}
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-white text-2xl p-5 font-bold font-['Unbounded'] animate-pulse">
                            • • •
                        </div>
                    </div>
                ) : (
                    <Schedule schedules={filteredSchedules} selectedDate={selectedDate} screen={userBranch?.screens?.length} />
                )}

                <SelectBranchButton isLoading={branchLoading} branchName={userBranch?.name} />
            </MobileNotSupported>

            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default ScheduleManagePage;