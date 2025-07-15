import BPoster from '../../components/UI/BPoster';
import NextNaviButton, { BackNaviButton } from '../../components/buttons/NaviButton';
import TicketSelect from '../../components/UI/TicketSelect';
import Seat from '../../components/UI/Seat';
import SeatLayout from '../../components/display/Seats';

const SeatName = ({ type, text }) => (
    <div className="flex w-auto flex-row items-center justify-start gap-3">
        <Seat type={type} />
        <div className="relative justify-start text-center font-['Unbounded'] text-xs font-normal text-white">{text}</div>
    </div>
);

const seatRows = [
    [
        { row: 'A', no: 1, type: 'Normal' },
        { row: 'A', no: 2, type: 'Couple' },
        { row: 'A', no: 3, type: 'Couple' },
        { row: 'A', no: 4, type: 'Normal' },
        { row: 'A', no: 5, type: 'Normal' },
        { row: 'A', no: 6, type: 'Normal' },
        { row: 'A', no: 7, type: 'Normal' },
        { row: 'A', no: 8, type: 'Normal' },
        { row: 'A', no: 9, type: 'Normal' },
        { row: 'A', no: 10, type: 'Normal' },
    ],
    [
        { row: 'B', no: 1, type: 'Normal' },
        { row: 'B', no: 2, type: 'Normal' },
        { row: 'B', no: 3, type: 'Normal' },
        { row: 'B', no: 4, type: 'Normal' },
        { row: 'B', no: 5, type: 'Normal' },
        { row: 'B', no: 6, type: 'Normal' },
        { row: 'B', no: 7, type: 'Normal' },
        { row: 'B', no: 8, type: 'Normal' },
        { row: 'B', no: 9, type: 'Normal' },
        { row: 'B', no: 10, type: 'Normal' },
    ],
    [
        { row: 'C', no: 1, type: 'Normal' },
        { row: 'C', no: 2, type: 'Normal' },
        { row: 'C', no: 3, type: 'Normal' },
        { row: 'C', no: 4, type: 'Normal' },
        { row: 'C', no: 5, type: 'Normal' },
        { row: 'C', no: 6, type: 'Normal' },
        { row: 'C', no: 7, type: 'Normal' },
        { row: 'C', no: 8, type: 'Normal' },
        { row: 'C', no: 9, type: 'Normal' },
        { row: 'C', no: 10, type: 'Normal' },
    ],
    [
        { row: 'D', no: 1, type: 'Normal' },
        { row: 'D', no: 2, type: 'Normal' },
        { row: 'D', no: 3, type: 'Normal' },
        { row: 'D', no: 4, type: 'Normal' },
        { row: 'D', no: 5, type: 'Normal' },
        { row: 'D', no: 6, type: 'Normal' },
        { row: 'D', no: 7, type: 'Normal' },
        { row: 'D', no: 8, type: 'Normal' },
        { row: 'D', no: 9, type: 'Normal' },
        { row: 'D', no: 10, type: 'Normal' },
    ],
    [
        { row: 'E', no: 1, type: 'VIP' },
        { row: 'E', no: 2, type: 'VIP' },
        { row: 'E', no: 3, type: 'Normal' },
        { row: 'E', no: 4, type: 'Normal' },
        { row: 'E', no: 5, type: 'Normal' },
        { row: 'E', no: 6, type: 'Normal' },
        { row: 'E', no: 7, type: 'Normal' },
        { row: 'E', no: 8, type: 'Normal' },
        { row: 'E', no: 9, type: 'Normal' },
        { row: 'E', no: 10, type: 'Normal' },
    ],
    [
        { row: 'F', no: 1, type: 'VIP' },
        { row: 'F', no: 2, type: 'VIP' },
        { row: 'F', no: 3, type: 'Normal' },
        { row: 'F', no: 4, type: 'Normal' },
        { row: 'F', no: 5, type: 'Normal' },
        { row: 'F', no: 6, type: 'Normal' },
        { row: 'F', no: 7, type: 'Normal' },
        { row: 'F', no: 8, type: 'Normal' },
        { row: 'F', no: 9, type: 'Normal' },
        { row: 'F', no: 10, type: 'Normal' },
    ],
    [
        { row: 'G', no: 1, type: 'Normal' },
        { row: 'G', no: 2, type: 'Normal' },
        { row: 'G', no: 3, type: 'Couple' },
        { row: 'G', no: 4, type: 'Couple' },
        { row: 'G', no: 5, type: 'Normal' },
        { row: 'G', no: 6, type: 'Normal' },
        { row: 'G', no: 7, type: 'Normal' },
        { row: 'G', no: 8, type: 'Normal' },
        { row: 'G', no: 9, type: 'Normal' },
        { row: 'G', no: 10, type: 'Normal' },
    ],
    [
        { row: 'H', no: 1, type: 'Normal' },
        { row: 'H', no: 2, type: 'Normal' },
        { row: 'H', no: 3, type: 'Normal' },
        { row: 'H', no: 4, type: 'Normal' },
        { row: 'H', no: 5, type: 'Normal' },
        { row: 'H', no: 6, type: 'Normal' },
        { row: 'H', no: 7, type: 'Normal' },
        { row: 'H', no: 8, type: 'Normal' },
        { row: 'H', no: 9, type: 'Normal' },
        { row: 'H', no: 10, type: 'Normal' },
    ],
    [
        { row: 'I', no: 1, type: 'Normal' },
        { row: 'I', no: 2, type: 'Normal' },
        { row: 'I', no: 3, type: 'Normal' },
        { row: 'I', no: 4, type: 'Normal' },
        { row: 'I', no: 5, type: 'Normal' },
        { row: 'I', no: 6, type: 'Normal' },
        { row: 'I', no: 7, type: 'Normal' },
        { row: 'I', no: 8, type: 'Normal' },
        { row: 'I', no: 9, type: 'Normal' },
    ],
    [
        { row: 'J', no: 1, type: 'Normal' },
        { row: 'J', no: 2, type: 'Normal' },
        { row: 'J', no: 3, type: 'Normal' },
        { row: 'J', no: 4, type: 'Normal' },
        { row: 'J', no: 5, type: 'Normal' },
        { row: 'J', no: 6, type: 'Normal' },
        { row: 'J', no: 7, type: 'Normal' },
        { row: 'J', no: 8, type: 'Normal' },
        { row: 'J', no: 9, type: 'Normal' },
        { row: 'J', no: 10, type: 'Normal' },
    ],
];

