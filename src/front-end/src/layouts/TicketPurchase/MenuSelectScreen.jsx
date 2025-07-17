import { useState, useEffect } from 'react';
import BPoster from '../../components/UI/BPoster';
import NextNaviButton from '../../components/buttons/NaviButton';
import { BackNaviButton } from '../../components/buttons/NaviButton';
import DateSlider from '../../components/UI/Dateslider';
import CinemaPopUp from '../../components/UI/CinemaPopUp';

const TimeButton = ({ time, seats, scheduleId, isSelected, onSelect}) => {
    return (
        <button 
            className={`group relative flex w-[38vw] flex-col items-center justify-center -space-y-1 rounded-xl md:w-[calc(100vw*0.12)] lg:w-[calc(100vw*0.10)] ${isSelected ? 'outline-2 outline-white' : ''}`}
            onClick={() => onSelect(scheduleId)}
            style={{ cursor: 'pointer' }}
        >
            <div className={`absolute top-0 left-0 h-full w-full rounded-xl mix-blend-color-dodge group-hover:bg-zinc-300/70 lg:[transform:translate3d(0,0,0)] ${isSelected ? 'bg-zinc-300/80' : 'bg-zinc-300/60'}`} />
            <div className="pt-2 font-['Unbounded'] text-[18px] font-bold text-white md:pt-1 md:text-[15px] lg:text-[17px]">{time}</div>
            <div className="pb-1 font-['Unbounded'] text-[10px] font-light text-white md:pb-0.5 md:text-[10px] lg:text-[11px] xl:text-[12px]">{seats} seats left</div>
        </button>
    );
};

const TimeGrid = ({ selectedSchedule, onScheduleSelect, mockSchedules, selectedDate }) => {
    // Helper function to format time from ISO string
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    // Filter schedules by selected date and sort by full startTime
    const filteredSchedules = selectedDate 
        ? mockSchedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0];
            return scheduleDate === selectedDate;
          }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        : [];

    return (
        <div className="inline-flex w-[80vw] flex-wrap content-start items-start justify-start md:justify-center gap-3.5 md:w-[55vw] lg:w-[calc(100vw*0.45)]">
            {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => (
                    <TimeButton 
                        key={schedule._id}
                        time={formatTime(schedule.startTime)} 
                        seats={schedule.availableSeats}
                        scheduleId={schedule._id}
                        isSelected={selectedSchedule === schedule._id}
                        onSelect={onScheduleSelect}
                    />
                ))
            ) : (
                <div className="flex w-full items-center justify-center py-8">
                    <div className="font-['Unbounded'] text-sm font-semibold text-white/60">
                        {selectedDate ? 'No showtimes available for this date' : 'Please select a date to view showtimes'}
                    </div>
                </div>
            )}
        </div>
    );
};

const ChooseCinemaButton = ({ onClick, label }) => (
    <button 
        className="group relative flex h-auto w-[80vw] items-center justify-center py-3 md:w-80 lg:w-[calc(100vw*0.28)] max-w-[500px] cursor-pointer hover:cursor-pointer"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
    >
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)] group-hover:bg-zinc-300/70" />
        <div className=" md:text-md h-auto items-center justify-center  font-['Unbounded'] text-base font-black text-white mx-2">
            {(label ? label.toUpperCase() : 'CHOOSE CINEMA')}
        </div>
    </button>
);

