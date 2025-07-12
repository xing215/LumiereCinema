import UploadCSVButton from '../../components/buttons/scheduleMange/uploadCsvButton.jsx';
import AddScheduleButton from '../../components/buttons/scheduleMange/addScheduleButton.jsx';
import { Download } from 'lucide-react';
import { Circle } from 'lucide-react';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
import SelectBranchButton from '../../components/buttons/staffSelectBranch.jsx';

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
            <button className="font-unbounded h-9 rounded-xl bg-white px-5 text-lg text-slate-950">07/10/2025</button>
        </button>
    );
};

const Schedule = () => {
    return (
        <div className="absolute bottom-1/10 z-20 flex h-[67%] w-full flex-col items-end overflow-x-hidden pr-[4%]">
            {/*Calendar*/}
            <div className="relative z-10 h-[95%] w-[90%]">
                <div className="flex justify-between px-[1px] py-1">
                    {Array.from({ length: 24 }, (_, hour) => {
                        return (
                            <div key={hour} className="font-libre-franklin justify-center text-center text-xs font-bold text-black">
                                {hour < 10 ? `0${hour}` : hour}h
                            </div>
                        );
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

            <div className="absolute top-[5%] left-[4%] flex h-[95%] w-[4%] flex-col gap-3 bg-black/20 py-3">
                {Array.from({ length: 5 }, (_, index) => {
                    return (
                        <div key={index} className="relative h-[10%] w-full">
                            <span className="text-bold font-unbounded absolute top-1/2 left-1/2 -translate-1/2 transform text-2xl font-black">{index}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ScheduleManagePage = () => {
    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <div className="font-unbounded absolute top-5 left-1/6 z-10 justify-start text-5xl font-bold text-black">Schedule</div>

                <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/10 xl:top-1/20">
                    <AddScheduleButton />
                    <div className="flex flex-col items-center">
                        <DownloadTemplateButton />
                        <UploadCSVButton />
                    </div>
                    <DateChosenButton />
                </div>

                <div className="absolute left-1/2 z-4 w-[95%] -translate-x-1/2 transform rounded-xl bg-black/10 lg:bottom-1/10 lg:h-[70%] xl:bottom-1/10 xl:h-[70%] xl:rounded-3xl"></div>

                <Schedule />

                <SelectBranchButton />
            </MobileNotSupported>

            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default ScheduleManagePage;
