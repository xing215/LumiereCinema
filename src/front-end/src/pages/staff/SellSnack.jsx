import { useState, useEffect, useMemo } from 'react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SnackList from '@/layouts/SellTicket/SnacksList';
import Payment from '@/layouts/SellTicket/Payment';
import TicketDetail from '@components/UI/TicketDetail.jsx';
import { useGetBranchById } from '@hooks/useBranch';
import { useCreateTicket, useGetSnacksByBranch } from '@hooks/useTicket';
import BackwardButton from '@components/buttons/backwardButton2.jsx';
import { useUser } from '@contexts/UserContext.jsx';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';

// SweetAlert for popup notifications
import { showError, showWarning, showInfo } from '@utils/sweetalert.js';



const MENU_STEPS = {
    SNACK: 0,
    PAYMENT: 1,
    TICKET_DISPLAY: 2
};

const SellSnack = () => {
    const { getBranchById, branch, loading: branchLoading, error: branchError } = useGetBranchById();

    const { user } = useUser();    
    const cashierBranchId = useMemo(() => user?.branch?._id, [user]);

    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SNACK);

    const [snackTicketData, setSnackTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: {
            name: 'in-store customer',
            phone: null,
            email: null
        },
        branch: {
            _id: null,
            name: null,
            address: null,
            city: null,
            location: {
                type: null,
                coordinates: null
            },
            isActive: null,
            showings: null
        },
        snackList: [],
        promotionCode: '',
        seller: null,
        total: 0,
        discounted: 0
    });

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
        console.log('Updated snack ticket data:', { ...snackTicketData, ...updates });
    };

    const { getSnacks, snacks, loading: snacksLoading, error: snacksError } = useGetSnacksByBranch();
    const { createTicket, ticket, loading: ticketLoading, error: ticketError } = useCreateTicket();

    useEffect(() => {
        console.log(user, cashierBranchId);
        if (user && cashierBranchId) {
            getBranchById(cashierBranchId);
        }
    }, [cashierBranchId]);

    useEffect(() => {
        if (branch) {
            updateSnackTicket({ branch: branch });
        }
    }, [branch]);

    useEffect(() => {
        if (snackTicketData?.branch?._id) {
            getSnacks(snackTicketData.branch._id);
        }
    }, [snackTicketData.branch._id]);

    // Snack stock validation
    useEffect(() => {
        if (snackTicketData?.branch?._id && snacks && snacks.length > 0) {
            if (Array.isArray(snackTicketData?.snackList) && snackTicketData.snackList.length > 0) {
                let changed = false;
                const newSnackList = snackTicketData.snackList.map(item => {
                    const snack = snacks.find(s => s._id === item.snack);
                    if (!snack) return item;
                    const stock = snack.stock ?? Infinity;
                    if (item.quantity > stock) {
                        changed = true;
                        return { ...item, quantity: stock };
                    }
                    return item;
                });
                if (changed) {
                    showWarning(
                        'Stock Adjustment',
                        'Some snacks in your selection exceed available stock and have been adjusted.'
                    );
                    updateSnackTicket({ snackList: newSnackList, promotion: null, discount: 0 });
                }
            }
        }
    }, [snacks]);

    useEffect(() => {
        if (currentStep == MENU_STEPS.TICKET_DISPLAY) {
            const timer = setTimeout(() => {
                window.location.reload();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    useEffect(() => {
        if (ticket) {
            setCurrentStep(MENU_STEPS.TICKET_DISPLAY);
        } else if (ticketError) {
            if (ticketError.includes('Not enough stock for snack')) {
                showError(
                    'Stock Unavailable',
                    'Your snack selection exceeds available stock. Please adjust your order.'
                );
                setCurrentStep(MENU_STEPS.SNACK);
                updateSnackTicket({ snackList: [] });
                getSnacks(snackTicketData?.branch?._id);
                return;
            }
            showError(
                'Ticket Creation Failed',
                'An error occurred while creating your snack ticket. Please try again.'
            );
            setCurrentStep(MENU_STEPS.PAYMENT);
        }
        // Alert if promotion can't be used (discount is 0 but promotion code exists)
        if (snackTicketData.promotionCode && snackTicketData.discounted === 0) {
            showWarning(
                'Promotion Invalid',
                'Promotion code cannot be used or is not valid for this purchase.'
            );
            updateSnackTicket({ promotionCode: '', promotion: null });
        }
    }, [ticket, ticketError, snackTicketData.promotionCode, snackTicketData.discounted]);

    const goToNextStep = () => {
        if (currentStep === MENU_STEPS.SNACK && (!snackTicketData.snackList || snackTicketData.snackList.length === 0)) {
            showWarning('No Snacks Selected', 'Please select at least one snack before proceeding.', 1000);
            return;
        }
        setCurrentStep(prev => prev + 1);
    };
    const goToPreviousStep = () => setCurrentStep(prev => (prev > 0 ? prev - 1 : 0));


    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.SNACK:
                return (
                    <>
                    <SnackList
                        snacks={snacks}
                        loading={snacksLoading}
                        updateSnackTicket={updateSnackTicket}
                        snackTicketData={snackTicketData}
                        handleNext={goToNextStep}
                    />
                    </>
                );

case MENU_STEPS.PAYMENT:
    return (
        <>
            <div className="absolute top-[4%] scale-90 z-50 md:w-[20%] min-w-[260px]">
                <BackwardButton onClick={goToPreviousStep} />
            </div>
            <Payment
                createTicket={createTicket}
                // sessionExpiresAt={sessionExpiresAt}
                // onExpire={handleSessionExpire}
                snackTicketData={snackTicketData}
                updateSnackTicket={updateSnackTicket}
            />
        </>
    );
            case MENU_STEPS.TICKET_DISPLAY:
                return (
                    <>
                        <div className="absolute w-full top-[4%] h-5 text-center justify-start text-white text-xl font-bold font-['Unbounded']">TICKET IS PRINTING...</div>

                    <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
                        <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden w-[90%] relative">
                            <TicketDetail
                                snackTicketData={snackTicketData}
                                ticket={ticket}
                                isStaff={true}
                            />
                        </div>
                    </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <StaffLayout>
            <MobileNotSupported>
                {currentStep !== MENU_STEPS.SNACK && currentStep !== MENU_STEPS.TICKET_DISPLAY &&
                    <div className='flex justify-center items-center absolute top-[2%] w-full'>
                        <NavigationProgress
                            snackTicketData={snackTicketData}
                            setCurrentStep={setCurrentStep}
                            currentStep={currentStep}
                            MENU_STEPS={MENU_STEPS}
                        />
                    </div>
                }
                {renderCurrentMenu()}
                <SelectBranchButton isLoading={branchLoading} branchName={branch?.name} />
            </MobileNotSupported>
            {/* Background blur effects */}
            <div className="tranform absolute top-0 left-1/5 h-52 w-52 -translate-y-1/2 rounded-full bg-sky-400/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute top-1/4 left-0 h-44 w-44 -translate-x-1/2 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px]" />
            <div className="absolute top-1/2 right-1/11 h-28 w-28 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px]" />
            <div className="tranform absolute right-0 bottom-0 h-56 w-56 translate-x-1/2 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
        </StaffLayout>
    );
};
const NavigationProgress = ({ snackTicketData, setCurrentStep, currentStep, MENU_STEPS }) => {
    const Steps = ({ active = false, onClick, text, connector = false }) => (
        <button className='w-10 h-10 flex items-center justify-center relative cursor-pointer' onClick={onClick} disabled={!active}>
            {connector && (
                <>
                    <div className={`absolute z-2 -left-5 w-8 h-[20px] bg-white transition-all duration-300`} />
                    {active ? (
                        <div className="absolute z-2 -left-5 w-8 h-[10px] bg-pink-400 transition-all duration-300" />
                    ) : (
                        <div className="absolute z-2 -left-5 w-8 h-[10px] bg-white transition-all duration-300" />
                    )}
                </>
            )}
            <div className="w-full h-full absolute bg-white rounded-full" />
            {active ? (
                <div className="absolute z-3 w-7 h-7 bg-pink-400 rounded-full" />
            ) : (
                <div className="w-7 h-7 z-3 absolute bg-white rounded-full" />
            )}
        </button>
    );

    return (
        <div className="relative inline-flex justify-start items-center gap-2">
            <Steps active={currentStep >= MENU_STEPS.SNACK} onClick={() => setCurrentStep(MENU_STEPS.SNACK)} text="Snack" />
            <Steps active={snackTicketData?.snackList.length > 0 || currentStep >= MENU_STEPS.PAYMENT} onClick={() => setCurrentStep(MENU_STEPS.PAYMENT)} text="Pay" connector={true} />
        </div>
    );
}

export default SellSnack;