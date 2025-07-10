import UploadCSVButton from '../../components/buttons/scheduleMange/uploadCsvButton.jsx';
import AddScheduleButton from '../../components/buttons/scheduleMange/addScheduleButton.jsx';
import { Download } from 'lucide-react';
import {Circle} from "lucide-react";

const DownloadTemplateButton = () => {
    return (
        <button className="relative z-20 flex h-8 w-44 items-center justify-center gap-1 text-sm font-medium text-slate-950 underline">
            Download template
            <Download className="h-4 text-slate-950" />
        </button>
    );
};

const DateChosenButton = () => {
    return (
        <button className="relative z-20 flex h-8 items-center gap-2">

            <button className="font-unbounded h-9 px-5 rounded-xl bg-white text-lg text-slate-950">07/10/2025</button>

        </button>
    );
};

const SelectBranchButton = () => {
    return (
        <button className="absolute w-96 h-9 bottom-5 left-1/2 transform -translate-x-1/2">
            <div className="w-96 h-9 left-0 top-0 absolute bg-white rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(3,5,28,1.00)]" />
            <div className="absolute text-center top-1/2 left-1/2 transform -translate-1/2 justify-start text-white text-base text-nowrap font-bold font-unbounded">LUMIERE CINEMA CAO THẮNG</div>
        </button>
    )
}

const Schedule = () => {
    return (
        <div className="absolute bottom-1/10  flex h-[67%] w-screen flex-col items-end pr-[4%] z-20 overflow-x-hidden">
            {/*Calendar*/}
            <div className="relative z-10 h-[95%] w-[90%]">
                <div className="flex justify-between px-[1px] py-1">
                    {Array.from({ length: 24 }, (_, hour) => {
                        return <div className="font-libre-franklin justify-center text-center text-xs font-bold text-black">{hour < 10 ? `0${hour}` : hour}:00</div>;
                    })}
                </div>

                <div className="relative h-[3px] w-full bg-slate-950" />

                <div className="relative flex h-full w-full justify-between px-[2.2%]">
                    {Array.from({ length: 12 }, (_, index) => {
                        return (
                            <div key={index} className="relative h-full w-[4.4%] bg-slate-900/30">
                                <p className="font-unbounded absolute top-0 left-0 -translate-1/2 transform text-sm font-light">I</p>
                                <p className="font-unbounded absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 transform text-sm font-light">I</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="absolute top-[5%] left-[4%] w-[4%] h-[95%] py-3 bg-black/20 flex flex-col gap-3">
                    {Array.from({ length: 5 }, (_, index) => {
                        return (
                            <>
                                <div key={index} className="relative w-full h-[10%] ">
                                    <span className="absolute top-1/2 left-1/2 transform -translate-1/2 text-bold font-unbounded text-2xl font-black">{index}</span>
                                </div>
                            </>
                        )
                    })}
            </div>

        </div>
    );
};

const ScheduleManagePage = () => {
    return (
        <div className="relative h-screen w-screen overflow-hidden bg-zinc-300/70">
            <div className="font-unbounded absolute top-5 left-1/6 z-10 justify-start text-5xl font-bold text-black">Schedule</div>

            <div className="absolute xl:top-1/20 lg:top-1/10 right-1/12 z-10 flex items-end gap-4">
                <AddScheduleButton />
                <div className="flex flex-col items-center">

                    <DownloadTemplateButton />
                    <UploadCSVButton />
                </div>
                <DateChosenButton />
            </div>



            <div className="absolute left-1/2 transform -translate-x-1/2 bg-black/10 xl:rounded-3xl rounded-xl
            xl:bottom-1/10 lg:bottom-1/10
            xl:h-[70%] lg:h-[70%]
            w-[95%]
            z-4 "></div>

            <Schedule />

            <SelectBranchButton />

            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </div>
    );
};

export default ScheduleManagePage;
