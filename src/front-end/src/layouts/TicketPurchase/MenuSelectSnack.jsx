// ================================ IMPORTS ================================
import { useState, useEffect } from 'react';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import SnackSelect from '@components/UI/SnackSelect';
import Combo1 from '@assets/img/combo1.png';
import { useUser } from '@contexts/UserContext';

// SweetAlert for popup notifications
import { showError, showWarning, showInfo } from '@utils/sweetalert.js';

// ================================ MAIN COMPONENT ================================

const MenuSelectSnack = ({ onNext, onBack, snackTicketData, updateSnackTicket, mustBuy = false, loading, snacks = [], getSnacks }) => {
    // ================================ STATE MANAGEMENT ================================

    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { isAuthenticated } = useUser();

    // ================================ DATA FETCHING EFFECTS ================================

    useEffect(() => {
        if (snacks.length === 0) {
            getSnacks(snackTicketData?.branch?._id);
        }
    }, []);

    // ================================ EVENT HANDLERS ================================

    const handleSnackChange = (shortname, newQuantity, snackName, price) => {
        const snacksArr = Array.isArray(snackTicketData?.snackList) ? [...snackTicketData.snackList] : [];
        const existingIndex = snacksArr.findIndex((item) => item.shortname === shortname);

        // Stock validation
        const snackObj = Array.isArray(snacks) ? snacks.find((s) => s.shortname === shortname) : null;
        const stock = snackObj?.stock.total ?? Infinity;
        if (newQuantity > stock) {
            showWarning('Stock Unavailable', `Only ${stock} of this snack is available in stock.`);
            return;
        }

        let newSnackList;
        if (existingIndex >= 0) {
            if (newQuantity > 0) {
                newSnackList = [...snacksArr];
                newSnackList[existingIndex].quantity = newQuantity;
            } else {
                newSnackList = [...snacksArr];
                newSnackList.splice(existingIndex, 1);
            }
        } else if (newQuantity > 0) {
            newSnackList = [...snacksArr, { shortname, quantity: newQuantity, name: snackName }];
        } else {
            newSnackList = [...snacksArr];
        }

        // Calculate new total
        const total = newSnackList.reduce((sum, item) => {
            const snack = snacks.find((s) => s.shortname === item.shortname);
            return sum + (snack ? snack.price * item.quantity : 0);
        }, 0);

        updateSnackTicket({ snackList: newSnackList, total });
    };

    // ================================ NAVIGATION FUNCTIONS ================================

    const handleNext = () => {
        if (mustBuy && (!snackTicketData?.snackList || snackTicketData.snackList.length === 0)) {
            showInfo('Selection Required', 'Please select at least one snack before proceeding.');
            return;
        }
        onNext();
    };

    // ================================ SCROLL EFFECTS ================================

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

    // ================================ UTILITY FUNCTIONS ================================

    const getSelectedSnacksText = () => {
        if (Array.isArray(snackTicketData?.snackList) && snackTicketData.snackList.length > 0) {
            return snackTicketData.snackList.map((c) => `${c.quantity} ${c.name}`).join(', ');
        }
        return 'Select snacks for your watching experience';
    };

    const renderSnacks = () => {
        if (loading) {
            return <div className="w-full text-center text-white">• • •</div>;
        }

        if (!Array.isArray(snacks) || snacks.length === 0) {
            return <div className="m-auto w-auto font-['Unbounded'] text-white">No snacks available.</div>;
        }

        const totalQty = snacks.reduce((sum, snack) => sum + (snack.stock.total || 0), 0);
        if (totalQty === 0) {
            return <div className="m-auto w-auto font-['Unbounded'] text-white">No snacks available.</div>;
        }

        return snacks
            .filter((snack) => snack.stock.total > 0)
            .map((snack) => (
                <SnackSelect
                    key={snack._id}
                    snack_type={snack.name}
                    description={snack.description}
                    price={snack.price}
                    onChange={(fn) => {
                        const currentQty = (Array.isArray(snackTicketData?.snackList) ? snackTicketData.snackList.find((s) => s.shortname === snack.shortname)?.quantity : 0) || 0;
                        const newQty = typeof fn === 'function' ? fn(currentQty) : fn;
                        handleSnackChange(snack.shortname, newQty, snack.name, snack.price);
                    }}
                    quantity={(Array.isArray(snackTicketData?.snackList) ? snackTicketData.snackList.find((s) => s.shortname === snack.shortname)?.quantity : 0) || 0}
                    img={snack.imageURL || Combo1}
                    stock={snack.stock.total || 0}
                />
            ));
    };

    // ================================ RENDER ================================

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full min-h-[400px] w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />

                {/* Main content */}
                <div className="relative flex flex-1 flex-col items-center justify-between">
                    <div className="inline-flex h-auto w-[90vw] flex-wrap items-start justify-start gap-5 pt-5 pl-2.5 md:pt-7 lg:w-[calc(70vw)]">{renderSnacks()}</div>

                    <div className="h-3 md:h-5" />

                    {/* Desktop Navigation */}
                    <div className="hidden h-auto w-full flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <div className="bottom-0 w-80 text-right font-['Unbounded'] text-[10px] font-semibold text-white">Snack: {getSelectedSnacksText()}</div>
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="INFO" onClick={handleNext} />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div
                className={`fixed right-0 bottom-0 left-0 z-50 flex h-auto flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 py-2 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
            >
                <BackNaviButton onClick={onBack} />
                <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">Snack: {getSelectedSnacksText()}</div>
                <NextNaviButton text={isAuthenticated ? 'PAYMENT' : 'INFO'} onClick={handleNext} />
            </div>
        </div>
    );
};

export default MenuSelectSnack;
