import React from 'react';

const TicketDetail = ({ movieTicketData, snackTicketData }) => {
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
        (Array.isArray(val) && val.length === 0);


    const promotion = snackTicketData?.promotion || movieTicketData?.promotion;
    return (
        <div className="relative mx-auto flex w-full h-auto min-h-full flex-col items-center justify-start overflow-hidden rounded-xl">
            <div className="absolute h-full w-full inset-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            <div className="relative z-10 flex w-full h-full flex-col items-center justify-start gap-2 px-7 py-4 md:px-6 lg:px-8">
                <div className="self-stretch pt-1 text-center font-['Unbounded'] text-base lg:text-xl font-black text-white">
                    TICKET DETAILS
                </div>
                <div className="h-px w-40" />
                <div className="flex w-full flex-col items-start justify-start gap-2">
                    <div className="flex w-[73vw] flex-wrap md:flex-nowrap gap-8 -space-y-4 md:w-auto md:flex-col md:gap-2 md:space-y-0 flex-1 justify-start items-start">
                        {!isEmpty(movieTitle) && (
                            <Detail label="Movie" value={movieTitle} />
                        )}
                        {!isEmpty(address) && (
                            <Detail label="Address" value={address} />
                        )}
                        {!isEmpty(date) && (
                            <Detail label="Date" value={date} />
                        )}
                        {!isEmpty(tickets) && (
                            <Detail label="Tickets" value={tickets} />
                        )}
                        {!isEmpty(seats) && (
                            <Detail label="Seats" value={seats} />
                        )}
                        {!isEmpty(snackCombos) && (
                            <Detail label="Snack" value={snackCombos} />
                        )}
                        {(!isEmpty(time) || !isEmpty(screen)) && (
                            <div className="mt-2 flex flex-row w-full items-start justify-start gap-2">
                                {!isEmpty(time) && (
                                    <Detail label="Time" value={time} width="md:w-[50%] w-full" />
                                )}
                                {!isEmpty(screen) && (
                                    <Detail label="Screen" value={screen} width="md:w-[40%] w-full" />
                                )}
                            </div>
                        )}
                    </div>
                    {!isEmpty(promotion) && (
                            <Detail label="Promotion" value={promotion} />
                        )}
                        {discountValue !== 0 && (
                            <Detail label="Discount amount" value={discountValue.toLocaleString('en-US')} />
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
const Detail = ({ label, value, width = "w-auto" }) => (
    <div className={`lg:text-md ${width} font-['Unbounded'] text-xs lg:text-[15px] font-semibold text-white`}>
        {label}:<br />
        {value}
    </div>
);

export default TicketDetail;
