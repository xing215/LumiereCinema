import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Camera } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout.jsx';

const MainBody = () => {
    return (
        <div className="relative top-1/2 left-1/2 h-[70%] w-[90%] -translate-1/2 transform rounded-xl bg-zinc-300/30 mix-blend-color-dodge md:h-[75%] md:w-[95%] lg:w-[80%]">
            <div className="relative top-1/2 left-1/2 flex w-[70%] -translate-1/2 transform flex-col items-center lg:w-[50%]">
                <p className="font-unbounded flex-nowrap pb-2 text-2xl font-black text-white md:pb-4 md:text-4xl">TICKET DETAILS</p>

                <p className="font-unbounded py-1 font-bold text-white md:py-4 md:text-2xl">VALIDITY: VALID</p>
                <p className="font-unbounded py-1 font-bold text-white md:py-4 md:text-2xl">LAST SCAN: NONE</p>

                <div className="flex w-[90%] flex-col gap-1 py-1 md:gap-2 md:py-4 lg:w-[80%]">
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Ticket ID:</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Movie: Tham Tu Kien</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Address: 123 Nguyen Van Cu, Cho Quan, Ho Chi Minh</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Date: 10/07/2025</p>
                </div>

                <div className="grid w-[90%] grid-cols-[70%_30%] grid-rows-[40%_60%] gap-1 md:grid-cols-[65%_35%] md:grid-rows-[30%_70%] md:gap-2 lg:w-[80%] lg:grid-cols-[70%_30%]">
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Time: 7:00 - 8:25</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Cinema: 06</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">
                        Ticket:
                        <br />1 adults, 1 student/elders
                    </p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">
                        Seat:
                        <br /> 123
                    </p>
                </div>

                <div className="relative flex w-full items-center gap-2 pt-3 md:gap-4 md:pt-8">
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Ticket:</p>
                    <div className="relative isolate h-6 w-[80%] rounded-xl bg-zinc-100 md:h-8 md:w-[90%] lg:h-9 lg:w-[80%]" />
                    <Camera className="h-8 w-8 text-white md:h-10 md:w-10" />
                </div>
            </div>
        </div>
    );
};

const CheckInCounterPage = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

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
};

export default CheckInCounterPage;
