import BPoster from "../../components/UI/BPoster";
import NextNaviButton from "../../components/buttons/NaviButton";
import {BackNaviButton} from "../../components/buttons/NaviButton";

const MenuSelectSeats = () => {
  return (
      <div className="relative flex items-center justify-center w-screen pt-3 sm:pt-6 md:pt-9 lg:pt-14">
  <div className="relative flex flex-row justify-start w-full h-full md:h-[470px] md:w-screen lg:w-[calc(75vw)] lg:h-auto rounded-xl">
    {/* Background layer with blend mode */}
    <div className="absolute inset-0 mix-blend-color-dodge bg-zinc-300/30 rounded-xl pointer-events-none z-0" />
    {/* Content layer */}
    <div className="hidden md:block">
    <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
    </div>
    <div className="relative flex flex-col flex-1 justify-between items-center shrink">
    <div className="relative flex flex-col justify-start items-center">
      <div className="h-3 md:h-7" />
      {/* <DateSlider /> */}
      <div className="md:hidden pt-5 w-[55vw] overflow-hidden rounded-xl">
      <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
      </div>
      <div className="h-5 md:h-7" />
      {/* <ChooseCinemaButton /> */}
      <div className="h-3 md:h-5" />
      {/* <TimeGrid time="07:00" /> */}
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-t border-white/10 flex flex-row gap-2 justify-end items-center pr-4 sm:pr-8 md:pr-10 lg:pr-12 h-15">
    <div className="flex-1 relative text-right text-white text-[9px] font-semibold font-['Unbounded']">
      Movie: Tham Tu Kien<br />
      Monday, 23th May, 2025, 07:00<br />
      Cinema: 123 NVC St, D3, HCM
    </div>
    <BackNaviButton />
    <NextNaviButton text="SEATINGS" />
    </div>
  </div>
  </div>
);
}

export default MenuSelectSeats;