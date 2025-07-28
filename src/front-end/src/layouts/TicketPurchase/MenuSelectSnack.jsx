import { useState, useEffect } from 'react';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import SnackSelect from '@components/UI/SnackSelect';
import { useGetSnacks } from '@hooks/useBranch';
import Combo1 from '@assets/img/combo1.png';
import { useUser } from '@contexts/UserContext';

const MenuSelectSnack = ({ onNext, onBack, snackTicketData, updateSnackTicket, mustBuy=false }) => {
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    // Use snackTicketData.snack as the source of truth for selected snacks
    const { getSnacks, snacks, loading, error } = useGetSnacks();
    const { isAuthenticated } = useUser();
    

    useEffect(() => {
        // Fetch snacks when component mounts
        getSnacks(snackTicketData?.branch?._id);
    }, []);

    // Handle snack selection
    const handleSnackAdd = (snackId, quantity = 1, snackName = '', cost) => {
        const snacks = Array.isArray(snackTicketData?.snackList) ? [...snackTicketData.snackList] : [];
        const existingIndex = snacks.findIndex(item => item.snack === snackId);
        let newSnackList;
        if (existingIndex >= 0) {
            newSnackList = [...snacks];
            newSnackList[existingIndex].quantity += quantity;
        } else {
            newSnackList = [...snacks, { snack: snackId, quantity, snackName}];
        }
        const newSnackValue = (snackTicketData?.total || 0) + (cost * quantity);
        updateSnackTicket({ total: newSnackValue });
        updateSnackTicket({ snackList: newSnackList });
    };

    // Handle snack removal
    const handleSnackRemove = (snackId, cost) => {
        const snacks = Array.isArray(snackTicketData?.snackList) ? [...snackTicketData.snackList] : [];
        const existingIndex = snacks.findIndex(item => item.snack === snackId);
        if (existingIndex === -1) return;   
        let newSnackList = [...snacks];
        if (newSnackList[existingIndex].quantity > 1) {
            newSnackList[existingIndex].quantity -= 1;
        } else {
            newSnackList.splice(existingIndex, 1);
        }
        const newSnackValue = (snackTicketData?.total - cost) || 0;
        updateSnackTicket({ total: newSnackValue });
        updateSnackTicket({ snackList: newSnackList });
    };

    const handleNext = () => {
        if (mustBuy && (!snackTicketData?.snackList || snackTicketData.snackList.length === 0)) {
            alert('Please select at least one snack before proceeding.');
            return;
        }
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
            <div className="relative flex h-full w-full flex-row min-h-[300px] justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                {/* Main content */}
                <div className="relative flex flex-1 flex-col items-center justify-between">
                    <div className="inline-flex w-[90vw] h-auto flex-wrap items-start justify-start gap-5 pt-5 pl-2.5 md:pt-7 lg:w-[calc(70vw)]">
                        {loading ? (
                            <div className="text-white w-full text-center">• • •</div>
                        ) : Array.isArray(snacks) && snacks.length > 0 ? (
                            snacks.map(snack => (
                                <SnackSelect
                                    key={snack._id}
                                    snack_type={snack.name}
                                    description={snack.description}
                                    price={snack.price}
                                    onAdd={() => handleSnackAdd(snack._id, 1, snack.name, snack.price)}
                                    onRemove={() => handleSnackRemove(snack._id, snack.price)}
                                    quantity={
                                        (Array.isArray(snackTicketData?.snackList)
                                            ? snackTicketData.snackList.find(s => s.snack === (snack._id))?.quantity
                                            : 0) || 0
                                    }
                                    img={snack.imageURL || Combo1}
                                />
                            ))
                        ) : (
                            <div className="text-white w-auto m-auto font-['Unbounded']">No snacks available.</div>
                        )}
                    </div>
                    <div className="h-3 md:h-5" />
                    {/* Desktop footer */}
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="bottom-0 w-80 text-right font-['Unbounded'] text-[10px] font-semibold text-white">
                            {/* TODO: Replace with actual selected movie/schedule info if available */}
                            {/* You can pass these as props if needed */}
                            Snack: {Array.isArray(snackTicketData?.snackList)&& snackTicketData.snackList.length > 0
        ? snackTicketData.snackList.map(c => `${c.quantity} ${c.snackName}`).join(', ')
        : 'Select snacks for your watching experience'}
                        </div>
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="INFO" onClick={handleNext} />
                    </div>
                </div>
            </div>
            {/* Mobile footer */}
            <div
                className={`fixed right-0 bottom-0 left-0 z-50 flex h-auto flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
            >
                <BackNaviButton onClick={onBack} />
                <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white py-2">
                    {/* TODO: Replace with actual selected movie/schedule info if available */}
                           Snack: {Array.isArray(snackTicketData?.snackList)&& snackTicketData.snackList.length > 0
        ? snackTicketData.snackList.map(c => `${c.quantity} ${c.snackName}`).join(', ')
        : 'Select snacks for your watching experience'}
                </div>
                <NextNaviButton text={isAuthenticated ? `PAYMENT` : `INFO`} onClick={handleNext} />
            </div>
        </div>
    );
};

export default MenuSelectSnack;
