import { useState, useEffect } from 'react';
import BPoster from '@components/UI/BPoster';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import TicketSelect from '@components/UI/TicketSelect';
import { useGetSeatsBySchedule } from '@/hooks/useTicket';
import SeatLayout, {Seats, CoupleSeat} from '@/layouts/TicketPurchase/SeatLayout';

const SeatName = ({ type, text, isCouple = false }) => (
    <div className="flex w-auto flex-row items-center justify-start gap-3">
        {isCouple ? (
            <CoupleSeat seatColor={type === 'Taken' ? 'bg-gray-400' : 'bg-yellow-400'} canCursor={false} />
        ) : (
            <Seats  type={type} isSelected={type === 'Selected'} seatColor={type === 'Taken' ? 'bg-gray-400' : 'bg-blue-400'} canCursor={false} />
        )}
        <div className="relative justify-start text-center font-['Unbounded'] text-xs font-normal text-white">{text}</div>
    </div>
);

const MenuSelectSeats = ({ 
    onNext, 
    onBack, 
    movieTicketData, 
    updateMovieTicket, 
    heldSeats = [], // Seats held by current session
    currentSession = null, // Current session info
    clearSessionLoading
}) => {
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { seats, loading: ScheduleLoading, error, fetchSeats } = useGetSeatsBySchedule();

    useEffect(() => {
        if (movieTicketData.schedule) {
            fetchSeats(movieTicketData.schedule._id);
        }
    }, [movieTicketData.schedule, heldSeats]);

    // Handle seat selection/deselection
    // Accept seatName as string or array, flatten, and update seats
    const handleSeatToggle = (seatName) => {
        // Always treat seatName as array
        const seatNames = Array.isArray(seatName) ? seatName : [seatName];
        let newSelectedSeats = Array.isArray(movieTicketData?.seats) ? [...movieTicketData.seats] : [];
        
        seatNames.forEach(name => {
            if (newSelectedSeats.includes(name)) {
                // If seat is already selected, unselect it
                newSelectedSeats = newSelectedSeats.filter(seat => seat !== name);
            } else {
                // If seat is not selected, select it
                newSelectedSeats.push(name);
            }
        });

      // Prevent leaving a single unselected seat ('gap') between two selected seats in the same row
// Only check around the selected seats, not the entire row
if (seats && seats.seatsByRow) {
    // Build a map of selected seats by row
    const selectedByRow = {};
    newSelectedSeats.forEach(seat => {
        const row = seat.charAt(0);
        if (!selectedByRow[row]) selectedByRow[row] = [];
        selectedByRow[row].push(seat);
    });
    
    // Check for gaps only around selected seats
    let hasGap = false;
    
    newSelectedSeats.forEach(selectedSeat => {
        const row = selectedSeat.charAt(0);
        const rowSeats = seats.seatsByRow[row];
        
        if (!rowSeats) return;
        
        // Find the index of the selected seat in the row
        const seatIndex = rowSeats.findIndex(s => s.seatNumber === selectedSeat);
        if (seatIndex === -1) return;
        
        const selected = selectedByRow[row] || [];
        
        // Check both sides of the selected seat for potential gaps
        const checkSide = (adjacentIndex, farIndex) => {
            if (adjacentIndex < 0 || adjacentIndex >= rowSeats.length) return false;
            if (farIndex < 0 || farIndex >= rowSeats.length) return false;
            
            const adjacentSeat = rowSeats[adjacentIndex];
            const farSeat = rowSeats[farIndex];
            
            // Check if adjacent seat is empty/available
            const adjacentIsSelected = selected.includes(adjacentSeat.seatNumber);
            const adjacentIsTaken = adjacentSeat.isTaken || adjacentSeat.status === 'occupied';
            const adjacentIsHeldByOthers = adjacentSeat.status === 'holding' && !heldSeats.includes(adjacentSeat.seatNumber);
            const adjacentIsFilled = adjacentIsSelected || adjacentIsTaken || adjacentIsHeldByOthers;
            
            // Check if far seat is filled
            const farIsSelected = selected.includes(farSeat.seatNumber);
            const farIsTaken = farSeat.isTaken || farSeat.status === 'occupied';
            const farIsHeldByOthers = farSeat.status === 'holding' && !heldSeats.includes(farSeat.seatNumber);
            const farIsFilled = farIsSelected || farIsTaken || farIsHeldByOthers;
            
            // Gap exists if adjacent is empty but far is filled
            return !adjacentIsFilled && farIsFilled;
        };
        
        // Check left side: selected -> empty -> filled
        if (checkSide(seatIndex - 1, seatIndex - 2)) {
            hasGap = true;
            return;
        }
        
        // Check right side: selected -> empty -> filled
        if (checkSide(seatIndex + 1, seatIndex + 2)) {
            hasGap = true;
            return;
        }
    });
    
    if (hasGap) {
        alert('You cannot leave a single seat between selections.');
        return;
    }
}

        if (newSelectedSeats.length > (movieTicketData.adultTickets + movieTicketData.discountedTickets)) {
            alert('Please add more tickets');
        } else {
            if (newSelectedSeats.length < movieTicketData.discountedTickets)
                updateMovieTicket({total: newSelectedSeats.length * 45000});
            else
                updateMovieTicket({ total: movieTicketData.discountedTickets*45000 + (newSelectedSeats.length - movieTicketData.discountedTickets) * 80000 });
            updateMovieTicket({ seats: newSelectedSeats });
        }
    };

    // Check if user can proceed
    const canProceed = movieTicketData?.seats.length > 0;

    const handleNext = () => {
        if (canProceed) {
            if ((movieTicketData.adultTickets + movieTicketData.discountedTickets) !== movieTicketData?.seats.length) {
                alert('Please select the same number of seats as tickets.');
            } else {
                onNext();
            }
        } else {
            alert('Please select at least one seat before proceeding.');
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
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[75vw]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                {/* Poster */}
                <div className="relative hidden md:block">
                    <BPoster Pics={movieTicketData?.schedule?.movie?.poster} />
                </div>
                {/* Main content */}
                <div className="relative flex min-w-[56vw] flex-1 flex-col items-center justify-between">
                    <div className="relative flex flex-col md:flex-row gap-5 items-center justify-between px-4 py-5 md:px-6 md:h-[407px]">
                        <div className="relative flex shrink flex-row items-center justify-start md:w-[90%] xl:w-[40%] md:flex-col lg:justify-start lg:gap-1">
                        <TicketSelect
                            ticket_type="Adult"
                            price={'80,000'}
                            amount={movieTicketData.adultTickets}
                            onChange={fn => updateMovieTicket({ adultTickets: fn(movieTicketData.adultTickets) })}
                        />
                        <div className="h-2 w-10 md:h-3 lg:h-0" />
                        <TicketSelect
                            ticket_type="Student/ Elders"
                            price={'45,000'}
                            amount={movieTicketData.discountedTickets}
                            onChange={fn => updateMovieTicket({ discountedTickets: fn(movieTicketData.discountedTickets) })}
                            hover_message='Please show your ID at the ticket counter.'
                        />
                            <div className="h-4 md:h-2" />

                            <div className="hidden h-auto w-full flex-row flex-wrap justify-start gap-2 md:flex">
                                <SeatName type="Normal" text="Normal Seat" />
                                <SeatName type="Taken" text="Taken Seat" />
                                <SeatName type="Couple" text="Couple Seat" isCouple={true} />
                                <SeatName type="Selected" text="Selected Seat" />
                            </div>
                        </div>
                        <div className="flex h-auto w-full flex-row flex-wrap justify-center gap-3 py-5 md:hidden">
                            <SeatName type="Normal" text="Normal Seat" />
                            <SeatName type="Taken" text="Taken Seat" />
                            <SeatName type="Couple" text="Couple Seat" isCouple={true} />
                            <SeatName type="Selected" text="Selected Seat" />

                        </div>
                        {/* <div className="relative flex justify-center scale-100 md:scale-100 lg:scale-90 xl:scale-75 xl:m-7 md:m-8 w-[50vw] md:w-[30vw] lg:h-auto"> */}
                        <div className="relative flex justify-center w-[80vw] md:w-[37vw] xl:w-full h-full">
                            <SeatLayout 
                                schedule={movieTicketData?.schedule} 
                                seatMap={seats.seatsByRow} 
                                screenMap={seats.screen} 
                                loading={ScheduleLoading} 
                                selectedSeats={movieTicketData?.seats} 
                                heldSeats={heldSeats} // Pass held seats
                                onClick={handleSeatToggle}
                                clearSessionLoading={clearSessionLoading}
                            />
                        </div>
                        
                    </div>
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="w-80 justify-start text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            {movieTicketData.adultTickets > 0 && <>{movieTicketData.adultTickets} Adult Ticket(s)</>}{movieTicketData.adultTickets > 0 && movieTicketData.discountedTickets > 0 && <>, </>}{movieTicketData.discountedTickets > 0 && <>{movieTicketData.discountedTickets} Student/Elder Ticket(s)</>}
                            <br />
                            Seats: {movieTicketData?.seats && movieTicketData.seats.length > 0 ? movieTicketData.seats.join(', ') : 'None selected'}
                        </div>
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="SEATINGS" onClick={handleNext} />
                    </div>

                    <div className={`fixed right-0 bottom-0 left-0 z-50 flex h-auto flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`} style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}>
                        <BackNaviButton onClick={onBack} />
                        <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white py-2">
                            Movie: {movieTicketData?.schedule?.movie?.name || 'Movie Name'}
                            <br />
                            {movieTicketData.adultTickets > 0 && <>{movieTicketData.adultTickets} Adult Ticket(s)</>}{movieTicketData.adultTickets > 0 && movieTicketData.discountedTickets > 0 && <>, </>}{movieTicketData.discountedTickets > 0 && <>{movieTicketData.discountedTickets} Student/Elder Ticket(s)</>}
                            <br />
                            Seats: {movieTicketData?.seats && movieTicketData.seats.length > 0 ? movieTicketData.seats.join(', ') : 'None selected'}
                        </div>

                <NextNaviButton text="INFO" onClick={handleNext} />
            </div>
                </div>


            </div>
        </div>
    );
};

export default MenuSelectSeats;
