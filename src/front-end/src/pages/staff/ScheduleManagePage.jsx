import UploadCSVButton from "../../components/buttons/scheduleMange/uploadCsvButton.jsx";
import AddScheduleButton from "../../components/buttons/scheduleMange/addScheduleButton.jsx";
import {Download} from "lucide-react";

const DownloadTemplateButton = () => {
    return (
        <button className="relative z-20 w-44 h-8
            text-slate-950 font-medium gap-1
            flex items-center justify-center
            text-sm underline">
            Download template
            <Download className="text-slate-950 h-4"/>
        </button>
    )
}

const DateChosenButton = () => {
    return(
        <button className="absolute flex items-center z-20 w-50 h-8 gap-2
        right-1/6 top-10">
            <button>
                <p className="font-unbounded font-bold text-2xl">&lt;</p>
            </button>

            <button className="w-[80%] h-9 bg-white rounded-xl text-slate-950 font-unbounded text-lg">07/10/2025</button>

            <button>
                <p className="font-unbounded font-bold text-2xl">&gt;</p>
            </button>
        </button>
    )
}

const Calendar = () => {
    return (
        <div className="absolute w-[90%] h-[93%] bottom-0 left-1/2 transform -translate-x-1/2
         bg-red-700">

        </div>
    );
}

const Schedule = () => {
    return(
        <div className="absolute w-screen bottom-20 h-[67%] bg-black">
            <Calendar/>
        </div>
    )
}

const ScheduleManagePage = () => {
    return (
        <div className="relative w-screen h-screen bg-zinc-300/70 overflow-hidden">

            <div className="absolute z-10 justify-start text-black font-bold font-unbounded text-5xl
            left-1/6 top-5">Schedule</div>

            <div className="absolute flex gap-4 right-1/6 top-25 items-end z-10">
                <AddScheduleButton/>
                <div className="flex flex-col items-center">
                    <DownloadTemplateButton/>
                    <UploadCSVButton/>
                </div>
            </div>

            <DateChosenButton/>
            <Schedule/>

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