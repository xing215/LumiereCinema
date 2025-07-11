import LocationCard from '../UI/locationCard.jsx';
const HeaderTable = () => {
    return (
        <div className="relative flex h-[25%] flex-col items-center justify-start gap-1 pt-2 sm:h-[15%] md:flex md:flex-row md:pt-0 lg:h-[20%] lg:gap-3">
            <span className="font-unbounded text-[8px] font-normal text-white sm:text-[10px] lg:text-xs xl:text-sm">Farthest distance:</span>
            <div className="h-[10px] w-25 rounded-xl bg-zinc-300/70 sm:h-4 sm:w-30 lg:h-5 lg:w-37" />
        </div>
    );
};

const LocationFrame = () => {
    return (
        <div className="no-scrollbar absolute bottom-4 flex h-[80%] w-[90%] flex-col items-center overflow-y-scroll bg-transparent lg:bottom-7 xl:h-[83%]">
            <LocationCard branchName="Cao Thắng" distance="2" nowShowing="7" />
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
};

const LocationTable = () => {
    return (
        <div className="relative top-1/2 flex h-full w-full -translate-y-1/2 transform flex-col items-center overflow-hidden rounded-xl bg-slate-950 lg:h-[95%] lg:w-75 lg:rounded-2xl xl:w-85">
            <div className="absolute top-7 left-[-10px] h-20 w-20 rounded-full bg-pink-400/100 mix-blend-lighten blur-[100px] sm:top-1/4 sm:-translate-y-1/2 sm:transform md:left-[-20px] md:h-25 md:w-25 lg:left-[-40%] lg:h-30 lg:w-30 xl:left-[-80px] xl:h-44 xl:w-44 xl:bg-pink-400/50" />

            <div className="absolute top-1/2 left-1/3 h-15 w-15 -translate-x-1/2 transform rounded-full bg-purple-600/100 mix-blend-lighten blur-[100px] md:h-20 md:w-20 lg:h-30 lg:w-30 xl:h-44 xl:w-44 xl:bg-purple-600/50" />

            <div className="absolute right-[-10px] bottom-0 h-20 w-20 rounded-full bg-sky-400/100 mix-blend-lighten blur-[100px] md:right-[-20px] md:bottom-[30px] md:h-30 md:w-30 lg:right-[-30px] lg:bottom-[-30px] lg:h-40 lg:w-40 lg:bg-sky-400/80 xl:right-[-50px] xl:bottom-[-50px] xl:h-56 xl:w-56 xl:bg-sky-400/50" />

            <HeaderTable />
            <LocationFrame />
        </div>
    );
};

export default LocationTable;