const MenuSelectSeats = ({ onNext, onBack }) => {
    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[80vw]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                {/* Poster */}
                <div className="relative hidden md:block">
                    <BPoster Pics="src/assets/sample/ThamTuKien.jpg" />
                </div>
                {/* Main content */}
                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className="relative flex flex-col items-center justify-between px-4 py-5 md:px-6 lg:flex-row">
                        <div className="relative flex shrink flex-row items-center justify-center gap-3 md:w-[20vw] lg:w-[15vw] lg:flex-col lg:justify-start lg:gap-1">
                            <TicketSelect ticket_type="Adult" />
                            <div className="h-2 w-10 md:h-3" />
                            <TicketSelect ticket_type="Student/ Elders" />
                            <div className="h-4 md:h-5" />

                            <div className="hidden h-auto w-full flex-row flex-wrap justify-start gap-3 lg:flex">
                                <SeatName type="normal" text="Normal Seat" />
                                <SeatName type="vip" text="VIP Seat" />
                                <SeatName type="couple" text="Couple Seat" />
                            </div>
                        </div>
                        <div className="flex h-auto w-full flex-row flex-wrap justify-start gap-3 py-5 lg:hidden">
                            <SeatName type="normal" text="Normal Seat" />
                            <SeatName type="vip" text="VIP Seat" />
                            <SeatName type="couple" text="Couple Seat" />
                        </div>
                        <div className="h-full w-[10%]" />
                        <div className="relative flex justify-center px-4 py-4">
                            <SeatLayout data={seatRows} />
                        </div>
                    </div>

                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="w-80 text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            Monday, 23th May, 2025, 07:00
                            <br />
                            Cinema: 123 NVC St, D3, HCM
                        </div>
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="SNACKS" onClick={onNext} />
                    </div>
                </div>

                <div className="fixed right-0 bottom-0 left-0 z-50 flex h-15 flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm md:hidden">
                    <BackNaviButton onClick={onBack} />
                    <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">
                        Movie: Tham Tu Kien
                        <br />
                        Monday, 23th May, 2025, 07:00
                        <br />
                        Cinema: 123 NVC St, D3, HCM
                    </div>

                    <NextNaviButton text="SNACKS" onClick={onNext} />
                </div>
            </div>
        </div>
    );
};

export default MenuSelectSeats;
