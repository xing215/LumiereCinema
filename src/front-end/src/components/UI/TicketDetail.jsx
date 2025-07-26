const TicketDetail = ({ movieTicketData, snackTicketData }) => {
    // Fallbacks for missing data, matching TicketPurchase structure
    const movieTitle = movieTicketData?.schedule?.movie?.name || movieTicketData?.schedule?.movie?.title || 'N/A';
    const address = movieTicketData?.branch?.address || 'N/A';
    const date = movieTicketData?.schedule?.startTime
        ? new Date(movieTicketData.schedule.startTime).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'N/A';
    const time =
        movieTicketData?.schedule?.startTime && movieTicketData?.schedule?.endTime
            ? `${new Date(movieTicketData.schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(movieTicketData.schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'N/A';
    const screen = movieTicketData?.schedule?.screenName || 'N/A';
    const seats = Array.isArray(movieTicketData?.seats)
        ? movieTicketData.seats.map(s => s.seatNumber || s).join(', ')
        : 'N/A';
    const tickets = movieTicketData?.ticketTypes
        ? movieTicketData.ticketTypes.map(t => `${t.count} ${t.type}`).join(', ')
        : (Array.isArray(movieTicketData?.seats) ? `${movieTicketData.seats.length} Ticket(s)` : 'N/A');
    const snackCombos = Array.isArray(snackTicketData?.snackList)
        ? snackTicketData.snackList.map(c => `${c.quantity} ${c.name || c.shortname}`).join(', ')
        : 'N/A';
    const discountValue = movieTicketData?.discountValue || 'N/A';
    const total = (movieTicketData?.total || 0) + (snackTicketData?.total || 0);

    // Helper to check if a value is empty (empty string, empty array, or N/A)
    const isEmpty = val => val === 'N/A' || val === '' || (Array.isArray(val) && val.length === 0);

    return (
        <div className="relative mx-auto flex w-full h-auto min-h-full flex-col items-center justify-start overflow-hidden rounded-xl">
            <div className="absolute h-full w-full inset-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            <div className="relative z-10 flex w-full h-full flex-col items-center justify-start gap-2 px-7 py-4 md:px-6 lg:px-8">
                <div className="self-stretch pt-1 text-center font-['Unbounded'] text-base font-black text-white">TICKET DETAILS</div>
                <div className="h-px w-40" />
                <div className="flex w-[73vw] flex-wrap gap-8 -space-y-4 md:w-auto md:flex-col md:gap-2 md:space-y-0 flex-1 justify-start items-start">
                    {!isEmpty(movieTitle) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold line-clamp-4 text-white">
                            Movie:<br />
                            {movieTitle}
                        </div>
                    )}
                    {!isEmpty(address) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                            Address:<br />
                            {address}
                        </div>
                    )}
                    {!isEmpty(date) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                            Date:<br />
                            {date}
                        </div>
                    )}
                    {!isEmpty(tickets) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                            Tickets:<br />
                            {tickets}
                        </div>
                    )}
                    {!isEmpty(seats) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                            Seats:<br />
                            {seats}
                        </div>
                    )}
                    {!isEmpty(snackCombos) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                            Snack combos:<br />
                            {snackCombos}
                        </div>
                    )}
                    {(!isEmpty(time) || !isEmpty(typeof screen === 'string' ? screen : (screen?.screenName || 'N/A'))) && (
                        <div className="mt-2 flex w-auto items-start justify-start gap-2">
                            {!isEmpty(time) && (
                                <div className="lg:text-md w-24 font-['Unbounded'] text-xs font-semibold text-white">
                                    Time:<br />
                                    {time}
                                </div>
                            )}
                            {!isEmpty(typeof screen === 'string' ? screen : (screen?.screenName || 'N/A')) && (
                                <div className="lg:text-md w-16 pb-3 font-['Unbounded'] text-xs font-semibold text-white">
                                    Screen:<br />
                                    {typeof screen === 'string' ? screen : (screen?.screenName || 'N/A')}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Discount field is commented out, but if needed: */}
                    {/* {!isEmpty(discountValue) && (
                        <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                            Discount:<br />
                            {discountValue}
                        </div>
                    )} */}
                    <div className="lg:text-lg w-auto font-['Unbounded'] text-md font-semibold text-white">
                        Total: {total} vnd
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;