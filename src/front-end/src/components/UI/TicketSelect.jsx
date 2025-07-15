const TicketSelect = ({ ticket_type }) => {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-between gap-1 rounded-xl">
            <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge" />
            <div className="relative w-2/3 justify-start px-3 pt-3 text-center font-['Unbounded'] text-base font-semibold whitespace-normal text-white">{ticket_type}</div>
            <div className="relative flex h-full w-full flex-row items-center justify-center gap-8 px-3">
                <button className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300">-</button>
                <div className="relative justify-start text-center font-['Unbounded'] text-xl font-black text-zinc-300">01</div>
                <button className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300">+</button>
            </div>
            <div className="relative justify-start pb-1 text-center font-['Unbounded'] text-[10px] font-semibold text-white">80,000đ</div>
        </div>
    );
};

export default TicketSelect;
