// ================================ IMPORTS ================================
import { useState, useEffect } from 'react';
import BPoster from '@components/UI/BPoster';
import NextNaviButton from '@components/buttons/NaviButton';
import { BackNaviButton } from '@components/buttons/NaviButton';
import DateSlider from '@components/UI/Dateslider';
import CinemaPopUp from '@components/UI/CinemaPopUp';
import { useFetchBranches } from '@hooks/useBranch';
import { useGetSchedules } from '@hooks/useBranch';

// SweetAlert for popup notifications
import { showError, showWarning, showInfo } from '@utils/sweetalert.js';

// ================================ TIME SELECTION COMPONENTS ================================
const TimeButton = ({ time, seats, schedule, isSelected, onSelect }) => {
    return (
        <button
            className={`group ${seats <= 0 ? 'cursor-not-allowed opacity-50' : ''} relative flex w-[38vw] flex-col items-center justify-center -space-y-1 rounded-xl md:w-[calc(100vw*0.12)] lg:w-[calc(100vw*0.10)] ${isSelected ? 'outline-2 outline-white' : ''}`}
            onClick={onSelect}
            style={{ cursor: 'pointer' }}
            disabled={seats <= 0}
        >
            <div
                className={`absolute top-0 left-0 h-full w-full rounded-xl mix-blend-color-dodge group-hover:bg-zinc-300/70 lg:[transform:translate3d(0,0,0)] ${isSelected ? 'bg-zinc-300/80' : 'bg-zinc-300/60'}`}
            />
            <div className="pt-2 font-['Unbounded'] text-[18px] font-bold text-white md:pt-1 md:text-[15px] lg:text-[17px]">{time}</div>
            <div className="pb-1 font-['Unbounded'] text-[10px] font-light text-white md:pb-0.5 md:text-[10px] lg:text-[11px] xl:text-[12px]">{seats} seats left</div>
        </button>
    );
};

const TimeGrid = ({ selectedSchedule, onScheduleSelect, schedules, viewingDate, scheduleLoading }) => {
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    };

    const filteredSchedules = viewingDate
        ? schedules
              .filter((schedule) => {
                  // Convert to Vietnam timezone for accurate date comparison
                  const scheduleDate = new Date(schedule.startTime).toLocaleDateString('en-CA', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                  });
                  return scheduleDate === viewingDate;
              })
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        : [];

    return (
        <div className="inline-flex w-[80vw] flex-wrap content-start items-start justify-start gap-3.5 md:w-[55vw] md:justify-center lg:w-[calc(100vw*0.45)]">
            {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => (
                    <TimeButton
                        key={schedule._id}
                        time={formatTime(schedule.startTime)}
                        seats={schedule.availableSeatsCount}
                        isSelected={selectedSchedule._id === schedule._id}
                        onSelect={() => onScheduleSelect(schedule)}
                    />
                ))
            ) : (
                <div className="flex w-full items-center justify-center py-8">
                    <div className="font-['Unbounded'] text-sm font-semibold text-white/60">
                        {scheduleLoading ? '• • •' : schedules > 0 ? (viewingDate ? 'No showtimes available for this date' : 'Please select a date to view showtimes') : 'No showtimes available'}
                    </div>
                </div>
            )}
        </div>
    );
};

// ================================ CINEMA SELECTION COMPONENT ================================

export const ChooseCinemaButton = ({ onClick, label, loading, branches, error }) => (
    <button
        className="group relative flex h-auto w-[80vw] max-w-[500px] cursor-pointer items-center justify-center py-3 hover:cursor-pointer md:w-80 lg:w-[calc(100vw*0.28)]"
        style={{ cursor: 'pointer' }}
        onClick={loading || branches.length === 0 || error ? () => {} : onClick}
    >
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge group-hover:bg-zinc-300/70 lg:[transform:translate3d(0,0,0)]" />
        <div className="md:text-md mx-2 h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white">
            {loading || branches.length === 0 || error ? '• • •' : label ? label.toUpperCase() : 'CHOOSE CINEMA'}
        </div>
    </button>
);

// ================================ MAIN COMPONENT ================================

