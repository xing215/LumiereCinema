import { isStaff } from '@/utils/auth.utils';
import React from 'react';

const TicketDetail = ({ movieTicketData, snackTicketData, isStaff = false }) => {
    // Helpers for safe data extraction
    const movie = movieTicketData?.schedule?.movie || {};
    const movieTitle = movie.name || movie.title || 'N/A';
    const address = movieTicketData?.branch?.address || 'N/A';

    const startTime = movieTicketData?.schedule?.startTime;
    const endTime = movieTicketData?.schedule?.endTime;
    const date = startTime
        ? new Date(startTime).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'N/A';
    const formatTime = (date) => {
        // Remove AM/PM by using hour12: false
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    const time = startTime && endTime
        ? `${formatTime(startTime)} - ${formatTime(endTime)}`
        : 'N/A';

    const screen = movieTicketData?.schedule?.screen?.name || 'N/A';

    const seats = Array.isArray(movieTicketData?.seats)
        ? movieTicketData.seats.map(s => s.seatNumber || s).join(', ')
        : 'N/A';

    const tickets = (movieTicketData?.adultTickets === 0 && movieTicketData?.discountedTickets === 0) ? 'N/A' : (movieTicketData?.adultTickets > 0  ? `${movieTicketData?.adultTickets} Adult Ticket(s)` : '') + (movieTicketData?.adultTickets > 0 && movieTicketData?.discountedTickets > 0 ? `, ` : '' ) + (movieTicketData?.discountedTickets>0 ? `${movieTicketData?.discountedTickets} Student/Elder Ticket(s)` : '');

    const snackCombos = Array.isArray(snackTicketData?.snackList)
        ? snackTicketData.snackList.map(c => `${c.quantity} ${c.name}`).join(', ')
        : 'N/A';
    const discountValue = -((snackTicketData?.discount || 0) + (movieTicketData?.discount || 0));

    const total = (movieTicketData?.total || 0) + (snackTicketData?.total || 0) + discountValue;

    const isEmpty = val =>
        val === 'N/A' ||
        val === '' ||
        (Array.isArray(val) && val.length === 0) ||
        val === undefined ||
        val === null;


    const promotion = snackTicketData?.promotion || movieTicketData?.promotion;
    return (
        <div className={`relative mx-auto flex w-full ${isStaff ? 'h-full' : 'h-auto'} min-h-full flex-col items-center justify-start overflow-hidden rounded-xl`}>
            <div className="absolute h-full w-full inset-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            <div className={`relative z-10 max-w-[600px] flex w-full h-full flex-col items-center justify-start gap-2 px-7 py-4 md:px-6 lg:px-8`}>
                {!isStaff && <div className="self-stretch pt-1 text-center font-['Unbounded'] text-base lg:text-xl font-black text-white">
                    TICKET DETAILS
                </div>}
                <div className="h-px w-40" />
                <div className="flex w-full flex-col items-start justify-start gap-2">
                    <div className={`flex w-[73vw] flex-wrap md:flex-nowrap gap-8 -space-y-4 md:w-auto md:flex-col ${isStaff ? 'md:gap-1' : 'md:gap-2'} md:space-y-0 flex-1 justify-start items-start`}>
                        {!isEmpty(movieTitle) && (
                            <Detail label="Movie" value={movieTitle} isStaff={isStaff} />
                        )}
                        {!isEmpty(address) && (
                            <Detail label="Address" value={address} isStaff={isStaff} />
                        )}
                        {!isEmpty(date) && (
                            <Detail label="Date" value={date} isStaff={isStaff} />
                        )}
                        {!isEmpty(tickets) && (
                            <Detail label="Tickets" value={tickets} isStaff={isStaff} />
                        )}
                        {!isEmpty(seats) && (
                            <Detail label="Seats" value={seats} isStaff={isStaff} />
                        )}
                        {!isEmpty(snackCombos) && (
                            <Detail label="Snack" value={snackCombos} isStaff={isStaff} />
                        )}
                        {(!isEmpty(time) || !isEmpty(screen)) && (
                            <div className="mt-1 flex flex-row w-full items-start justify-start gap-2">
                                {!isEmpty(time) && (
                                    <Detail label="Time" value={time} width="md:w-[50%] w-full" isStaff={isStaff} />
                                )}
                                {!isEmpty(screen) && (
                                    <Detail label="Screen" value={screen} width="md:w-[40%] w-full" isStaff={isStaff} />
                                )}
                            </div>
                        )}
                    </div>
                    {!isEmpty(promotion) && (
                            <Detail label="Promotion" value={promotion} isStaff={isStaff} />
                        )}
                        {discountValue !== 0 && (
                            <>
                                <div className="lg:text-md w-auto font-['Unbounded'] text-xs lg:text-[15px] font-semibold text-white">
                                    <Detail label="Subtotal" value={(total - discountValue).toLocaleString('en-US')} isStaff={isStaff} />
                                    <Detail label="Discount amount" value={discountValue.toLocaleString('en-US')} isStaff={isStaff} />
                                </div>
                            </>
                        )}
                    <div className="lg:text-lg w-auto font-['Unbounded'] text-md font-semibold text-white">
                        Total: <br/> {total.toLocaleString('en-US')} vnd
                    </div>
                </div>
            </div>
        </div>
    );
};

// Small presentational component for label/value pairs
const Detail = ({ label, value, width = "w-auto", isStaff=false }) => (
    <div className={`lg:text-md ${width} ${isStaff ? 'line-clamp-2' : 'line-clamp-4'} font-['Unbounded'] text-xs lg:text-[15px] font-semibold text-white`}>
        {label}:<br />
        {value}
    </div>
);

export default TicketDetail;
