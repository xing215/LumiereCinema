const ticketDetails = [
    { label: 'Movie', value: 'The Divided' },
    { label: 'Address', value: '123 Nguyễn Văn Cừ, D3, HCM' },
    { label: 'Date', value: 'Monday, 23th May, 2025' },
    { label: 'Tickets', value: '1 adults, 1 student/elders' },
    { label: 'Seats', value: 'A01, A02' },
    { label: 'Snack combos', value: '1 Combo 1, 1 combo 2' },
];

const TicketDetail = () => (
    <div className="relative mx-auto inline-flex w-full flex-col items-center justify-start gap-2 overflow-hidden rounded-xl md:h-full md:max-h-[470px] md:w-auto md:max-w-[300px] md:min-w-[200px]">
        <div className="absolute inset-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        <div className="relative z-10 inline-flex w-auto flex-col items-center justify-center gap-2 px-7 py-4 md:px-6 lg:px-8">
            <div className="self-stretch pt-1 text-center font-['Unbounded'] text-base font-black text-white md:pt-5">TICKET DETAILS</div>
            <div className="h-px w-40" />
            <div className="flex w-[73vw] flex-wrap gap-8 -space-y-4 md:w-full md:flex-col md:gap-2 md:space-y-0">
                {ticketDetails.map(({ label, value }) => (
                    <div key={label} className="lg:text-md w-auto font-['Unbounded'] text-xs font-semibold text-white">
                        {label}:<br />
                        {value}
                    </div>
                ))}
                <div className="mt-2 flex w-auto items-start justify-start gap-2">
                    <div className="lg:text-md w-24 font-['Unbounded'] text-xs font-semibold text-white">
                        Time:
                        <br />
                        7:00 - 8:25
                    </div>
                    <div className="lg:text-md w-16 pb-3 font-['Unbounded'] text-xs font-semibold text-white">
                        Cinema:
                        <br />
                        07
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default TicketDetail;
