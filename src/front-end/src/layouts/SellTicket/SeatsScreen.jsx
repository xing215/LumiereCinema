// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useEffect } from 'react';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import TicketSelect from '@components/UI/TicketSelect';
import SeatLayout, { Seats, CoupleSeat } from '@/layouts/TicketPurchase/SeatLayout';

// SweetAlert for popup notifications
import { showWarning } from '@utils/sweetalert.js';

// =============================================================================
// SEAT NAME COMPONENT
// =============================================================================

const SeatName = ({ type, text, isCouple = false }) => (
    <div className="flex w-auto flex-row items-center justify-start gap-3">
        {isCouple ? (
            <CoupleSeat 
                seatColor={type === 'Taken' ? 'bg-gray-400' : 'bg-yellow-400'} 
                canCursor={false} 
            />
        ) : (
            <Seats  
                type={type} 
                isSelected={type === 'Selected'} 
                seatColor={type === 'Taken' ? 'bg-gray-400' : 'bg-blue-400'} 
                canCursor={false} 
            />
        )}
        <div className="relative justify-start text-center font-['Unbounded'] text-xs font-normal text-white">
            {text}
        </div>
    </div>
);

// =============================================================================
// MAIN SEATS SCREEN COMPONENT
// =============================================================================

const SeatsScreen = ({
    seats = [],
    loading = false,
    movieTicketData,
    updateMovieTicket,
    onNext,
    onBack,
    clearSessionLoading,
    fetchSeats
}) => {
    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================

    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // =============================================================================
    // INITIALIZATION EFFECTS
    // =============================================================================

    // =============================================================================
    // INITIALIZATION EFFECTS
    // =============================================================================

    useEffect(() => {
        if (movieTicketData.schedule && (!seats || seats.length === 0) && fetchSeats) {
            fetchSeats(movieTicketData.schedule._id);
        }
    }, []);

    useEffect(() => {
        updateMovieTicket({ 
            total: movieTicketData?.adultTickets * 80000 + movieTicketData?.discountedTickets * 45000 
        });
    }, [movieTicketData?.adultTickets, movieTicketData?.discountedTickets]);

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

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleSeatToggle = (seatName) => {
        const seatNames = Array.isArray(seatName) ? seatName : [seatName];
        let newSelectedSeats = Array.isArray(movieTicketData?.seats) ? [...movieTicketData.seats] : [];
        let newAdultTickets = movieTicketData.adultTickets || 0;
        let newDiscountedTickets = movieTicketData.discountedTickets || 0;

        seatNames.forEach(name => {
            if (newSelectedSeats.includes(name)) {
                // Remove seat and corresponding ticket
                newSelectedSeats = newSelectedSeats.filter(seat => seat !== name);
                // Remove one adult ticket first, then discounted if no adult tickets
                if (newDiscountedTickets > 0) {
                    newDiscountedTickets--;
                } else if (newAdultTickets > 0) {
                    newAdultTickets--;
                }
            } else {
                // Add seat and automatically add an adult ticket
                newSelectedSeats.push(name);
                newAdultTickets++;
            }
        });

        console.log('Selected seats:', newSelectedSeats);
        console.log('Adult tickets:', newAdultTickets, 'Discounted tickets:', newDiscountedTickets);
        
        updateMovieTicket({ 
            seats: newSelectedSeats,
            adultTickets: newAdultTickets,
            discountedTickets: newDiscountedTickets
        });
    };

    const handleTicketChange = (ticketType, changeFn) => {
        const currentSeats = Array.isArray(movieTicketData?.seats) ? [...movieTicketData.seats] : [];
        const currentAdult = movieTicketData.adultTickets || 0;
        const currentDiscounted = movieTicketData.discountedTickets || 0;
        const totalSeats = currentSeats.length;
        
        if (ticketType === 'adult') {
            const newAdultCount = Math.max(0, Math.min(totalSeats, changeFn(currentAdult)));
            // Adjust discounted tickets to match total seats
            const newDiscountedCount = Math.max(0, totalSeats - newAdultCount);
            
            updateMovieTicket({ 
                adultTickets: newAdultCount,
                discountedTickets: newDiscountedCount
            });
        } else if (ticketType === 'discounted') {
            const newDiscountedCount = Math.max(0, Math.min(totalSeats, changeFn(currentDiscounted)));
            // Adjust adult tickets to match total seats
            const newAdultCount = Math.max(0, totalSeats - newDiscountedCount);
            
            updateMovieTicket({ 
                adultTickets: newAdultCount,
                discountedTickets: newDiscountedCount
            });
        }
    };

    const handleNext = () => {
        if (canProceed) {
            if (onNext) onNext();
        } else {
            showWarning('No Seats Selected', 'Please select at least one seat before proceeding.', 1000);
        }
    };

    // =============================================================================
    // COMPUTED VALUES
    // =============================================================================

    const canProceed = movieTicketData?.seats.length > 0;

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
            <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden w-[90%] relative">
                <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge" />
                
                <div className='flex flex-row w-full h-full'>
                    <div className="flex flex-col gap-8 items-center w-[30%] h-auto max-h-full m-5 pt-6">
                        <div className='flex flex-col gap-4 items-center justify-center w-full h-[40%]'>
                            <TicketSelect
                                ticket_type="Adult"
                                price={'80,000'}
                                amount={movieTicketData.adultTickets}
                                onChange={fn => handleTicketChange('adult', fn)}
                            />
                            <TicketSelect
                                ticket_type="Student/ Elders"
                                price={'45,000'}
                                amount={movieTicketData.discountedTickets}
                                onChange={fn => handleTicketChange('discounted', fn)}
                                hover_message='Please show your ID at the ticket counter.'
                            />
                        </div>
                        
                        <div className="flex flex-row pt-5 flex-wrap gap-4 items-center justify-center w-full">
                            <SeatName type="Normal" text="Normal Seat" />
                            <SeatName type="Taken" text="Taken Seat" />
                            <SeatName type="Couple" text="Couple Seat" isCouple={true} />
                            <SeatName type="Selected" text="Selected Seat" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-center w-full mr-6 mb-6">
                        <SeatLayout
                            schedule={movieTicketData?.schedule}
                            seatMap={seats?.seatsByRow}
                            screenMap={seats?.screen}
                            loading={loading}
                            selectedSeats={movieTicketData?.seats}
                            onClick={handleSeatToggle}
                            clearSessionLoading={clearSessionLoading}
                        />
                        <div className={`flex items-center justify-end`}>
                            <NextNaviButton onClick={handleNext} text={'SNACKS'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatsScreen;