
const TicketDetail = ({ movieTicket, snackTicket }) => {
    // Fallbacks for missing data
    const movieTitle = movieTicket?.movieData?.title || 'N/A';
    const address = movieTicket?.branchData?.address || 'N/A';
    const date = movieTicket?.scheduleData
        ? new Date(movieTicket.scheduleData.startTime).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'N/A';
    const time =
        movieTicket?.scheduleData
            ? `${new Date(movieTicket.scheduleData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(movieTicket.scheduleData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'N/A';
    const cinema = movieTicket?.branchData?.name || 'N/A';
    const seats = Array.isArray(movieTicket?.seats)
        ? movieTicket.seats.map(s => s.seatNumber || s).join(', ')
        : 'N/A';
    const tickets = movieTicket?.ticketTypes
        ? movieTicket.ticketTypes.map(t => `${t.count} ${t.type}`).join(', ')
        : 'N/A';
    const snackCombos = snackTicket?.combos
        ? snackTicket.combos.map(c => `${c.count} ${c.name}`).join(', ')
        : 'N/A';

    return (
        <div className="relative mx-auto inline-flex w-full flex-col items-center justify-start gap-2 overflow-hidden rounded-xl md:h-full md:max-h-[470px] md:w-auto md:max-w-[300px] md:min-w-[200px]">
            <div className="absolute inset-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            <div className="relative z-10 inline-flex w-auto flex-col items-center justify-center gap-2 px-7 py-4 md:px-6 lg:px-8">
                <div className="self-stretch pt-1 text-center font-['Unbounded'] text-base font-black text-white md:pt-5">TICKET DETAILS</div>
                <div className="h-px w-40" />
                <div className="flex w-[73vw] flex-wrap gap-8 -space-y-4 md:w-full md:flex-col md:gap-2 md:space-y-0">
                    <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        Movie:<br />
                        {movieTitle}
                    </div>
                    <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        Address:<br />
                        {address}
                    </div>
                    <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        Date:<br />
                        {date}
                    </div>
                    <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        Tickets:<br />
                        {tickets}
                    </div>
                    <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        Seats:<br />
                        {seats}
                    </div>
                    <div className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        Snack combos:<br />
                        {snackCombos}
                    </div>
                    <div className="mt-2 flex w-auto items-start justify-start gap-2">
                        <div className="lg:text-md w-24 font-['Unbounded'] text-xs font-semibold text-white">
                            Time:<br />
                            {time}
                        </div>
                        <div className="lg:text-md w-16 pb-3 font-['Unbounded'] text-xs font-semibold text-white">
                            Cinema:<br />
                            {cinema}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
