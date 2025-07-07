const LocationCard = ({ branchName, distance, nowShowing }) => {
    return (
        <div className="relative z-10 w-full xl:h-[15%] md:h-[25%] h-[20%] rounded-xl mix-blend-color-dodge xl:bg-zinc-300/20+ bg-zinc-300/10
        xl:p-4 lg:p-3 p-2 pt-1 md:pt-2
        xl:mb-4 lg:mb-3 mb-2">
            <h2 className="text-white font-bold font-libre-franklin
            xl:text-2xl lg:text-xl md:text-lg sm:text-xs text-[10px]">Lumiere {branchName}</h2>
            <p className="font-libre-franklin font-light text-white
            lg:text-xs md:text-[10px] text-[7px]"> {distance} {distance >= 2 ? 'kms' : 'km'} • {nowShowing} now showing</p>
        </div>
    );
};


export default LocationCard;