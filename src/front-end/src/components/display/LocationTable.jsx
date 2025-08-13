import { Locate } from 'lucide-react';

const LocationCard = ({ cinema, branchName, location, showings, curlocation, onClick, maxdistance, isSelected = false, onHover }) => {
    function getDistance(lon1, lat1, lon2, lat2) {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    }
    let distance = null;

    if (location && curlocation) {
        distance = getDistance(curlocation.coordinates[0], curlocation.coordinates[1], location.coordinates[0], location.coordinates[1]);
    }
    return (
        <div
            className={`${maxdistance > distance || maxdistance === '' ? '' : 'hidden'} group relative z-10 mb-2 h-auto w-full rounded-xl p-2 pt-1 mix-blend-color-dodge ${isSelected ? 'bg-zinc-300/60 xl:p-4' : 'bg-zinc-300/30 hover:bg-zinc-300/50'} xl:py-4`}
            onClick={() => onClick(cinema)}
            onMouseEnter={() => onHover && onHover(cinema)}
            onMouseLeave={() => onHover && onHover(null)}
            style={{ cursor: 'pointer' }}
        >
            <h2 className="font-libre-franklin md:text-md pt-1 text-[10px] font-bold text-white sm:text-xs lg:text-[18px]">{branchName}</h2>
            <p className="font-libre-franklin pb-1 text-[7px] font-light text-white md:text-[10px] lg:text-xs">
                {' '}
                {curlocation && distance ? distance + ' km •' : ''} {showings} now showing
            </p>
        </div>
    );
};

const HeaderTable = ({ maxdistance, setMaxDistance }) => {
    return (
        <div className="relative flex h-auto min-h-[2px] flex-row items-center justify-center gap-1 px-2">
            <span className="font-unbounded w-auto pl-2 text-left text-[8px] font-normal text-white sm:text-xs xl:text-sm">Farthest distance:</span>
            <span className="font-unbounded absolute right-5 bg-zinc-300 pl-1 text-right text-[8px] font-normal text-black sm:text-xs xl:text-sm">km</span>
            <input
                type="number"
                className="h-auto w-full rounded-xl bg-zinc-300 px-3 pr-1 font-['Unbounded'] text-sm text-black focus:ring-2 focus:ring-purple-600/100 focus:outline-none md:w-[90%]"
                value={maxdistance}
                onChange={(e) => {
                    setMaxDistance(e.target.value);
                }}
            />
        </div>
    );
};

const GetLocationButton = ({ onClick }) => {
    return (
        <button
            className="relative z-10 mb-1 flex h-auto w-[90%] cursor-pointer flex-row items-center justify-center rounded-2xl bg-pink-400 p-2 py-3 text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-purple-700"
            onClick={onClick}
        >
            <Locate className="h-full w-[5%]" />
            <span className="md:text-md relative h-auto w-[75%] text-center font-['Unbounded'] text-xs font-semibold">Use Current Location</span>
        </button>
    );
};

const UnselectCinemaButton = ({ onClick }) => {
    return (
        <button
            className="relative z-10 mb-1 flex h-auto w-[90%] cursor-pointer flex-row items-center justify-center rounded-2xl bg-pink-400 p-2 py-3 text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-purple-700"
            onClick={onClick}
        >
            {/* <Locate className="h-full w-[5%] md:w-[10%]"/> */}
            <span className="md:text-md relative h-auto w-full text-center font-['Unbounded'] text-xs font-semibold">Unselect Cinema</span>
        </button>
    );
};

const LocationFrame = ({ cinemas, curlocation, maxdistance, onClick, selectedlocation = null, onHover }) => {
    return (
        <div className="no-scrollbar relative flex h-full w-[90%] flex-col items-center overflow-y-scroll bg-transparent py-4">
            {cinemas.map((cinema) => (
                <LocationCard
                    key={cinema._id}
                    branchName={cinema.name}
                    location={cinema.location}
                    showings={cinema.showings}
                    curlocation={curlocation}
                    maxdistance={maxdistance}
                    onClick={onClick}
                    isSelected={cinema._id === selectedlocation?._id}
                    cinema={cinema}
                    onHover={onHover}
                />
            ))}
        </div>
    );
};

const LocationTable = ({
    selectedlocation = null,
    curlocation,
    maxdistance,
    setMaxDistance,
    cinemas,
    onClick,
    onHover,
    getLocation,
    getAllCinemas = false,
    getAllCinemasClick = () => {
        console.log('Get all cinemas clicked');
    },
}) => {
    return (
        <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-xl bg-slate-950 md:w-full md:min-w-[200px]">
            <div className="absolute top-7 left-[-10px] h-20 w-20 rounded-full bg-pink-400/100 mix-blend-lighten blur-[100px] sm:top-1/4 sm:-translate-y-1/2 sm:transform md:left-[-20px] md:h-25 md:w-25 lg:left-[-40%] lg:h-30 lg:w-30 xl:left-[-80px] xl:h-44 xl:w-44 xl:bg-pink-400/50" />

            <div className="absolute top-1/2 left-1/3 h-15 w-15 -translate-x-1/2 transform rounded-full bg-purple-600/100 mix-blend-lighten blur-[100px] md:h-20 md:w-20 lg:h-30 lg:w-30 xl:h-44 xl:w-44 xl:bg-purple-600/50" />

            <div className="absolute right-[-10px] bottom-0 h-20 w-20 rounded-full bg-sky-400/100 mix-blend-lighten blur-[100px] md:right-[-20px] md:bottom-[30px] md:h-30 md:w-30 lg:right-[-30px] lg:bottom-[-30px] lg:h-40 lg:w-40 lg:bg-sky-400/80 xl:right-[-50px] xl:bottom-[-50px] xl:h-56 xl:w-56 xl:bg-sky-400/50" />

            <div className="h-5 w-full md:h-10" />
            {getAllCinemas && <UnselectCinemaButton onClick={getAllCinemasClick} />}
            {curlocation ? <HeaderTable maxdistance={maxdistance} setMaxDistance={setMaxDistance} /> : <GetLocationButton onClick={getLocation} />}
            <LocationFrame cinemas={cinemas} curlocation={curlocation} maxdistance={maxdistance} onClick={onClick} selectedlocation={selectedlocation} onHover={onHover} />
        </div>
    );
};

export default LocationTable;
