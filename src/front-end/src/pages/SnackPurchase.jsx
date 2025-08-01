// src/pages/SnackPurchase.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Header from '@layouts/LandingPage/Header.jsx';
import { Title } from '@components/UI/label.jsx';
import MenuSelectSnack from '@layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '@layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '@layouts/TicketPurchase/MenuPayment.jsx';
import MenuTicketDisplay from '@layouts/TicketPurchase/MenuTicketDisplay.jsx';
import { useCreateTicket, useGetSnacksByBranch } from '@hooks/useTicket';
import MenuSelectCinema from '@/layouts/TicketPurchase/MenuSelectCinema';
import Footer from '@layouts/LandingPage/Footer.jsx';
import { useGetBranchById } from '@/hooks/useBranch';
import { useUser } from '@contexts/UserContext';
import { useGetSnacks } from '@hooks/useBranch';


const MENU_STEPS = {
    CINEMA:0,
    SNACK: 1,
    INFO: 2,
    PAYMENT: 3,
    TICKET_DISPLAY: 4
};

const SnackPurchase = () => {
    const location = useLocation();
    const [urlparm] = useSearchParams();
    const branchId = urlparm.get('branchId');
    const locationHook = useLocation();

    // Hooks for fetching branch data
    const { getBranchById, branch, loading: branchLoading, error: branchError } = useGetBranchById();
    const { getSnacks, snacks, loading: snacksLoading, error: snacksError } = useGetSnacksByBranch();


    const passedNoLoginCustomerInfo = locationHook.state?.noLoginCustomerInfo || {
        name: null,
        phone: null,
        email: null
    };

    const [snackTicketData, setSnackTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: passedNoLoginCustomerInfo,
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
        total: 0
    });

    useEffect(() => {
        if (branchId && branchId !== 'null') {
            getBranchById(branchId);
        }
    }, [branchId]);

    useEffect(() => {
        if (branch && branch._id) {
            const branchData = {
                _id: branch._id,
                name: branch.name,
                address: branch.address,
                city: branch.city,
                location: branch.location,
                isActive: branch.isActive,
                showings: branch.showings
            };
            updateSnackTicket({ branch: branchData });
        }
    }, [branch]);

    const navigate = useNavigate();

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
    };

    const { isAuthenticated } = useUser();
    
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.CINEMA);

    const goToNextStep = () => {
            if(currentStep === MENU_STEPS.SNACK && !isAuthenticated) {
                setCurrentStep(MENU_STEPS.INFO);
                return;
            } else if (currentStep === MENU_STEPS.SNACK && isAuthenticated) {
                setCurrentStep(MENU_STEPS.PAYMENT);
                return;
            }

        if (currentStep < MENU_STEPS.TICKET_DISPLAY) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
                if (currentStep === MENU_STEPS.PAYMENT && !isAuthenticated) {
                setCurrentStep(MENU_STEPS.INFO);
                return;
            } else if (currentStep === MENU_STEPS.PAYMENT && isAuthenticated) {
                setCurrentStep(MENU_STEPS.SNACK);
                return;
            }
        if (currentStep === MENU_STEPS.CINEMA) {
            navigate(-1);
            return;
        }
        if (currentStep > MENU_STEPS.CINEMA) {
            setCurrentStep(currentStep - 1);
        }
    };


    const { createTicket, ticket, loading: ticketLoading, error: ticketError } = useCreateTicket();

    const handlePaymentComplete = async () => {
        await createTicket({ snackTicketData });
    };

    useEffect(() => {
        if (ticket) {
            console.log('Snack ticket created successfully:', ticket);
            setCurrentStep(MENU_STEPS.TICKET_DISPLAY);
        } else if (ticketError) {
            if (ticketError.includes('Not enough stock for snack')) {
                alert('Your snack selection exceeds available stock. Please adjust your order.');
                setCurrentStep(MENU_STEPS.SNACK)
                setSnackTicketData({snackList:[]})
                getSnacks(snackTicketData?.branch?._id)
                return
            }
            console.error('Error creating snack ticket:', ticketError);
            alert('An error occurred while creating your snack ticket. Please try again.');
            setCurrentStep(MENU_STEPS.PAYMENT);
        }
    }, [ticket, ticketError]);

    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.CINEMA:
                return (
                    <MenuSelectCinema 
                        snackTicketData={snackTicketData} 
                        updateSnackTicket={updateSnackTicket}
                        onBack={goToPreviousStep}
                        onNext={goToNextStep}
                        getSnacks={getSnacks}
                    />
                );
            case MENU_STEPS.SNACK:
                return (
                    <MenuSelectSnack 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        snackTicketData={snackTicketData}
                        updateSnackTicket={updateSnackTicket}
                        snacks={snacks}
                        getSnacks={getSnacks}
                        loading={snacksLoading}
                        mustBuy={true}
                    />
                );
            case MENU_STEPS.INFO:
                return (
                    <MenuInfo 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        snackTicketData={snackTicketData}
                        updateSnackTicket={updateSnackTicket}
                    />
                );
            case MENU_STEPS.PAYMENT:
                return (
                    <MenuPayment 
                        onNext={handlePaymentComplete} 
                        onBack={goToPreviousStep}
                        snackTicketData={snackTicketData}
                        updateSnackTicket={updateSnackTicket}
                        loading={ticketLoading}
                    />
                );
            case MENU_STEPS.TICKET_DISPLAY:
                return (
                    <MenuTicketDisplay
                        snackTicketData={snackTicketData}
                        ticket={ticket}
                        loading={ticketLoading}
                    />
                );
            default:
                return (
                    <MenuSelectCinema 
                        snackTicketData={snackTicketData} 
                        updateSnackTicket={updateSnackTicket}
                        onBack={goToPreviousStep}
                        onNext={goToNextStep}
                    />
                );
        }
    };

    return (
        <div className="overflow-y-hidden overflow-hidden relative flex flex-col h-auto min-h-screen w-screen bg-slate-950">
            <Header />
            <Title text="BUY SNACK" />
            {renderCurrentMenu()}
            <div className="h-10 w-screen lg:h-20" />
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute top-[140px] left-[50px] h-20 w-20 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[180px] sm:left-[80px] sm:h-28 sm:w-28 md:top-[220px] md:left-[120px] md:h-36 md:w-36 lg:top-[275px] lg:left-[168px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[40px] -bottom-0 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[60px] sm:-bottom-0 sm:h-[350px] sm:w-[300px] md:-right-[80px] md:-bottom-0 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-0 lg:h-[580.90px] lg:w-[517.76px]" />
            <div className="pointer-events-none absolute right-[40px] bottom-0 h-20 w-20 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px] sm:right-[60px] sm:bottom-0 sm:h-28 sm:w-28 md:right-[80px] md:bottom-0 md:h-36 md:w-36 lg:right-100 lg:bottom-0 lg:h-44 lg:w-44" />
            <Footer />
        </div>
    );
};

export default SnackPurchase;
