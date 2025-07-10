const LocationCard = ({ branchName, distance, nowShowing }) => {
    return (
        <div className="relative z-10 mb-2 h-[20%] w-full rounded-xl bg-zinc-300/10 p-2 pt-1 mix-blend-color-dodge md:h-[25%] md:pt-2 lg:mb-3 lg:p-3 xl:mb-4 xl:h-[15%] xl:bg-zinc-300/20 xl:p-4">
            <h2 className="font-libre-franklin text-[10px] font-bold text-white sm:text-xs md:text-lg lg:text-xl xl:text-2xl">Lumiere {branchName}</h2>
            <p className="font-libre-franklin text-[7px] font-light text-white md:text-[10px] lg:text-xs">
                {' '}
                {distance} {distance >= 2 ? 'kms' : 'km'} • {nowShowing} now showing
            </p>
        </div>
    );
};

export default LocationCard;
