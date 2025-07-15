const Seat = ({ type }) => {
    const normalizedType = type?.toLowerCase();

    const seatColor =
        {
            normal: 'bg-blue-400',
            vip: 'bg-red-400',
            couple: 'bg-indigo-400',
        }[normalizedType] || 'bg-stone-400';

    return (
        <div className="flex items-center gap-2">
            {/* Ghế */}
            <div className="relative h-6 w-5 lg:h-7 lg:w-7 xl:h-7 xl:w-9">
                <div className={`absolute top-0 left-0 h-4 w-full rounded-sm lg:h-4.5 xl:h-4 ${seatColor}`} />
                <div className={`absolute bottom-0 left-0 h-1 w-full rounded-sm bg-black/30 lg:h-1.5 xl:h-2 ${seatColor}`} />
            </div>
        </div>
    );
};

export default Seat;
