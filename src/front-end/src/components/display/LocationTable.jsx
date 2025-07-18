const LocationCard = ({cinema, branchName, location, showings, curlocation, onClick, maxdistance, isSelected = false}) => {
    function getDistance(lon1, lat1, lon2, lat2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
}
let distance = null;

    if (
        location &&
        curlocation
    ) {
    distance = getDistance(curlocation.coordinates[0], curlocation.coordinates[1], location.coordinates[0], location.coordinates[1]);
}
    return (
        <div className={`${maxdistance > distance || maxdistance === '' ? '' : 'hidden'} group relative z-10 mb-2 h-auto w-full rounded-xl p-2 pt-1 mix-blend-color-dodge ${isSelected ? 'bg-zinc-300/60 xl:p-4' : 'hover:bg-zinc-300/50 bg-zinc-300/30'} xl:py-4`}
onClick={() => onClick(cinema)}
        style={{ cursor: 'pointer' }}>
            <h2 className="font-libre-franklin text-[10px] pt-1 font-bold text-white sm:text-xs md:text-lg lg:text-xl xl:text-2xl">{branchName}</h2>
            <p className="font-libre-franklin text-[7px] font-light text-white md:text-[10px] lg:text-xs pb-1">
                {' '}
                {curlocation && distance ? distance + ' km •' : ''} {showings} now showing
            </p>
        </div>
    );
};

const HeaderTable = ({ maxdistance, setMaxDistance }) => {
    return (
        <div className="relative flex h-auto flex-row items-center justify-center gap-1 pt-15 px-2">
            <span className="font-unbounded text-[8px] w-auto font-normal text-right text-white sm:text-xs xl:text-sm">Farthest distance:</span>
            <span className=" pl-1 absolute right-5 font-unbounded text-[8px] font-normal text-right text-black sm:text-xs xl:text-sm bg-zinc-300 ">km</span>
            <input
            type="number"
                className="h-auto lg:w-[6vw] md:w-[9vw] rounded-xl bg-zinc-300 px-3 font-['Unbounded'] text-sm text-black focus:ring-2 focus:ring-purple-600/100 focus:outline-none"
                value={maxdistance}
                onChange={e => {
                    setMaxDistance(e.target.value);
                }}
            />
        </div>
    );
};

const LocationFrame = ({cinemas, curlocation, maxdistance, onClick, selectedlocation = null}) => {

    return (
        <div className="py-4 no-scrollbar relative flex h-full w-[90%] flex-col items-center overflow-y-scroll bg-transparent">
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
                />
            ))}
        </div>
    );
};


const LocationTable = ({selectedlocation = null, curlocation, maxdistance, setMaxDistance, cinemas, onClick}) => {

    return (
        <div className="relative flex h-full w-[15vw] flex-col items-center overflow-hidden rounded-xl bg-slate-950 md:min-w-[300px]">
            <div className="absolute top-7 left-[-10px] h-20 w-20 rounded-full bg-pink-400/100 mix-blend-lighten blur-[100px] sm:top-1/4 sm:-translate-y-1/2 sm:transform md:left-[-20px] md:h-25 md:w-25 lg:left-[-40%] lg:h-30 lg:w-30 xl:left-[-80px] xl:h-44 xl:w-44 xl:bg-pink-400/50" />

            <div className="absolute top-1/2 left-1/3 h-15 w-15 -translate-x-1/2 transform rounded-full bg-purple-600/100 mix-blend-lighten blur-[100px] md:h-20 md:w-20 lg:h-30 lg:w-30 xl:h-44 xl:w-44 xl:bg-purple-600/50" />

            <div className="absolute right-[-10px] bottom-0 h-20 w-20 rounded-full bg-sky-400/100 mix-blend-lighten blur-[100px] md:right-[-20px] md:bottom-[30px] md:h-30 md:w-30 lg:right-[-30px] lg:bottom-[-30px] lg:h-40 lg:w-40 lg:bg-sky-400/80 xl:right-[-50px] xl:bottom-[-50px] xl:h-56 xl:w-56 xl:bg-sky-400/50" />

            {curlocation? <HeaderTable maxdistance={maxdistance} setMaxDistance={setMaxDistance} /> : null}
            <LocationFrame cinemas={cinemas} curlocation={curlocation} maxdistance={maxdistance} onClick={onClick} selectedlocation={selectedlocation} />
        </div>
    );
};

export default LocationTable;
