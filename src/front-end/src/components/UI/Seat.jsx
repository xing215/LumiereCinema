const Seat = ({ type }) => {
    const normalizedType = type?.toLowerCase();

    const seatColor = {
        normal: "bg-blue-400",
        vip: "bg-red-400",
        couple: "bg-indigo-400",
    }[normalizedType] || "bg-stone-400";

    return (
        <div className="flex items-center gap-2">
            {/* Ghế */}
            <div className="relative
            xl:w-9 lg:w-7
            xl:h-7 lg:h-7">
                <div className={`w-full xl:h-4 lg:h-4.5 absolute top-0 left-0 rounded-sm ${seatColor}`} />
                <div className={`w-full xl:h-2 lg:h-1.5 absolute bottom-0 left-0 rounded-sm bg-black/30 ${seatColor}`} />
            </div>
        </div>
    );
};

export default Seat;