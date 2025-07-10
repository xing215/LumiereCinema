const ScheduleManagePage = () => {
    return (
        <div className="w-screen h-screen bg-zinc-300/70">
            <div className="absolute z-10 justify-start text-black font-bold font-unbounded text-5xl
            left-1/6 top-5">Schedule</div>
            <div className="absolute z-5 w-44 h-44 mix-blend-hard-light bg-amber-300 rounded-full blur-[100px]
            bottom-1/3 left-0 transform -translate-x-1/2" />
            <div className="absolute z-5 w-44 h-44 mix-blend-hard-light bg-amber-300 rounded-full blur-[100px]
            top-1/5 right-0 transform translate-x-1/2" />
            <div className="absolute z-5 w-52 h-52 mix-blend-hard-light bg-blue-500 rounded-full blur-[100px]
            left-1/3 transform -translate-y-2/3" />
            <div className="absolute z-5 w-56 h-56 mix-blend-hard-light bg-purple-600 rounded-full blur-[100px]
            right-0 bottom-0 transform translate-1/2" />
        </div>
    )
}

export default ScheduleManagePage;