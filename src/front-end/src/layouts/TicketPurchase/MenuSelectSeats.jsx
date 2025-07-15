import BPoster from "../../components/UI/BPoster";
import NextNaviButton, { BackNaviButton } from "../../components/buttons/NaviButton";
import TicketSelect from "../../components/UI/TicketSelect";
import Seat from "../../components/UI/Seat";

const SeatName = ({ type, text }) => (
  <div className="w-auto flex flex-row justify-start items-center gap-3">
    <Seat type={type} />
    <div className="relative text-center justify-start text-white text-xs font-normal font-['Unbounded']">
      {text}
    </div>
  </div>
);

const MenuSelectSeats = () => {
  return (
    <div className="relative flex items-center justify-center w-screen pt-3 sm:pt-6 md:pt-9 lg:pt-14">
      <div className="relative flex flex-row justify-start w-full h-full md:min-h-[470px] md:w-screen lg:w-[75vw] lg:h-auto rounded-xl">
        {/* Background layer */}
        <div className="absolute inset-0 mix-blend-color-dodge bg-zinc-300/30 rounded-xl pointer-events-none z-0" />
        {/* Poster */}
        <div className="hidden md:block">
          <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
        </div>
        {/* Main content */}
        <div className="relative flex flex-col justify-between items-center flex-1 min-w-[55vw]">
          <div className="relative flex flex-col md:flex-row justify-between items-center">
            <div className="lg:w-[15vw] md:w-[20vw] relative flex flex-row md:flex-col justify-start items-center shrink md:px-1 py-5 md:py-0">
              <div className="h-5 md:h-7" />
              <TicketSelect ticket_type="Adult" />
              <div className="h-2 md:h-3 w-10" />
              <TicketSelect ticket_type="Student/ Elders" />
              <div className="h-4 md:h-5" />
              <div className="hidden w-full h-auto md:flex flex-row justify-start flex-wrap gap-3">
                <SeatName type="normal" text="Normal Seat" />
                <SeatName type="vip" text="VIP Seat" />
                <SeatName type="couple" text="Couple Seat" />
              </div>
            </div>
            <div className="flex w-full h-auto md:hidden flex-row justify-start flex-wrap gap-3 py-5">
              <SeatName type="normal" text="Normal Seat" />
              <SeatName type="vip" text="VIP Seat" />
              <SeatName type="couple" text="Couple Seat" />
            </div>
            <div className="w-[2vw]" />
            <div className="relative flex flex-col justify-start items-center lg:w-[35vw] md:w-[40vw]" />
          </div>
          <div className="hidden md:flex flex-row gap-2 justify-end items-center w-full h-auto px-4 sm:px-8 md:px-10 lg:px-12 pb-6">
            <div className="w-80 text-right text-white text-[10px] font-semibold font-['Unbounded']">
              Monday, 23th May, 2025, 07:00<br />
              Cinema: 123 NVC St, D3, HCM
            </div>
            <BackNaviButton />
            <NextNaviButton text="SEATINGS" />
          </div>
        </div>
        {/* Mobile footer */}
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
};

export default MenuSelectSeats;
