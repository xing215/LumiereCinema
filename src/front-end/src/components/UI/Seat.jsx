const Seat = ({ type }) => {
    const normalizedType = type?.toLowerCase();

    const seatColor =
        {
            standard: 'bg-blue-400',
            couple: 'bg-indigo-400',
            vip: 'bg-yellow-400',
            hidden: 'bg-gray-600',
        }[normalizedType] || 'bg-stone-400';

    return (
        <div className="flex items-center gap-2">
            {/* Ghế */}
            <div className="relative h-6 w-5 lg:h-7 lg:w-7 xl:h-7 xl:w-9">
                <div className={`absolute top-0 left-0 h-6 w-full rounded-sm md:h-4 lg:h-4.5 xl:h-4 ${seatColor}`} />
                <div className={`absolute bottom-0 left-0 hidden h-1 w-full rounded-sm bg-black/30 md:block lg:h-1.5 xl:h-2 ${seatColor}`} />
            </div>
        </div>
    );
};

export default Seat;