const MenuSelectScreen = ({ onNext, onBack, movieTicketData, updateMovieTicket, fetchSeats, getSnacks }) => {
    // ================================ STATE MANAGEMENT ================================
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(movieTicketData.branch);
    const [isCinemaPopupOpen, setIsCinemaPopupOpen] = useState(false);

    // ================================ HOOKS ================================
    const { fetchBranches, branches, loading: branchLoading, error: branchError } = useFetchBranches();
    const { schedules, loading: scheduleLoading, error: schedulesError, fetchSchedules } = useGetSchedules();

    // ================================ DATA FETCHING EFFECTS ================================

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (movieTicketData.branch._id && movieTicketData.schedule.movie._id) {
            fetchSchedules(movieTicketData.schedule.movie._id, movieTicketData.branch._id);
        }
    }, [movieTicketData.branch._id, movieTicketData.schedule.movie._id]);

    // ================================ DATE MANAGEMENT ================================

    const uniqueDates = [
        ...new Set(
            schedules.map((schedule) => {
                // Convert to Vietnam timezone for accurate date grouping
                return new Date(schedule.startTime).toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                });
            }),
        ),
    ]
        .sort()
        .map((dateStr) => ({ date: dateStr }));

    const getFirstAvailableDate = () => {
        if (uniqueDates.length > 0) {
            return uniqueDates[0];
        }
        return null;
    };

    const firstDate = getFirstAvailableDate();
    const [viewingDate, setViewingDate] = useState(getFirstAvailableDate()?.date || null);

    useEffect(() => {
        if (firstDate?.date) {
            setViewingDate(firstDate.date);
        }
    }, [firstDate?.date]);

    const getSelectedDate = () => {
        if (movieTicketData.schedule?._id) {
            // Convert to Vietnam timezone for accurate date display
            const selectedDate = new Date(movieTicketData.schedule.startTime).toLocaleDateString('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh',
            });
            return { date: selectedDate };
        }
        return null;
    };

    const selectedDateInfo = getSelectedDate();

    // ================================ EVENT HANDLERS ================================

    const handleBranchSelect = (branch) => {
        updateMovieTicket({ branch: branch });
    };

    const handleScheduleSelect = (schedule) => {
        updateMovieTicket({
            ...movieTicketData,
            schedule: {
                ...schedule,
                movie: movieTicketData.schedule.movie,
            },
            seats: [],
        });
    };

    const handleDateSelect = (date) => {
        setViewingDate(date);
    };

    // ================================ NAVIGATION FUNCTIONS ================================

    const canProceed = movieTicketData.branch._id && movieTicketData.schedule._id;

    const handleNext = () => {
        if (canProceed) {
            onNext();
            fetchSeats(movieTicketData.schedule._id);
            getSnacks(movieTicketData?.branch?._id);
        } else {
            if (!movieTicketData.branch._id) {
                showInfo('Selection Required', 'Please select a cinema first.');
            } else if (!movieTicketData.schedule._id) {
                showInfo('Selection Required', 'Please select a showtime.');
            } else {
                showInfo('Selection Required', 'Please select both cinema and showtime before proceeding.');
            }
        }
    };

    // ================================ UTILITY FUNCTIONS ================================
    const formatTimeForDisplay = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    };

    // ================================ SCROLL EFFECTS ================================

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

    // ================================ RENDER ================================

    return (
        <div className="relative flex w-screen items-center justify-center overflow-hidden pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />

                {/* Content layer */}
                <div className="hidden md:block">
                    <BPoster Pics={movieTicketData?.schedule?.movie?.poster} />
                </div>

                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className={`relative flex h-full flex-col items-center ${!movieTicketData.branch._id ? 'justify-center' : 'justify-start'}`}>
                        <div className="h-5 md:h-7" />

                        {/* Date Slider */}
                        {movieTicketData.branch._id && (
                            <DateSlider viewingDate={viewingDate} onDateSelect={handleDateSelect} uniqueDates={uniqueDates} selectedScheduleDate={selectedDateInfo?.date} loading={scheduleLoading} />
                        )}

                        {/* Mobile Poster */}
                        <div className="w-[55vw] overflow-hidden rounded-xl pt-5 md:hidden">
                            <BPoster Pics={movieTicketData?.schedule?.movie?.poster} />
                        </div>
                        <div className="h-5 md:h-7" />

                        {/* Cinema Selection Button */}
                        <ChooseCinemaButton onClick={() => setIsCinemaPopupOpen(true)} label={movieTicketData.branch?.name} loading={branchLoading} branches={branches} error={branchError} />

                        {/* Time Grid */}
                        {movieTicketData.branch._id && (
                            <>
                                <div className="h-3 md:h-5" />
                                <TimeGrid
                                    selectedSchedule={movieTicketData.schedule}
                                    onScheduleSelect={handleScheduleSelect}
                                    schedules={schedules}
                                    viewingDate={viewingDate}
                                    scheduleLoading={scheduleLoading}
                                />
                            </>
                        )}

                        <div className="h-5 sm:h-3 lg:h-10" />
                    </div>

                    {/* Desktop Navigation */}
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
                                              year: 'numeric',
                                              timeZone: 'Asia/Ho_Chi_Minh',
                                          })
                                        : ''}
                                    , {formatTimeForDisplay(movieTicketData.schedule?.startTime)}
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
                        <NextNaviButton text="SEATINGS" onClick={handleNext} disabled={!canProceed} />
                    </div>
                </div>

                {/* Mobile Bottom Bar */}
                <div
                    className={`fixed right-0 bottom-0 left-0 z-50 flex h-auto flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
                >
                    <BackNaviButton onClick={onBack} />
                    <div className="relative flex-1 py-2 text-center font-['Unbounded'] text-[9px] font-semibold text-white">
                        Movie: {movieTicketData?.schedule?.movie?.name}
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
                                          year: 'numeric',
                                          timeZone: 'Asia/Ho_Chi_Minh',
                                      })
                                    : ''}
                                , {formatTimeForDisplay(movieTicketData.schedule?.startTime)}
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
                    <NextNaviButton text="SEATINGS" onClick={handleNext} disabled={!canProceed} />
                </div>
            </div>

            {/* Cinema Selection Popup */}
            <CinemaPopUp isOpen={isCinemaPopupOpen} onClose={() => setIsCinemaPopupOpen(false)} onCinemaSelect={handleBranchSelect} cinemas={branches} selectedCinema={movieTicketData.branch} />
        </div>
    );
};

export default MenuSelectScreen;
