import BPoster from "../../components/UI/BPoster";
import NextNaviButton from "../../components/buttons/NaviButton";
import {BackNaviButton} from "../../components/buttons/NaviButton";

const TimeButton = ({ time, seats }) => {
  return (
  <button className="flex flex-col justify-center items-center w-[38vw] md:w-[calc(100vw*0.12)] lg:w-[calc(100vw*0.10)] relative rounded-xl -space-y-1">
    <div className="w-full h-full left-0 top-0 absolute mix-blend-color-dodge bg-zinc-300/60 rounded-xl" />
    <div className="text-white text-[18px] md:text-[13px] lg:text-[15px] font-bold font-['Unbounded'] pt-2 md:pt-1">{time}</div>
    <div className="text-white text-[10px] md:text-[7px] lg:text-[8px] font-light font-['Unbounded'] pb-1 md:pb-0.5">{seats} seats left</div>
  </button>
  );
}

const TimeGrid = ({time}) => {   
  return (
    <div className="w-[80vw] md:w-[55vw] lg:w-[calc(100vw*0.45)] inline-flex justify-center items-start gap-3.5 flex-wrap content-start">
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
}

const SliderButton = ({date, day, opacity = "opacity-100"}) => {
  return (
  <div className={`h-full aspect-square relative ${opacity} mix-blend-color-dodge`}>
    <div className="w-full h-full absolute bg-purple-600/70 rounded-full outline-3 md:outline-2 outline-white/70" />
      <div className="absolute inset-0 flex flex-col gap-0 items-center justify-center -space-y-1 sm:pt-0.5">
        <div className="text-white text-[7px] sm:text-[5.5px] lg:text-[7px] font-bold font-['Unbounded']">{day}</div>
        <div className="text-white text-[17px]  font-bold font-['Unbounded']">{date}</div>
      </div>
    </div>
  )
}

export const SliderButtonInactive1 = ({date, day}) => {
  return (
  <SliderButton
    date={date}
    day={day}
    opacity="opacity-60"/>
  )
}

export const SliderButtonInactive2 = ({date, day}) => {
  return (
  <SliderButton
    date={date}
    day={day}
    opacity="opacity-30"/>
  )
}

const DateSlider = () => {
  return (
    <div className="flex flex-col items-center justify-center w-auto h-auto">
      <div className="flex flex-row items-center justify-between gap-4 w-auto h-10 md:h-10">
        <SliderButtonInactive2 date="1" day="Mon" />
        <SliderButtonInactive1 date="22" day="Tue" />
        <SliderButton date="3" day="Wed" />
        <SliderButtonInactive1 date="4" day="Thu" />
        <SliderButtonInactive2 date="5" day="Fri" />
      </div>
      <div className="hidden md:flex flex-row justify-center items-center gap-3 md:gap-2 pt-3 md:pt-2">
        <div className="w-3 h-[3px] mix-blend-color-dodge bg-zinc-300/30" />
        <div className="text-center justify-start text-white text-[10px] sm:text-[12px] font-semibold font-['Unbounded']">Monday, 23th May, 2025</div>
        <div className="w-3 h-[3px] mix-blend-color-dodge bg-zinc-300/30" />
      </div>
    </div>
  )
}


const ChooseCinemaButton = () => (
  <button className="flex items-center justify-center w-[80vw] md:w-80 h-auto relative lg:w-[calc(100vw*0.24)] md:py-4 py-6">
  <div className="w-full h-full left-0 top-0 absolute mix-blend-color-dodge bg-zinc-300/60 rounded-xl" />
  <div className="h-auto items-center absolute text-base md:text-md justify-center text-white font-black font-['Unbounded']">
    CHOOSE CINEMA
  </div>
  </button>
);

const MenuSelectScreen = () => (
  <div className="relative flex items-center justify-center w-screen pt-3 sm:pt-6 md:pt-9 lg:pt-14">
  <div className="relative flex flex-row justify-start w-full h-full md:h-[470px] md:w-screen lg:w-[calc(75vw)] lg:h-auto rounded-xl">
    {/* Background layer with blend mode */}
    <div className="absolute inset-0 mix-blend-color-dodge bg-zinc-300/30 rounded-xl pointer-events-none z-0" />
    {/* Content layer */}
    <div className="hidden md:block">
    <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
    </div>
    <div className="relative flex flex-col justify-between items-center flex-1 min-w-[55vw]">
    <div className="relative flex flex-col justify-start items-center">
      <div className="h-5 md:h-7" />
      <DateSlider />
      <div className="md:hidden pt-5 w-[55vw] overflow-hidden rounded-xl">
      <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
      </div>
      <div className="h-5 md:h-7" />
      <ChooseCinemaButton />
      <div className="h-3 md:h-5" />
      <TimeGrid time="07:00" />
      <div className="h-5 sm:h-3 lg:h-10" />
    </div>
    <div className="hidden md:flex flex-row gap-2 justify-end items-center w-full h-auto px-4 sm:px-8 md:px-10 lg:px-12 pb-5.5">
      <div className="w-80 text-right justify-start text-white text-[10px] font-semibold font-['Unbounded']">
      Monday, 23th May, 2025, 07:00<br />
      Cinema: 123 NVC St, D3, HCM
      </div>
      <BackNaviButton />
      <NextNaviButton text="SEATINGS" />
    </div>
    </div>
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-t border-white/10 flex flex-row gap-2 justify-end items-center px-4 h-15">
    <BackNaviButton />
    <div className="flex-1 relative text-center text-white text-[9px] font-semibold font-['Unbounded']">
      Movie: Tham Tu Kien<br />
      Monday, 23th May, 2025, 07:00<br />
      Cinema: 123 NVC St, D3, HCM
    </div>

    <NextNaviButton text="SEATINGS" />
    </div>
  </div>
  </div>
);

export default MenuSelectScreen;
