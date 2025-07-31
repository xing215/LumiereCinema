const SellTicket = () => {
    return (
        <StaffLayout>
            <div className="absolute top-10 z-10 h-[10%] w-full md:top-0 md:h-[20%] lg:h-[13%]">
                <div className="relative h-full w-full">
                    <p className="font-unbounded text-md absolute top-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 transform font-bold text-nowrap text-white md:translate-y-1/2 md:text-2xl">
                        {dayjs(now).format('DD/MM/YYYY - HH:mm:ss')}
                    </p>
                </div>
            </div>

            <MainBody />

            <div className="absolute bottom-5 z-10 h-[15%] w-full md:bottom-0 lg:h-[13%]">
                <div className="relative h-full w-full">
                    <p className="font-unbounded text-md absolute top-1/2 left-1/2 -translate-1/2 transform font-bold text-nowrap text-white md:text-2xl">LUMIERE CINEMA CAO THẮNG</p>
                </div>
            </div>

            {/* Background blur effects */}
            <div className="tranform absolute top-0 left-1/5 h-52 w-52 -translate-y-1/2 rounded-full bg-sky-400/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute top-1/4 left-0 h-44 w-44 -translate-x-1/2 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px]" />
            <div className="absolute top-1/2 right-1/11 h-28 w-28 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute right-0 bottom-0 h-56 w-56 translate-x-1/2 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
        </StaffLayout>
    );
}