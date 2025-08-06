import { useEffect, useState } from 'react';
import CinemaPopUp from '@components/UI/CinemaPopUp';
import {ChooseCinemaButton} from '@layouts/TicketPurchase/MenuSelectScreen';
import {useFetchBranches} from '@/hooks/useBranch'; 
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';

// SweetAlert for popup notifications
import { showError, showWarning, showInfo } from '@utils/sweetalert.js';

const MenuSelectCinema = ({ snackTicketData, updateSnackTicket, onBack, onNext, getSnacks }) => {
    const [isCinemaPopupOpen, setIsCinemaPopupOpen] = useState(false);
    const { fetchBranches, branches, loading: branchLoading, error: branchError } = useFetchBranches();

    const handleBranchSelect = (branch) => {
        updateSnackTicket({ branch });
        setIsCinemaPopupOpen(false);
    };

    const handleNextClick = () => {
        if (!snackTicketData.branch || !snackTicketData.branch._id) {
            showInfo(
                'Selection Required',
                'Please select a cinema before proceeding.'
            );
            return;
        }
        onNext();
        getSnacks(snackTicketData?.branch?._id)

    };

    useEffect(() => {
        fetchBranches();
    }, []);

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-center rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                <div className="relative flex flex-col w-full items-center justify-center">
                    <ChooseCinemaButton
                        onClick={() => setIsCinemaPopupOpen(true)}
                        label={snackTicketData.branch?.name}
                        loading={branchLoading}
                        branches={branches}
                        error={branchError}
                    />
                    <CinemaPopUp
                        isOpen={isCinemaPopupOpen}
                        onClose={() => setIsCinemaPopupOpen(false)}
                        onCinemaSelect={handleBranchSelect}
                        cinemas={branches}
                        selectedCinema={snackTicketData.branch}
                    />

                    <div className="absolute bottom-0 h-auto w-auto flex-row items-center justify-end gap-2 px-4 pb-6 sm:px-8 flex md:px-10 lg:px-12">
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton text="SNACKS" onClick={handleNextClick} />
                    </div>
                    <div className="md:hidden h-10"/>
                </div>
            </div>
        </div>
    );
};

export default MenuSelectCinema;
