import Seat from './Seat.jsx';

const CoupleSeat = () => {
    return (
        <div className="relative flex items-center">
            <div className="relative flex h-5 w-12 items-center justify-between lg:h-7 lg:w-16 xl:h-9 xl:w-21">
                <Seat type="Couple" />
                <Seat type="Couple" />
                <div className="absolute top-[5%] left-1/2 h-2 w-7 -translate-x-1/2 transform rounded-sm bg-indigo-400 lg:top-[10%] lg:h-3 lg:w-10 xl:top-[15%] xl:h-3 xl:w-15" />
            </div>
        </div>
    );
};

export default CoupleSeat;
