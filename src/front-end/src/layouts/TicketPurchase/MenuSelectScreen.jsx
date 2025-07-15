import BPoster from '../../components/UI/BPoster';
import NextNaviButton from '../../components/buttons/NaviButton';
import { BackNaviButton } from '../../components/buttons/NaviButton';

const TimeButton = ({ time, seats }) => {
    return (
        <button className="relative flex w-[38vw] flex-col items-center justify-center -space-y-1 rounded-xl md:w-[calc(100vw*0.12)] lg:w-[calc(100vw*0.10)]">
            <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge" />
            <div className="pt-2 font-['Unbounded'] text-[18px] font-bold text-white md:pt-1 md:text-[13px] lg:text-[15px]">{time}</div>
            <div className="pb-1 font-['Unbounded'] text-[10px] font-light text-white md:pb-0.5 md:text-[7px] lg:text-[8px]">{seats} seats left</div>
        </button>
    );
};

const TimeGrid = ({ time }) => {
    return (
        <div className="inline-flex w-[80vw] flex-wrap content-start items-start justify-center gap-3.5 md:w-[55vw] lg:w-[calc(100vw*0.45)]">
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
            <TimeButton time={time} seats={78} />
        </div>
    );
};

const SliderButton = ({ date, day, opacity = 'opacity-100' }) => {
    return (
        <div className={`relative aspect-square h-full ${opacity} mix-blend-color-dodge`}>
            <div className="absolute h-full w-full rounded-full bg-purple-600/70 outline-3 outline-white/70 md:outline-2" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 -space-y-1 sm:pt-0.5">
                <div className="font-['Unbounded'] text-[7px] font-bold text-white sm:text-[5.5px] lg:text-[7px]">{day}</div>
                <div className="font-['Unbounded'] text-[17px] font-bold text-white">{date}</div>
            </div>
        </div>
    );
};

export const SliderButtonInactive1 = ({ date, day }) => {
    return <SliderButton date={date} day={day} opacity="opacity-60" />;
};

export const SliderButtonInactive2 = ({ date, day }) => {
    return <SliderButton date={date} day={day} opacity="opacity-30" />;
};

const DateSlider = () => {
    return (
        <div className="flex h-auto w-auto flex-col items-center justify-center">
            <div className="flex h-10 w-auto flex-row items-center justify-between gap-4 md:h-10">
                <SliderButtonInactive2 date="1" day="Mon" />
                <SliderButtonInactive1 date="22" day="Tue" />
                <SliderButton date="3" day="Wed" />
                <SliderButtonInactive1 date="4" day="Thu" />
                <SliderButtonInactive2 date="5" day="Fri" />
            </div>
            <div className="hidden flex-row items-center justify-center gap-3 pt-3 md:flex md:gap-2 md:pt-2">
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge" />
                <div className="justify-start text-center font-['Unbounded'] text-[10px] font-semibold text-white sm:text-[12px]">Monday, 23th May, 2025</div>
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge" />
            </div>
        </div>
    );
};

const ChooseCinemaButton = () => (
    <button className="relative flex h-auto w-[80vw] items-center justify-center py-6 md:w-80 md:py-4 lg:w-[calc(100vw*0.24)]">
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge" />
        <div className="md:text-md absolute h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white">CHOOSE CINEMA</div>
    </button>
);

const MenuSelectScreen = () => (
    <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
        <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
            {/* Background layer with blend mode */}
            <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge" />
            {/* Content layer */}
            <div className="hidden md:block">
                <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
            </div>
            <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                <div className="relative flex flex-col items-center justify-start">
                    <div className="h-5 md:h-7" />
                    <DateSlider />
                    <div className="w-[55vw] overflow-hidden rounded-xl pt-5 md:hidden">
                        <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
                    </div>
                    <div className="h-5 md:h-7" />
                    <ChooseCinemaButton />
                    <div className="h-3 md:h-5" />
                    <TimeGrid time="07:00" />
                    <div className="h-5 sm:h-3 lg:h-10" />
                </div>
                <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                    <div className="w-80 justify-start text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                        Monday, 23th May, 2025, 07:00
                        <br />
                        Cinema: 123 NVC St, D3, HCM
                    </div>
                    <BackNaviButton />
                    <NextNaviButton text="SEATINGS" />
                </div>
            </div>
            <div className="fixed right-0 bottom-0 left-0 z-50 flex h-15 flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm md:hidden">
                <BackNaviButton />
                <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">
                    Movie: Tham Tu Kien
                    <br />
                    Monday, 23th May, 2025, 07:00
                    <br />
                    Cinema: 123 NVC St, D3, HCM
                </div>

                <NextNaviButton text="SEATINGS" />
            </div>
        </div>
    </div>
);

export default MenuSelectScreen;
