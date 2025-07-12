import Seat from './Seat.jsx';

const CoupleSeat = () => {
    return (
        <div className="relative flex items-center gap-2">
            <div className="relative flex items-center lg:h-7 lg:w-16 lg:gap-2 xl:h-9 xl:w-21 xl:gap-3">
                <Seat type="Couple" />
                <Seat type="Couple" />
                <div className="absolute left-1/2 -translate-x-1/2 transform rounded-sm bg-indigo-400 lg:top-[10%] lg:h-3 lg:w-10 xl:top-[15%] xl:h-3 xl:w-15" />
            </div>
        </div>
    );
};

export default CoupleSeat;
