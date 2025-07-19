import { useState, useEffect } from 'react';
import BPoster from '@components/UI/BPoster';
import NextNaviButton from '@components/buttons/NaviButton';
import { BackNaviButton } from '@components/buttons/NaviButton';
import DateSlider from '@components/UI/Dateslider';
import CinemaPopUp from '@components/UI/CinemaPopUp';
import mockPoster from '@assets/sample/ThamTuKien.jpg';


const schedules = [
    { 
        _id: 'sid',
        movie: {_id: 'mid', name: 'Movie 1', poster: 'poster1.jpg'},
        screen: {_id:'ssid', name: 'Screen 1', totalSeats: 80},
        startTime: '2025-07-14T08:00:00.000',
        endTime: '2025-07-14T10:30:00.000',
        OccupiedSeats: [
            { row: 'A', no: 1 },
            { row: 'A', no: 2 }
        ],
    },
    { 
        _id: 'sid2',
        movie: {_id: 'mid2', name: 'Movie 2', poster: 'poster2.jpg'},
        screen: {_id:'ssid2', name: 'Screen 2', totalSeats: 100},
        startTime: '2025-07-16T11:00:00.000',
        endTime: '2025-07-14T13:30:00.000',
        OccupiedSeats: [
            { row: 'B', no: 1 },
            { row: 'B', no: 2 }
        ],
    },
    {
        _id: 'sid3',
        movie: {_id: 'mid3', name: 'Movie 3', poster: 'poster3.jpg'},
        screen: {_id:'ssid3', name: 'Screen 3', totalSeats: 120},
        startTime: '2025-07-15T14:00:00.000',
        endTime: '2025-07-14T16:30:00.000',
        OccupiedSeats: [
            { row: 'C', no: 1 },
            { row: 'C', no: 2 }
        ],
    }
];

const cinemas = [
    {
    "_id": "66b8a1c4f2e8d5a1b3c4d5c1",
    "name": "Lumiere Cao Thắng",
    "address": "379-381 Cao Thắng St, Ward 12",
    "city": "Ho Chi Minh City",
    "location": {
        "type": "Point",
        "coordinates": [106.6917, 10.7769]
    },
    "isActive": true,
    "showings": "7"
    }        
];

// =============================== TIME GRID =============================== 


const TimeButton = ({ time, seats, schedule, isSelected, onSelect}) => {
    return (
        <button 
            className={`group relative flex w-[38vw] flex-col items-center justify-center -space-y-1 rounded-xl md:w-[calc(100vw*0.12)] lg:w-[calc(100vw*0.10)] ${isSelected ? 'outline-2 outline-white' : ''}`}
            onClick={() => onSelect(schedule)}
            style={{ cursor: 'pointer' }}
        >
            <div className={`absolute top-0 left-0 h-full w-full rounded-xl mix-blend-color-dodge group-hover:bg-zinc-300/70 lg:[transform:translate3d(0,0,0)] ${isSelected ? 'bg-zinc-300/80' : 'bg-zinc-300/60'}`} />
            <div className="pt-2 font-['Unbounded'] text-[18px] font-bold text-white md:pt-1 md:text-[15px] lg:text-[17px]">{time}</div>
            <div className="pb-1 font-['Unbounded'] text-[10px] font-light text-white md:pb-0.5 md:text-[10px] lg:text-[11px] xl:text-[12px]">{seats} seats left</div>
        </button>
    );
};

const TimeGrid = ({selectedSchedule, onScheduleSelect, schedules, viewingDate }) => {
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };
    const filteredSchedules = viewingDate ? schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0];
            return scheduleDate === viewingDate;
          }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        : [];


    return (
        <div className="inline-flex w-[80vw] flex-wrap content-start items-start justify-start md:justify-center gap-3.5 md:w-[55vw] lg:w-[calc(100vw*0.45)]">
            {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => (
                    <TimeButton 
                        key={schedule._id}
                        time={formatTime(schedule.startTime)} 
                        seats={schedule.screen.totalSeats - schedule.OccupiedSeats.length}
                        isSelected={selectedSchedule === schedule}
                        onSelect={onScheduleSelect}
                        schedule={schedule}
                    />
                ))
            ) : (
                <div className="flex w-full items-center justify-center py-8">
                    <div className="font-['Unbounded'] text-sm font-semibold text-white/60">
                        {viewingDate ? 'No showtimes available for this date' : 'Please select a date to view showtimes'}
                    </div>
                </div>
            )}
        </div>
    );
};

// =============================== CHOOSE CINEMA =============================== 

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

