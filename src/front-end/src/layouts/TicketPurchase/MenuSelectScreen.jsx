import { useState, useEffect } from 'react';
import BPoster from '../../components/UI/BPoster';
import NextNaviButton from '../../components/buttons/NaviButton';
import { BackNaviButton } from '../../components/buttons/NaviButton';

const TimeButton = ({ time, seats, scheduleId, isSelected, onSelect }) => {
    return (
        <button 
            className={`relative flex w-[38vw] flex-col items-center justify-center -space-y-1 rounded-xl md:w-[calc(100vw*0.12)] lg:w-[calc(100vw*0.10)] ${isSelected ? 'ring-2 ring-purple-400' : ''}`}
            onClick={() => onSelect(scheduleId)}
        >
            <div className={`absolute top-0 left-0 h-full w-full rounded-xl mix-blend-color-dodge lg:[transform:translate3d(0,0,0)] ${isSelected ? 'bg-purple-500/80' : 'bg-zinc-300/60'}`} />
            <div className="pt-2 font-['Unbounded'] text-[18px] font-bold text-white md:pt-1 md:text-[13px] lg:text-[15px]">{time}</div>
            <div className="pb-1 font-['Unbounded'] text-[10px] font-light text-white md:pb-0.5 md:text-[7px] lg:text-[8px]">{seats} seats left</div>
        </button>
    );
};

const TimeGrid = ({ time, selectedSchedule, onScheduleSelect }) => {
    // Mock schedule data - replace with actual API data
    const mockSchedules = [
        { id: 'schedule1', time: '07:00', availableSeats: 78 },
        { id: 'schedule2', time: '10:30', availableSeats: 65 },
        { id: 'schedule3', time: '14:00', availableSeats: 82 },
        { id: 'schedule4', time: '17:30', availableSeats: 45 },
        { id: 'schedule5', time: '20:00', availableSeats: 23 },
        { id: 'schedule6', time: '22:30', availableSeats: 90 },
    ];

    return (
        <div className="inline-flex w-[80vw] flex-wrap content-start items-start justify-center gap-3.5 md:w-[55vw] lg:w-[calc(100vw*0.45)]">
            {mockSchedules.map((schedule) => (
                <TimeButton 
                    key={schedule.id}
                    time={schedule.time} 
                    seats={schedule.availableSeats}
                    scheduleId={schedule.id}
                    isSelected={selectedSchedule === schedule.id}
                    onSelect={onScheduleSelect}
                />
            ))}
        </div>
    );
};

const SliderButton = ({ date, day, opacity = 'opacity-100' }) => {
    return (
        <div className={`relative aspect-square h-full ${opacity} mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]`}>
            <div className="absolute h-full w-full rounded-full bg-purple-600/70 outline-3 outline-white/70 md:outline-2 xl:outline-3" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 -space-y-1 sm:pt-0.5">
                <div className="font-['Unbounded'] text-[7px] font-bold text-white sm:text-[5.5px] lg:text-[7px]">{day}</div>
                <div className="font-['Unbounded'] text-[17px] font-bold text-white">{date}</div>
            </div>
        </div>
    );
};

export const SliderButtonInactive1 = ({ date, day }) => {
    return <SliderButton date={date} day={day} opacity="opacity-60" />;
};

export const SliderButtonInactive2 = ({ date, day }) => {
    return <SliderButton date={date} day={day} opacity="opacity-30" />;
};

const DateSlider = () => {
    return (
        <div className="flex h-auto w-auto flex-col items-center justify-center">
            <div className="flex h-10 w-auto flex-row items-center justify-between gap-4 md:h-10">
                <SliderButtonInactive2 date="1" day="Mon" />
                <SliderButtonInactive1 date="22" day="Tue" />
                <SliderButton date="3" day="Wed" />
                <SliderButtonInactive1 date="4" day="Thu" />
                <SliderButtonInactive2 date="5" day="Fri" />
            </div>
            <div className="hidden flex-row items-center justify-center gap-3 pt-3 md:flex md:gap-2 md:pt-2">
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                <div className="justify-start text-center font-['Unbounded'] text-[10px] font-semibold text-white sm:text-[12px]">Monday, 23th May, 2025</div>
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            </div>
        </div>
    );
};

const ChooseCinemaButton = () => (
    <button className="relative flex h-auto w-[80vw] items-center justify-center py-6 md:w-80 md:py-4 lg:w-[calc(100vw*0.24)] lg:py-5">
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        <div className="md:text-md absolute h-auto items-center justify-center pt-1 font-['Unbounded'] text-base font-black text-white">CHOOSE CINEMA</div>
    </button>
);

const MenuSelectScreen = ({ onNext, onBack, movieTicketData, updateMovieTicket }) => {
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(movieTicketData.branch || null);
    const [selectedDate, setSelectedDate] = useState(null);

    // Handle branch selection
    const handleBranchSelect = (branchId) => {
        setSelectedBranch(branchId);
        updateMovieTicket({ branch: branchId });
    };

    // Handle schedule selection
    const handleScheduleSelect = (scheduleId) => {
        updateMovieTicket({ schedule: scheduleId });
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        // Reset schedule when date changes
        updateMovieTicket({ schedule: null });
    };

    // Check if user can proceed to next step
    const canProceed = movieTicketData.branch && movieTicketData.schedule;

    const handleNext = () => {
        if (canProceed) {
            onNext();
        } else {
            alert('Please select both cinema and showtime before proceeding.');
        }
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
                    <div className="relative flex flex-col items-center justify-start">
                        <div className="h-5 md:h-7" />
                        <DateSlider />
                        <div className="w-[55vw] overflow-hidden rounded-xl pt-5 md:hidden">
                            <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
                        </div>
                        <div className="h-5 md:h-7" />
                        <ChooseCinemaButton />
                        <div className="h-3 md:h-5" />
                        <TimeGrid 
                            time="07:00" 
                            selectedSchedule={movieTicketData.schedule}
                            onScheduleSelect={handleScheduleSelect}
                        />
                        <div className="h-5 sm:h-3 lg:h-10" />
                    </div>
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="w-80 justify-start text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            Monday, 23th May, 2025, 07:00
                            <br />
                            Cinema: 123 NVC St, D3, HCM
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
                        Monday, 23th May, 2025, 07:00
                        <br />
                        Cinema: 123 NVC St, D3, HCM
                    </div>

                    <NextNaviButton 
                        text="SEATINGS" 
                        onClick={handleNext}
                        disabled={!canProceed}
                    />
                </div>
            </div>
        </div>
    );
};

export default MenuSelectScreen;
