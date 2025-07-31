import { useState, useEffect } from 'react';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import TicketSelect from '@components/UI/TicketSelect';
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
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        if (movieTicketData.schedule && (!seats || seats.length === 0) && fetchSeats) {
            fetchSeats(movieTicketData.schedule._id);
        }
    }, []);

    // Handle seat selection/deselection
    const handleSeatToggle = (seatName) => {
        const seatNames = Array.isArray(seatName) ? seatName : [seatName];
        let newSelectedSeats = Array.isArray(movieTicketData?.seats) ? [...movieTicketData.seats] : [];

        seatNames.forEach(name => {
            if (newSelectedSeats.includes(name)) {
                newSelectedSeats = newSelectedSeats.filter(seat => seat !== name);
            } else {
                newSelectedSeats.push(name);
            }
        });

        if (newSelectedSeats.length > (movieTicketData.adultTickets + movieTicketData.discountedTickets)) {
            alert('Please add more tickets');
        } else {
            console.log('Selected seats:', newSelectedSeats);
            console.log('Current movie ticket data:', movieTicketData);
            updateMovieTicket({ seats: newSelectedSeats });
        }
    };

    useEffect(() => {
        updateMovieTicket({ total: movieTicketData?.adultTickets * 80000 + movieTicketData?.discountedTickets * 45000 });
    }, [movieTicketData?.adultTickets, movieTicketData?.discountedTickets]);

    
    const canProceed = movieTicketData?.seats.length > 0;

    const handleNext = () => {
        if (canProceed) {
            if ((movieTicketData.adultTickets + movieTicketData.discountedTickets) !== movieTicketData?.seats.length) {
                alert('Please select the same number of seats as tickets.');
            } else {
                if (onNext) onNext();
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
                        onChange={fn => updateMovieTicket({ adultTickets: fn(movieTicketData.adultTickets) })}
                        // max={Infinity}
                    />
                    <TicketSelect
                        ticket_type="Student/ Elders"
                        price={'45,000'}
                        amount={movieTicketData.discountedTickets}
                        onChange={fn => updateMovieTicket({ discountedTickets: fn(movieTicketData.discountedTickets) })}
                        hover_message='Please show your ID at the ticket counter.'
                        // max={Infinity}
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