const MenuSelectScreen = ({ onNext, onBack, movieTicketData, updateMovieTicket, updateSnackTicket, mockSchedules, cinemas, onCinemaChangeReset }) => {
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(movieTicketData.branch || null);
    const [isCinemaPopupOpen, setIsCinemaPopupOpen] = useState(false);
    
    // Get the first available date from mock schedules
    const getFirstAvailableDate = () => {
        const uniqueDates = [...new Set(mockSchedules.map(schedule => {
            return new Date(schedule.startTime).toISOString().split('T')[0];
        }))].sort();
        
        if (uniqueDates.length > 0) {
            const firstDate = uniqueDates[0];
            const dateObj = new Date(firstDate + 'T00:00:00.000Z');
            return {
                date: firstDate,
                display: dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };
        }
        return { date: '2025-07-16', display: 'Wednesday, 16 July, 2025' }; // fallback
    };
    
    const firstDate = getFirstAvailableDate();
    
    // Separate viewing date (what date's showtimes we're looking at) from selected date (date of selected schedule)
    const [viewingDate, setViewingDate] = useState(firstDate.date); // Date we're currently viewing showtimes for
    const [viewingDateDisplay, setViewingDateDisplay] = useState(firstDate.display);
    
    // Get the actual selected date from the selected schedule
    const getSelectedDate = () => {
        if (movieTicketData.schedule) {
            const schedule = mockSchedules.find(s => s._id === movieTicketData.schedule);
            if (schedule) {
                const selectedDate = new Date(schedule.startTime).toISOString().split('T')[0];
                const selectedDateObj = new Date(selectedDate + 'T00:00:00.000Z');
                return {
                    date: selectedDate,
                    display: selectedDateObj.toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })
                };
            }
        }
        return null;
    };

    const selectedDateInfo = getSelectedDate();


    // Handle branch selection (not used directly, but keep for completeness)
    const handleBranchSelect = (branchId) => {
        setSelectedBranch(branchId);
        updateMovieTicket({ branch: branchId });
        if (typeof updateSnackTicket === 'function') {
            updateSnackTicket({ branch: branchId });
        }
    };

    // Handle cinema selection from popup
    const handleCinemaSelect = (cinema) => {
        setSelectedBranch(cinema._id);
        updateMovieTicket({ branch: cinema._id, schedule: null }); // reset schedule
        if (typeof updateSnackTicket === 'function') {
            updateSnackTicket({ branch: cinema._id });
        }
        if (typeof onCinemaChangeReset === 'function') {
            onCinemaChangeReset(); // parent will reset date by remounting
        }
        console.log('Selected cinema:', cinema);
    };

    // Handle schedule selection
    const handleScheduleSelect = (scheduleId) => {
        updateMovieTicket({ schedule: scheduleId });
        // Note: We do NOT update the viewing date here
        // This allows users to select a schedule and still browse other dates freely
    };

    // Handle date selection - this ONLY changes what date's showtimes we're viewing
    // It does NOT clear the selected schedule - that only happens when clicking time buttons
    const handleDateSelect = (date, displayDate) => {
        setViewingDate(date);
        setViewingDateDisplay(displayDate);
        // Note: We keep the selected schedule intact - it persists across date browsing
    };

    // Check if user can proceed to next step - schedule persists across date changes
    const canProceed = movieTicketData.branch && movieTicketData.schedule;

    const handleNext = () => {
        if (canProceed) {
            onNext();
        } else {
            if (!movieTicketData.branch) {
                alert('Please select a cinema first.');
            } else if (!movieTicketData.schedule) {
                alert('Please select a showtime.');
            } else {
                alert('Please select both cinema and showtime before proceeding.');
            }
        }
    };

    // Get selected schedule details for display - show regardless of current date
    const selectedScheduleDetails = movieTicketData.schedule ? 
        mockSchedules.find(schedule => schedule._id === movieTicketData.schedule) : null;
    const formatTimeForDisplay = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    useEffect(() => {
        const controlBottomBar = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY) {
                setIsBottomBarVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsBottomBarVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlBottomBar);

        return () => {
            window.removeEventListener('scroll', controlBottomBar);
        };
    }, [lastScrollY]);

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Background layer with blend mode */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                {/* Content layer */}
                <div className="hidden md:block">
                    <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
                </div>
                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className={`relative flex flex-col h-full items-center ${!selectedBranch ? 'justify-center' : 'justify-start'}`}>
                        <div className="h-5 md:h-7" />
                        
                        {/* Only show date slider and schedule content when branch is selected */}
                        {selectedBranch && (
                            <>
                                <DateSlider 
                                    selectedDate={viewingDate}
                                    onDateSelect={handleDateSelect}
                                    mockSchedules={mockSchedules}
                                    selectedScheduleDate={selectedDateInfo?.date}
                                />
                                
                            </>
                        )}
                        <div className="w-[55vw] overflow-hidden rounded-xl pt-5 md:hidden">
                                    <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
                                </div>
                                <div className="h-5 md:h-7" />
                        <ChooseCinemaButton 
                            onClick={() => setIsCinemaPopupOpen(true)} 
                            label={selectedBranch}
                        />
                        
                        {/* Only show time grid when branch is selected */}
                        {selectedBranch && (
                            <>
                                <div className="h-3 md:h-5" />
                                <TimeGrid 
                                    selectedSchedule={movieTicketData.schedule}
                                    onScheduleSelect={handleScheduleSelect}
                                    mockSchedules={mockSchedules}
                                    selectedDate={viewingDate}
                                />
                            </>
                        )}
                        
                        <div className="h-5 sm:h-3 lg:h-10" />
                    </div>
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="w-80 justify-start text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            {!selectedBranch ? (
                                <>
                                    Please select a cinema
                                    <br />
                                    to view available showtimes
                                </>
                            ) : selectedScheduleDetails ? (
                                <>
                                    {selectedDateInfo?.display}, {formatTimeForDisplay(selectedScheduleDetails.startTime)}
                                    <br />
                                    Cinema: {selectedBranch}
                                </>
                            ) : (
                                <>
                                    Select a time
                                    <br />
                                    Cinema: {selectedBranch}
                                </>
                            )}
                        </div>
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton 
                            text="SEATINGS" 
                            onClick={handleNext}
                            disabled={!canProceed}
                        />
                    </div>
                </div>
                <div
                    className={`fixed right-0 bottom-0 left-0 z-50 flex h-15 flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
                >
                    <BackNaviButton onClick={onBack} />
                    <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">
                        Movie: Tham Tu Kien
                        <br />
                        {!selectedBranch ? (
                            <>
                                Please select a cinema
                                <br />
                                to view available showtimes
                            </>
                        ) : selectedScheduleDetails ? (
                            <>
                                {selectedDateInfo?.display}, {formatTimeForDisplay(selectedScheduleDetails.startTime)}
                                <br />
                                Cinema: {selectedBranch}
                            </>
                        ) : (
                            <>
                                Select a time
                                <br />
                                Cinema: {selectedBranch}
                            </>
                        )}
                    </div>

                    <NextNaviButton 
                        text="SEATINGS" 
                        onClick={handleNext}
                        disabled={!canProceed}
                    />
                </div>
            </div>
            
            <CinemaPopUp 
                isOpen={isCinemaPopupOpen} 
                onClose={() => setIsCinemaPopupOpen(false)} 
                onCinemaSelect={handleCinemaSelect}
                cinemas={cinemas}
            />
        </div>
    );
};

export default MenuSelectScreen;
