import Seat from "./Seat.jsx";

const CoupleSeat = () => {
    return (
        <div className="relative gap-2 flex items-center">
            <div className="relative xl:h-9 xl:w-21 lg:h-7 lg:w-16 xl:gap-3 lg:gap-2 flex items-center">
                <Seat type="Couple"/>
                <Seat type="Couple"/>
                <div className="absolute xl:w-15 xl:h-3 lg:w-10 lg:h-3 left-1/2 xl:top-[15%] lg:top-[10%] transform -translate-x-1/2 bg-indigo-400 rounded-sm" />
            </div>
        </div>
    )
}

export default CoupleSeat;