const MenuSelectScreen = ({onNext, onBack, movieTicketData, updateMovieTicket}) => {
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(movieTicketData.branch);
    const [isCinemaPopupOpen, setIsCinemaPopupOpen] = useState(false);
    
const uniqueDates = [...new Set(schedules.map(schedule => {
    return new Date(schedule.startTime).toISOString().split('T')[0];
}))]
    .sort()
    .map(dateStr => ({
        date: dateStr,
    }));

    const getFirstAvailableDate = () => {
        if (uniqueDates.length > 0) {
            return uniqueDates[0]
        }
        return null;
    };
    
const firstDate = getFirstAvailableDate();
const [viewingDate, setViewingDate] = useState(firstDate?.date || null);
    
    const getSelectedDate = () => {
        if (movieTicketData.schedule?._id) {
                const selectedDate = new Date(movieTicketData.schedule.startTime).toISOString().split('T')[0];
                return {
                    date: selectedDate,
            }
        }
        return null;
    };

    const selectedDateInfo = getSelectedDate();

// =============================== HANDLE SELECT =============================== 


    const handleBranchSelect = (branch) => {
        console.log('Selected branch:', branch);
        console.log('Current movie ticket data:', movieTicketData);
        updateMovieTicket({ branch: branch});
    };

    const handleScheduleSelect = (schedule) => {
        console.log('Selected schedule:', schedule);
        console.log('Current movie ticket data:', movieTicketData);
        updateMovieTicket({ schedule: schedule });
    };

    const handleDateSelect = (date) => {
        console.log('Selected date:', date);
        console.log('Current movie ticket data:', movieTicketData);
        console.log('Current viewing date:', viewingDate);
        setViewingDate(date);
  };

// =============================== MOVE NEXT =============================== 

    const canProceed = movieTicketData.branch._id && movieTicketData.schedule._id;

    const handleNext = () => {
        if (canProceed) {
            onNext();
        } else {
            if (!movieTicketData.branch._id) {
                alert('Please select a cinema first.');
            } else if (!movieTicketData.schedule._id) {
                alert('Please select a showtime.');
            } else {
                alert('Please select both cinema and showtime before proceeding.');
            }
        }
    };

// =============================== FORMAT =============================== 

    const formatTimeForDisplay = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };
// =============================== COLLAPSIBLE BOTTOM BAR =============================== 

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
        <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Background layer with blend mode */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                {/* Content layer */}
                <div className="hidden md:block">
                    <BPoster Pics={mockPoster} />
                </div>
                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className={`relative flex flex-col h-full items-center ${!movieTicketData.branch._id ? 'justify-center' : 'justify-start'}`}>
                        <div className="h-5 md:h-7" />
                        {movieTicketData.branch._id && (
                            <>
                                <DateSlider 
                                    viewingDate={viewingDate}
                                    onDateSelect={handleDateSelect}
                                    uniqueDates={uniqueDates}
                                    selectedScheduleDate={selectedDateInfo?.date}
                                />
                                
                            </>
                        )}
                        <div className="w-[55vw] overflow-hidden rounded-xl pt-5 md:hidden">
                                    <BPoster Pics={mockPoster} />
                                </div>
                                <div className="h-5 md:h-7" />
                        <ChooseCinemaButton 
                            onClick={() => setIsCinemaPopupOpen(true)} 
                            label={movieTicketData.branch?.name}
                        />
                        
                        {movieTicketData.branch._id  && (
                            <>
                                <div className="h-3 md:h-5" />
                                <TimeGrid 
                                    selectedSchedule={movieTicketData.schedule}
                                    onScheduleSelect={handleScheduleSelect}
                                    schedules={schedules}
                                    viewingDate={viewingDate}
                                />
                            </>
                        )}
                        
                        <div className="h-5 sm:h-3 lg:h-10" />
                    </div>
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="w-80 justify-start text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            {!movieTicketData.branch._id ? (
                                <>
                                    Please select a cinema
                                    <br />
                                    to view available showtimes
                                </>
                            ) : movieTicketData.schedule._id ? (
                                <>
                                    {movieTicketData.schedule?.startTime
    ? new Date(movieTicketData.schedule.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    : ''
}, {formatTimeForDisplay(movieTicketData.schedule?.startTime)}
                                    <br />
                                    Cinema: {movieTicketData.branch.name}
                                </>
                            ) : (
                                <>
                                    Select a time
                                    <br />
                                    Cinema: {movieTicketData.branch.name}
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
{/* =============================== BOTTOM BAR ===============================  */}

                <div
                    className={`fixed right-0 bottom-0 left-0 z-50 flex h-15 flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
                >
                    <BackNaviButton onClick={onBack} />
                    <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">
                        Movie: {movieTicketData?.movie?.name || 'Tham Tu Kien'}
                        <br />
                          {!movieTicketData.branch._id ? (
                                <>
                                    Please select a cinema
                                    <br />
                                    to view available showtimes
                                </>
                            ) : movieTicketData.schedule._id ? (
                                <>
                                    {movieTicketData.schedule?.startTime
    ? new Date(movieTicketData.schedule.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    : ''
}, {formatTimeForDisplay(movieTicketData.schedule?.startTime)}
                                    <br />
                                    Cinema: {movieTicketData.branch.name}
                                </>
                            ) : (
                                <>
                                    Select a time
                                    <br />
                                    Cinema: {movieTicketData.branch.name}
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
{/* =============================== CINEMA POPUP ===============================  */}
            <CinemaPopUp 
                isOpen={isCinemaPopupOpen} 
                onClose={() => setIsCinemaPopupOpen(false)} 
                onCinemaSelect={handleBranchSelect}
                cinemas={cinemas}
                selectedCinema={movieTicketData.branch}
            />
        </div>
    );
};

export default MenuSelectScreen;
