import { useState, useEffect } from 'react';
import NextNaviButton, { BackNaviButton } from '../../components/buttons/NaviButton';
import SnackSelect from '../../components/UI/SnackSelect';

const MenuSelectSnack = ({ onNext, onBack, snackTicketData, updateSnackTicket }) => {
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [selectedSnacks, setSelectedSnacks] = useState(snackTicketData.snackList || []);

    // Handle snack selection
    const handleSnackAdd = (snackId, quantity = 1) => {
        const existingIndex = selectedSnacks.findIndex(item => item.snack === snackId);
        let newSnackList;

        if (existingIndex >= 0) {
            // Update existing snack quantity
            newSnackList = [...selectedSnacks];
            newSnackList[existingIndex].quantity += quantity;
        } else {
            // Add new snack
            newSnackList = [...selectedSnacks, { snack: snackId, quantity }];
        }

        setSelectedSnacks(newSnackList);
        updateSnackTicket({ snackList: newSnackList });
        calculateTotal(newSnackList);
    };

    // Handle snack removal
    const handleSnackRemove = (snackId) => {
        const newSnackList = selectedSnacks.filter(item => item.snack !== snackId);
        setSelectedSnacks(newSnackList);
        updateSnackTicket({ snackList: newSnackList });
        calculateTotal(newSnackList);
    };

    // Calculate total price for snacks
    const calculateTotal = (snackList = selectedSnacks) => {
        // Mock pricing - replace with actual snack pricing
        const snackPrices = {
            'snack1': 50000,
            'snack2': 75000,
            'snack3': 120000,
        };

        const total = snackList.reduce((sum, item) => {
            const price = snackPrices[item.snack] || 50000;
            return sum + (price * item.quantity);
        }, 0);

        updateSnackTicket({ total });
        return total;
    };

    const handleNext = () => {
        calculateTotal();
        onNext();
    };

    useEffect(() => {
        const controlBottomBar = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY) {
                setIsBottomBarVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsBottomBarVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlBottomBar);

        return () => {
            window.removeEventListener('scroll', controlBottomBar);
        };
    }, [lastScrollY]);

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                {/* Main content */}
                <div className="relative flex flex-1 flex-col items-center justify-between">
                    <div className="inline-flex w-[90vw] flex-wrap items-start justify-start gap-5 pt-5 pl-2.5 md:pt-7 lg:w-[calc(70vw)]">
                        <SnackSelect 
                            snack_type="Combo 1 - 1 popcorn + 1 drink" 
                            snackId="snack1"
                            price={50000}
                            onAdd={() => handleSnackAdd('snack1')}
                            onRemove={() => handleSnackRemove('snack1')}
                            quantity={selectedSnacks.find(s => s.snack === 'snack1')?.quantity || 0}
                        />
                        <SnackSelect 
                            snack_type="Combo 2 - 2 popcorn + 2 drink" 
                            snackId="snack2"
                            price={75000}
                            onAdd={() => handleSnackAdd('snack2')}
                            onRemove={() => handleSnackRemove('snack2')}
                            quantity={selectedSnacks.find(s => s.snack === 'snack2')?.quantity || 0}
                        />
                        <SnackSelect 
                            snack_type="Premium Combo - Large popcorn + Large drink + Nachos" 
                            snackId="snack3"
                            price={120000}
                            onAdd={() => handleSnackAdd('snack3')}
                            onRemove={() => handleSnackRemove('snack3')}
                            quantity={selectedSnacks.find(s => s.snack === 'snack3')?.quantity || 0}
                        />
                        <SnackSelect 
                            snack_type="Hot Dog Combo" 
                            snackId="snack4"
                            price={85000}
                            onAdd={() => handleSnackAdd('snack4')}
                            onRemove={() => handleSnackRemove('snack4')}
                            quantity={selectedSnacks.find(s => s.snack === 'snack4')?.quantity || 0}
                        />
                        <SnackSelect 
                            snack_type="Candy Mix" 
                            snackId="snack5"
                            price={35000}
                            onAdd={() => handleSnackAdd('snack5')}
                            onRemove={() => handleSnackRemove('snack5')}
                            quantity={selectedSnacks.find(s => s.snack === 'snack5')?.quantity || 0}
                        />
                        <SnackSelect 
                            snack_type="Ice Cream" 
                            snackId="snack6"
                            price={25000}
                            onAdd={() => handleSnackAdd('snack6')}
                            onRemove={() => handleSnackRemove('snack6')}
                            quantity={selectedSnacks.find(s => s.snack === 'snack6')?.quantity || 0}
                        />
                    </div>
                    <div className="h-3 md:h-5" />
                    {/* Desktop footer */}
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="bottom-0 w-80 text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            {/* TODO: Replace with actual selected movie/schedule info if available */}
                            {/* You can pass these as props if needed */}
                            {snackTicketData && snackTicketData.branch ? (
                                <>
                                    {/* Optionally display date/time if available */}
                                    Cinema: {snackTicketData.branch}
                                </>
                            ) : (
                                <>Cinema: Not selected</>
                            )}
                        </div>
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="INFO" onClick={handleNext} />
                    </div>
                </div>
            </div>
            {/* Mobile footer */}
            <div
                className={`fixed right-0 bottom-0 left-0 z-50 flex h-15 flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
            >
                <BackNaviButton onClick={onBack} />
                <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">
                    {/* TODO: Replace with actual selected movie/schedule info if available */}
                    {snackTicketData && snackTicketData.branch ? (
                        <>
                            Cinema: {snackTicketData.branch}
                        </>
                    ) : (
                        <>Cinema: Not selected</>
                    )}
                </div>
                <NextNaviButton text="INFO" onClick={handleNext} />
            </div>
        </div>
    );
};

export default MenuSelectSnack;
