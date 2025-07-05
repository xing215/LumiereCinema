const HeaderTable = () => {
    return (
        <div className="relative flex items-center gap-3 justify-start h-[20%]">
            <text className="text-white font-normal text-sm font-['Unbounded']">
                Farthest distance:
            </text>
            <div className="w-37 h-5 bg-zinc-300/70 rounded-xl" />
        </div>
    );
}

const LocationTable = () => {
    return (
        <div className="relative flex flex-col items-center bg-slate-950 top-1/2 transform -translate-y-1/2 overflow-hidden
        xl:w-85 lg:w-75
        lg:h-[95%] lg:rounded-2xl rounded-xl
        w-full h-full">
            <div className="absolute
            xl:left-[-80px] lg:left-[-40%] md:left-[-20px] left-[-10px]
            sm:top-1/4 sm:transform sm:-translate-y-1/2
            top-7
            xl:w-44 lg:w-30 md:w-20 w-15
            xl:h-44 lg:h-30 md:h-20 h-15
            mix-blend-lighten bg-pink-400/60 rounded-full blur-[100px]" />

            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2
            xl:w-44 lg:w-30 md:w-20 w-15
            xl:h-44 lg:h-30 md:h-20 h-15
            mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]" />

            <div className="absolute xl:bottom-[-50px] lg:bottom-[-30px] md:bottom-[30px] bottom-0
            xl:right-[-50px] lg:right-[-30px] md:right-[-20px] right-[-10px]
            xl:w-56 lg:w-40 md:w-30 w-20
            xl:h-56 lg:h-40 md:h-30 h-20
            mix-blend-lighten bg-sky-400/60 rounded-full blur-[100px]" />

            <HeaderTable/>
        </div>
    );
}

export default LocationTable;