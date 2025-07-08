import LocationCard from "../UI/locationCard.jsx";
const HeaderTable = () => {
    return (
        <div className="relative items-center lg:gap-3 gap-1 justify-start
        md:flex md:flex-row flex flex-col
        md:pt-0 pt-2
        lg:h-[20%] sm:h-[15%] h-[25%]">
            <span className="text-white font-normal font-unbounded
            xl:text-sm lg:text-xs sm:text-[10px] text-[8px]">
                Farthest distance:
            </span>
            <div className="bg-zinc-300/70 rounded-xl
            lg:w-37 sm:w-30 w-25
            lg:h-5 sm:h-4 h-[10px]" />
        </div>
    );
}

const LocationFrame = () => {
    return (
        <div className="absolute flex flex-col items-center bg-transparent overflow-y-scroll no-scrollbar
        lg:bottom-7 bottom-4
        w-[90%]
        xl:h-[83%] h-[80%]">
            <LocationCard branchName="Cao Thắng" distance="2" nowShowing="7"/>
            <LocationCard branchName="Cao Thắng" distance="2" nowShowing="7" />
            <LocationCard branchName="Vạn Hạnh" distance="3.5" nowShowing="5" />
            <LocationCard branchName="Quang Trung" distance="6.2" nowShowing="4" />
            <LocationCard branchName="Cao Thắng" distance="2" nowShowing="7" />
            <LocationCard branchName="Vạn Hạnh" distance="3.5" nowShowing="5" />
            <LocationCard branchName="Quang Trung" distance="6.2" nowShowing="4" />
            <LocationCard branchName="Cao Thắng" distance="2" nowShowing="7" />
            <LocationCard branchName="Vạn Hạnh" distance="3.5" nowShowing="5" />
            <LocationCard branchName="Quang Trung" distance="6.2" nowShowing="4" />
        </div>
    );
}

const LocationTable = () => {
    return (
        <div className="relative flex flex-col items-center bg-slate-950 top-1/2 transform -translate-y-1/2 overflow-hidden
        xl:w-85 lg:w-75
        lg:h-[95%] lg:rounded-2xl rounded-xl
        w-full h-full">
            <div className="absolute top-7
            xl:left-[-80px] lg:left-[-40%] md:left-[-20px] left-[-10px]
            sm:top-1/4 sm:transform sm:-translate-y-1/2
            xl:w-44 lg:w-30 md:w-25 w-20
            xl:h-44 lg:h-30 md:h-25 h-20
            mix-blend-lighten rounded-full blur-[100px]
            xl:bg-pink-400/50 bg-pink-400/100" />

            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2
            xl:w-44 lg:w-30 md:w-20 w-15
            xl:h-44 lg:h-30 md:h-20 h-15
            mix-blend-lighten rounded-full blur-[100px]
            xl:bg-purple-600/50 bg-purple-600/100" />

            <div className="absolute
            xl:bottom-[-50px] lg:bottom-[-30px] md:bottom-[30px] bottom-0
            xl:right-[-50px] lg:right-[-30px] md:right-[-20px] right-[-10px]
            xl:w-56 lg:w-40 md:w-30 w-20
            xl:h-56 lg:h-40 md:h-30 h-20
            mix-blend-lighten rounded-full blur-[100px]
            xl:bg-sky-400/50 lg:bg-sky-400/80 bg-sky-400/100" />

            <HeaderTable/>
            <LocationFrame/>
        </div>
    );
}

export default LocationTable;