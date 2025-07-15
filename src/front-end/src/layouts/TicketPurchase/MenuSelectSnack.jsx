import NextNaviButton, { BackNaviButton } from '../../components/buttons/NaviButton';
import SnackSelect from '../../components/UI/SnackSelect';

const MenuSelectSnack = () => (
    <div className="relative flex w-screen items-center justify-center pt-3 md:pt-5">
        <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
            {/* Background layer */}
            <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge" />
            {/* Main content */}
            <div className="relative flex flex-1 flex-col items-center justify-between">
                <div className="inline-flex w-[90vw] flex-wrap items-start justify-start gap-5 pt-5 pl-2.5 md:pt-7 lg:w-[calc(70vw)]">
                    <SnackSelect snack_type="Combo 1 - 1 popcorn + 1 drink" />
                    <SnackSelect snack_type="Combo 1 - 1 popcorn + 1 drink" />
                    <SnackSelect snack_type="Combo 1 - 1 popcorn + 1 drink" />
                    <SnackSelect snack_type="Combo 1 - 1 popcorn + 1 drink" />
                    <SnackSelect snack_type="Combo 1 - 1 popcorn + 1 drink" />
                    <SnackSelect snack_type="Combo 1 - 1 popcorn + 1 drink" />
                </div>
                {/* Desktop footer */}
                <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                    <div className="bottom-0 w-80 text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                        Monday, 23rd May, 2025, 07:00
                        <br />
                        Cinema: 123 NVC St, D3, HCM
                    </div>
                    <BackNaviButton />
                    <NextNaviButton text="SEATINGS" />
                </div>
            </div>
        </div>
        {/* Mobile footer */}
        <div className="fixed right-0 bottom-0 left-0 z-50 flex h-15 flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 pr-4 backdrop-blur-sm sm:pr-8 md:hidden md:pr-10 lg:pr-12">
            <div className="relative flex-1 text-right font-['Unbounded'] text-[9px] font-semibold text-white">
                Movie: Tham Tu Kien
                <br />
                Monday, 23rd May, 2025, 07:00
                <br />
                Cinema: 123 NVC St, D3, HCM
            </div>
            <BackNaviButton />
            <NextNaviButton text="SEATINGS" />
        </div>
    </div>
);

export default MenuSelectSnack;
