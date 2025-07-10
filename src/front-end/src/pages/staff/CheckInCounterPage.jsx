import Footer from "../../layouts/LandingPage/Footer.jsx";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {Camera} from 'lucide-react'

const MainBody = () => {
    return (
        <div className="relative mix-blend-color-dodge bg-zinc-300/30 rounded-xl top-1/2 left-1/2 transform -translate-1/2
        lg:w-[80%] w-[90%]
        md:h-[75%] h-[70%]">
            <div className="relative flex flex-col items-center top-1/2 left-1/2 transform -translate-1/2 lg:w-[50%] w-[70%]">
                <p className="text-white font-black font-unbounded md:pb-4 pb-2 flex-nowrap
                md:text-4xl text-2xl">TICKET DETAILS</p>

                <p className="text-white font-bold font-unbounded
                md:text-2xl
                md:py-4 py-1">VALIDITY: VALID</p>
                <p className="text-white font-bold font-unbounded
                md:text-2xl
                md:py-4 py-1">LAST SCAN: NONE</p>

                <div className="flex flex-col
                lg:w-[80%] w-[90%]
                md:gap-2 gap-1
                md:py-4 py-1">
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Ticket ID:</p>
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Movie: Tham Tu Kien</p>
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Address: 123 Nguyen Van Cu, Cho Quan, Ho Chi Minh</p>
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Date: 10/07/2025</p>
                </div>

                <div className="lg:w-[80%] w-[90%] md:gap-2 gap-1
                grid lg:grid-cols-[70%_30%] md:grid-cols-[65%_35%] grid-cols-[70%_30%]
                md:grid-rows-[30%_70%] grid-rows-[40%_60%]">
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Time: 7:00 - 8:25</p>
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Cinema: 06</p>
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Ticket:<br/>1 adults, 1 student/elders</p>
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Seat:<br/> 123</p>
                </div>

                <div className="relative w-full flex items-center
                md:pt-8 pt-3
                md:gap-4 gap-2">
                    <p className="text-start text-white font-semibold font-unbounded
                    md:text-base text-xs">Ticket:</p>
                    <div className="relative bg-zinc-100 rounded-xl isolate
                    lg:w-[80%] md:w-[90%] w-[80%]
                    lg:h-9 md:h-8 h-6"/>
                    <Camera className="text-white
                    md:h-10 h-8
                    md:w-10 w-8"/>
                </div>
            </div>
        </div>
    )
}

const CheckInCounterPage = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative bg-slate-950 w-screen h-screen overflow-hidden">
            <div className="absolute w-screen lg:h-[13%] md:h-[20%] h-[10%] md:top-0 top-10">
                <div className="relative w-full h-full">
                    <p className="absolute text-white text-nowrap font-bold font-unbounded top-1/3 left-1/2 transform -translate-x-1/2 md:translate-y-1/2 translate-y-1/2
                    md:text-2xl text-md">{dayjs(now).format("DD/MM/YYYY - HH:mm:ss")}</p>
                </div>
            </div>
            <MainBody/>
            <div className="absolute w-screen lg:h-[13%] h-[15%] md:bottom-0 bottom-5">
                <div className="relative w-full h-full">
                    <p className="absolute text-white font-bold font-unbounded top-1/2 left-1/2 transform -translate-1/2 text-nowrap
                    md:text-2xl text-md">LUMIERE CINEMA CAO THẮNG</p>
                </div>
            </div>

            <div className="absolute top-0 left-1/5 tranform -translate-y-1/2
            w-52 h-52 mix-blend-lighten bg-sky-400/60 rounded-full blur-[100px]" />
            <div className="absolute top-1/4 left-0 tranform -translate-x-1/2
            w-44 h-44 mix-blend-lighten bg-pink-400/60 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-1/11
            w-28 h-28 mix-blend-lighten bg-amber-300/60 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 tranform translate-x-1/2
            w-56 h-56 mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]" />
        </div>
    )
}

export default CheckInCounterPage;