// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useEffect } from 'react';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import TicketSelect from '@components/UI/TicketSelect';
import SeatLayout, { Seats, CoupleSeat, getSeatPrice, FALLBACK_PRICES } from '@/layouts/TicketPurchase/SeatLayout';

// SweetAlert for popup notifications
import { showWarning } from '@utils/sweetalert.js';

// =============================================================================
// SEAT NAME COMPONENT
// =============================================================================

const SeatName = ({ type, text, isCouple = false, isVip = false }) => (
    <div className="flex w-auto flex-row items-center justify-start gap-3">
        {isCouple ? (
            <CoupleSeat seatColor={type === 'Taken' ? 'bg-gray-400' : 'bg-indigo-400'} canCursor={false} />
        ) : (
            <Seats type={type} isSelected={type === 'Selected'} seatColor={type === 'Taken' ? 'bg-gray-400' : isVip ? 'bg-red-400' : 'bg-blue-400'} canCursor={false} />
        )}
        <div className="relative justify-start text-center font-['Unbounded'] text-xs font-normal text-white">{text}</div>
    </div>
);

// =============================================================================
// MAIN SEATS SCREEN COMPONENT
// =============================================================================

const SeatsScreen = ({ seats = [], loading = false, movieTicketData, updateMovieTicket, onNext, onBack, clearSessionLoading, fetchSeats }) => {
    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================

    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // =============================================================================
    // INITIALIZATION EFFECTS
    // =============================================================================

    useEffect(() => {
        if (movieTicketData.schedule && (!seats || seats.length === 0) && fetchSeats) {
            fetchSeats(movieTicketData.schedule._id);
        }
    }, []);

    useEffect(() => {
        const total = calculateTotalPrice();
        updateMovieTicket({ total: total });
    }, [movieTicketData?.seats, movieTicketData?.adultTickets, movieTicketData?.discountedTickets, seats]);

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
    // UTILITY FUNCTIONS
    // =============================================================================

    // Calculate total price based on selected seats and ticket types
    const calculateTotalPrice = () => {
        if (!movieTicketData?.seats || !seats?.seatsByRow) {
            return 0;
        }

        // Get both regular and discounted prices for each selected seat
        const seatPriceData = movieTicketData.seats.map((seatNumber) => {
            const rowLetter = seatNumber.charAt(0);
            const rowSeats = seats.seatsByRow[rowLetter];

            if (!rowSeats) {
                return {
                    seatNumber,
                    regularPrice: FALLBACK_PRICES.normal.regular,
                    discountedPrice: FALLBACK_PRICES.normal.discounted,
                };
            }

            const seat = rowSeats.find((s) => s.seatNumber === seatNumber);
            if (!seat) {
                return {
                    seatNumber,
                    regularPrice: FALLBACK_PRICES.normal.regular,
                    discountedPrice: FALLBACK_PRICES.normal.discounted,
                };
            }

            return {
                seatNumber,
                regularPrice: getSeatPrice(seat, false),
                discountedPrice: getSeatPrice(seat, true),
            };
        });

        // Sort by discounted price (cheapest discounted price first) to prioritize cheaper seats for discount tickets
        const sortedSeats = [...seatPriceData].sort((a, b) => a.discountedPrice - b.discountedPrice);

        let total = 0;
        let discountTicketsUsed = 0;
        const maxDiscountTickets = movieTicketData.discountedTickets || 0;

        // Assign discount tickets to seats with cheapest discounted prices first
        sortedSeats.forEach((seatData) => {
            if (discountTicketsUsed < maxDiscountTickets) {
                // Use discounted price
                total += seatData.discountedPrice;
                discountTicketsUsed++;
            } else {
                // Use regular price for adult tickets
                total += seatData.regularPrice;
            }
        });

        return total;
    };

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleSeatToggle = (seatName) => {
        const seatNames = Array.isArray(seatName) ? seatName : [seatName];
        let newSelectedSeats = Array.isArray(movieTicketData?.seats) ? [...movieTicketData.seats] : [];
        let newAdultTickets = movieTicketData.adultTickets || 0;
        let newDiscountedTickets = movieTicketData.discountedTickets || 0;

        seatNames.forEach((name) => {
            if (newSelectedSeats.includes(name)) {
                // Remove seat and corresponding ticket
                newSelectedSeats = newSelectedSeats.filter((seat) => seat !== name);
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
            discountedTickets: newDiscountedTickets,
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
                discountedTickets: newDiscountedCount,
            });
        } else if (ticketType === 'discounted') {
            const newDiscountedCount = Math.max(0, Math.min(totalSeats, changeFn(currentDiscounted)));
            // Adjust adult tickets to match total seats
            const newAdultCount = Math.max(0, totalSeats - newDiscountedCount);

            updateMovieTicket({
                adultTickets: newAdultCount,
                discountedTickets: newDiscountedCount,
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
        <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
            <div className="relative flex h-[80vh] w-[90%] items-start justify-center overflow-hidden rounded-xl">
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-zinc-300/30 mix-blend-color-dodge" />

                <div className="flex h-full w-full flex-row">
                    <div className="m-5 flex h-auto max-h-full w-[30%] flex-col items-center gap-8 pt-6">
                        <div className="flex h-[40%] w-full flex-col items-center justify-center gap-4">
                            <TicketSelect ticket_type="Adult" amount={movieTicketData.adultTickets} onChange={(fn) => handleTicketChange('adult', fn)} />
                            <TicketSelect
                                ticket_type="Student/ Elders"
                                amount={movieTicketData.discountedTickets}
                                onChange={(fn) => handleTicketChange('discounted', fn)}
                                hover_message="Please show your ID at the ticket counter."
                            />
                        </div>

                        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-4 pt-5">
                            <SeatName type="Normal" text="Normal Seat" />
                            <SeatName type="Normal" text="VIP Seat" isVip={true} />
                            <SeatName type="Taken" text="Taken Seat" />
                            <SeatName type="Couple" text="Couple Seat" isCouple={true} />
                            <SeatName type="Selected" text="Selected Seat" />
                        </div>

                        {/* Total Price Display */}
                        <div className="mt-4 w-full text-center">
                            <div className="font-['Unbounded'] text-sm font-semibold text-white">Total: {movieTicketData?.total ? movieTicketData.total.toLocaleString('en-US') : '0'} VND</div>
                        </div>
                    </div>

                    <div className="mr-6 mb-6 flex w-full flex-col justify-center">
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
