import { useEffect, useState } from 'react';
import CinemaPopUp from '@components/UI/CinemaPopUp';
import { ChooseCinemaButton } from '@layouts/TicketPurchase/MenuSelectScreen';
import { useFetchBranches } from '@/hooks/useBranch';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';

// SweetAlert for popup notifications
import { showError, showWarning, showInfo } from '@utils/sweetalert.js';

const MenuSelectCinema = ({ snackTicketData, updateSnackTicket, onBack, onNext, getSnacks }) => {
    const [isCinemaPopupOpen, setIsCinemaPopupOpen] = useState(false);
    const { fetchBranches, branches, loading: branchLoading, error: branchError } = useFetchBranches();
    const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleBranchSelect = (branch) => {
        updateSnackTicket({ branch });
        setIsCinemaPopupOpen(false);
    };

    const handleNextClick = () => {
        if (!snackTicketData.branch || !snackTicketData.branch._id) {
            showInfo('Selection Required', 'Please select a cinema before proceeding.');
            return;
        }
        onNext();
        getSnacks(snackTicketData?.branch?._id);
    };

    useEffect(() => {
        fetchBranches();
    }, []);

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
            <div className="relative flex h-full w-full flex-row justify-center rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                <div className="relative flex min-h-[400px] w-full flex-col items-center justify-center py-10">
                    <ChooseCinemaButton onClick={() => setIsCinemaPopupOpen(true)} label={snackTicketData.branch?.name} loading={branchLoading} branches={branches} error={branchError} />
                    <CinemaPopUp
                        isOpen={isCinemaPopupOpen}
                        onClose={() => setIsCinemaPopupOpen(false)}
                        onCinemaSelect={handleBranchSelect}
                        cinemas={branches}
                        selectedCinema={snackTicketData.branch}
                    />

                    <div className="absolute bottom-0 hidden h-auto w-auto flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 md:flex md:px-10 lg:px-12">
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="SNACKS" onClick={handleNextClick} />
                    </div>
                </div>
                <div
                    className={`fixed right-0 bottom-0 left-0 z-50 flex h-auto flex-row items-center justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-4 py-2 backdrop-blur-sm transition-transform duration-300 ease-in-out md:hidden ${isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
                >
                    <BackNaviButton onClick={onBack} />
                    <div className="relative flex-1 text-center font-['Unbounded'] text-[9px] font-semibold text-white">Cinema: {snackTicketData.branch?.name || 'Select a cinema'}</div>
                    <NextNaviButton text={'SNACKS'} onClick={handleNextClick} />
                </div>
            </div>
        </div>
    );
};

export default MenuSelectCinema;
