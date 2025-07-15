const ticketDetails = [
    { label: "Movie", value: "The Divided" },
    { label: "Address", value: "123 Nguyễn Văn Cừ, D3, HCM" },
    { label: "Date", value: "Monday, 23th May, 2025" },
    { label: "Tickets", value: "1 adults, 1 student/elders" },
    { label: "Seats", value: "A01, A02" },
    { label: "Snack combos", value: "1 Combo 1, 1 combo 2" },
];

const TicketDetail = () => (
    <div className="relative mx-auto w-full overflow-hidden rounded-xl md:h-full md:max-h-[470px] md:w-auto md:max-w-[300px] md:min-w-[200px] inline-flex flex-col justify-start items-center gap-2">
        <div className="absolute inset-0 mix-blend-color-dodge bg-zinc-300/30 rounded-xl" />
        <div className="w-auto inline-flex flex-col justify-center items-center gap-2 lg:px-8 md:px-6 py-4 px-7 relative z-10">
            <div className="self-stretch text-center text-white text-base font-black font-['Unbounded'] pt-1 md:pt-5">
                TICKET DETAILS
            </div>
            <div className="w-40 h-px" />
            <div className="flex flex-wrap md:flex-col gap-8 md:gap-2 w-[73vw] md:w-full -space-y-4 md:space-y-0">
                {ticketDetails.map(({ label, value }) => (
                    <div
                        key={label}
                        className="text-white text-xs lg:text-md font-semibold font-['Unbounded'] w-auto"
                    >
                        {label}:<br />
                        {value}
                    </div>
                ))}
                <div className="w-auto flex justify-start items-start gap-2 mt-2">
                    <div className="w-24 text-white text-xs lg:text-md  font-semibold font-['Unbounded']">
                        Time:<br />
                        7:00 - 8:25
                    </div>
                    <div className="w-16 text-white text-xs lg:text-md font-semibold font-['Unbounded'] pb-3">
                        Cinema:<br />
                        07
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default TicketDetail;
