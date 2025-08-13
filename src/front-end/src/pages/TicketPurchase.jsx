// ================================ IMPORTS ================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

// Layout Components
import Header from '@layouts/LandingPage/Header.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import { Title } from '@components/UI/label.jsx';

// Menu Components
import MenuSelectScreen from '@layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '@layouts/TicketPurchase/MenuSelectSeats.jsx';
import MenuSelectSnack from '@layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '@layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '@layouts/TicketPurchase/MenuPayment.jsx';
import MenuTicketDisplay from '@layouts/TicketPurchase/MenuTicketDisplay.jsx';

// Hooks
import { useGetBranchById } from '@hooks/useBranch';
import { useGetMovieDetail } from '@hooks/useMovie';
import { useUser } from '@contexts/UserContext';
import { useStartHoldSession, useClearSession, useCreateTicket, useGetSnacksByBranch, useGetSeatsBySchedule } from '@hooks/useTicket';
import { ROUTES } from '@routes/routeConfig';

// SweetAlert for popup notifications
import { showError, showWarning, showInfo } from '@utils/sweetalert.js';

// ================================ CONSTANTS ================================
const MENU_STEPS = {
    SCREEN: 0,
    SEATS: 1,
    SNACK: 2,
    INFO: 3,
    PAYMENT: 4,
    TICKET_DISPLAY: 5,
};

// ================================ MAIN COMPONENT ================================
const TicketPurchase = () => {
    // ================================ URL PARAMETERS & NAVIGATION ================================
    const location = useLocation();
    const [urlParams] = useSearchParams();
    const navigate = useNavigate();
    const movieId = urlParams.get('movieId');
    const branchId = urlParams.get('branchId');

    // ================================ HOOKS ================================
    const { getBranchById, branch, loading: branchLoading, error: branchError } = useGetBranchById();
    const { getMovieDetail, movieDetail, loading: movieLoading, error: movieError } = useGetMovieDetail();
    const { seats, loading: seatsLoading, error: seatsError, fetchSeats } = useGetSeatsBySchedule();
    const { getSnacks, snacks, loading: snacksLoading, error: snacksError } = useGetSnacksByBranch();
    const { startHoldSession, holdSeatData, clearHoldSeatData, loading: holdSessionLoading, error: holdSessionError } = useStartHoldSession();
    const { clearSession, loading: clearSessionLoading } = useClearSession();
    const { createTicket, ticket, loading: ticketLoading, error: ticketError } = useCreateTicket();
    const { isAuthenticated } = useUser();

    // ================================ STATE MANAGEMENT ================================
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SCREEN);
    const [startedHoldSession, setStartedHoldSession] = useState(false);

    const passedNoLoginCustomerInfo = location.state?.noLoginCustomerInfo || {
        name: null,
        phone: null,
        email: null,
    };

    const [movieTicketData, setMovieTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: passedNoLoginCustomerInfo,
        branch: {
            _id: null,
            name: null,
            address: null,
            city: null,
            location: {
                type: null,
                coordinates: null,
            },
            isActive: null,
            showings: null,
        },
        schedule: {
            _id: null,
            movie: {
                _id: null,
                name: null,
                poster: null,
            },
            screen: null,
            startTime: null,
            endTime: null,
            availableSeatsCount: 0,
        },
        seats: [],
        promotion: null,
        seller: null,
        total: 0,
        adultTickets: 0,
        discountedTickets: 0,
        discounted: 0,
    });

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
                coordinates: null,
            },
            isActive: null,
            showings: null,
        },
        snackList: [],
        promotionCode: '',
        seller: null,
        total: 0,
        discounted: 0,
    });

    // ================================ UTILITY FUNCTIONS ================================
    const updateMovieTicket = (updates) => {
        setMovieTicketData((prev) => ({ ...prev, ...updates }));
        console.log('Updated movie ticket data:', { ...movieTicketData, ...updates });
    };

    const updateSnackTicket = (updates) => {
        setSnackTicketData((prev) => ({ ...prev, ...updates }));
        console.log('Updated snack ticket data:', { ...snackTicketData, ...updates });
    };

    const handleExpire = () => {
        console.log('Session expired, clearing session...', holdSeatData);
        setStartedHoldSession(false);
        showWarning('Session Expired', 'Your session has expired. Please select your seats again.');
        updateMovieTicket({ seats: [] });
        setCurrentStep(MENU_STEPS.SEATS);
        clearHoldSeatData();
    };

    const handlePaymentComplete = async () => {
        await createTicket({ movieTicketData, snackTicketData });
    };

    // ================================ NAVIGATION FUNCTIONS ================================
    const goToNextStep = () => {
        if (currentStep < MENU_STEPS.TICKET_DISPLAY) {
            if (currentStep === MENU_STEPS.SNACK && !isAuthenticated) {
                setCurrentStep(MENU_STEPS.INFO);
                return;
            } else if (currentStep === MENU_STEPS.SNACK && isAuthenticated) {
                setCurrentStep(MENU_STEPS.PAYMENT);
                return;
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep === MENU_STEPS.SCREEN) {
            navigate(-1);
            return;
        }
        if (currentStep > MENU_STEPS.SCREEN) {
            if (currentStep === MENU_STEPS.PAYMENT && !isAuthenticated) {
                setCurrentStep(MENU_STEPS.INFO);
                return;
            } else if (currentStep === MENU_STEPS.PAYMENT && isAuthenticated) {
                setCurrentStep(MENU_STEPS.SNACK);
                return;
            }
            setCurrentStep(currentStep - 1);
        }
    };

    // ================================ INITIAL DATA FETCHING ================================
    useEffect(() => {
        if (movieId && movieId !== 'null') {
            getMovieDetail(movieId);
            console.log('Fetching movie details for ID:', movieId);
        } else {
            navigate(ROUTES.MOVIES);
        }

        if (branchId && branchId !== 'null') {
            getBranchById(branchId);
        }
    }, [movieId, branchId]);

    // ================================ DATA UPDATE EFFECTS ================================
    useEffect(() => {
        if (movieDetail && movieDetail._id) {
            updateMovieTicket({
                schedule: {
                    ...movieTicketData.schedule,
                    movie: {
                        _id: movieDetail._id,
                        name: movieDetail.title,
                        poster: movieDetail.posterURL,
                    },
                },
            });
        }
    }, [movieDetail]);

    useEffect(() => {
        if (branch && branch._id) {
            const branchData = {
                _id: branch._id,
                name: branch.name,
                address: branch.address,
                city: branch.city,
                location: branch.location,
                isActive: branch.isActive,
                showings: branch.showings,
            };

            updateMovieTicket({ branch: branchData });
            updateSnackTicket({ branch: branchData });
        }
    }, [branch]);

    // ================================ URL UPDATE EFFECT ================================
    useEffect(() => {
        if (movieTicketData.branch && movieTicketData.branch._id) {
            const stateObj = movieTicketData.noLoginCustomerInfo?.id ? { state: { noLoginCustomerInfo: movieTicketData.noLoginCustomerInfo.id } } : {};

            setMovieTicketData((prev) => ({
                ...prev,
                branch: { ...movieTicketData.branch },
                schedule: {
                    _id: null,
                    movie: prev.schedule.movie,
                    screen: null,
                    startTime: null,
                    endTime: null,
                    availableSeatsCount: 0,
                },
                adultTickets: 0,
                discountedTickets: 0,
                seats: [],
                promotion: null,
                seller: null,
                total: 0,
                discounted: 0,
            }));

            setSnackTicketData((prev) => ({
                ...prev,
                branch: { ...movieTicketData.branch },
                snackList: [],
                promotionCode: '',
                seller: null,
                total: 0,
                discounted: 0,
            }));

            navigate(`?movieId=${movieId || 'null'}&branchId=${movieTicketData.branch._id || 'null'}`, { replace: true, ...stateObj });
        }
    }, [movieTicketData.branch?._id]);

    // ================================ AUTHENTICATION & VALIDATION EFFECTS ================================
    useEffect(() => {
        if (
            !isAuthenticated &&
            currentStep > MENU_STEPS.INFO &&
            (!movieTicketData.noLoginCustomerInfo.name || !movieTicketData.noLoginCustomerInfo.phone || !movieTicketData.noLoginCustomerInfo.email)
        ) {
            setCurrentStep(MENU_STEPS.INFO);
            showInfo('Information Required', 'Please fill in your information before proceeding.');
            return;
        }
    }, [isAuthenticated]);

    useEffect(() => {
        updateMovieTicket({ promotion: null, discount: 0 });
        updateSnackTicket({ promotion: null, discount: 0 });
    }, [movieTicketData.noLoginCustomerInfo, snackTicketData.noLoginCustomerInfo]);

    // ================================ SESSION MANAGEMENT EFFECTS ================================
    useEffect(() => {
        if (startedHoldSession) {
            setStartedHoldSession(false);
            clearSession();
            updateMovieTicket({
                promotion: null,
                discount: 0,
            });
        }
    }, [movieTicketData.seats]);

    useEffect(() => {
        async function holdSessionIfNeeded() {
            if (currentStep === MENU_STEPS.PAYMENT && !startedHoldSession) {
                console.log('Starting hold session for seats:', movieTicketData.seats);
                await startHoldSession({
                    scheduleId: movieTicketData.schedule._id,
                    seatNumbers: movieTicketData.seats,
                });
                await getSnacks(snackTicketData?.branch?._id);
            }
        }
        holdSessionIfNeeded();
    }, [currentStep]);

    useEffect(() => {
        console.log('Hold seat data updated:', holdSeatData);
        console.log('Error:', holdSessionError);

        if (holdSeatData || holdSessionError) {
            if (holdSessionError) {
                console.log(holdSessionError);
                if (holdSessionError.includes('seats')) {
                    showError('Seats Unavailable', 'Your seat selection has been occupied by other customers. Please adjust your selection.');
                    setCurrentStep(MENU_STEPS.SEATS);
                    fetchSeats(movieTicketData.schedule._id);
                    updateMovieTicket({ seats: [] });
                    return;
                }
                showError('Hold Session Error', 'An error occurred while holding your seats. Please try again.');
                setCurrentStep(MENU_STEPS.PAYMENT);
            } else {
                setStartedHoldSession(true);
                console.log('Hold session started successfully:', holdSeatData);
            }
        }
    }, [holdSeatData, holdSessionError]);

    // ================================ SNACK VALIDATION EFFECT ================================
    useEffect(() => {
        if (snackTicketData?.branch?._id && snacks && snacks.length > 0) {
            console.log('Snacks fetched successfully:', snacks);

            if (Array.isArray(snackTicketData?.snackList) && snackTicketData.snackList.length > 0) {
                let changed = false;
                const newSnackList = snackTicketData.snackList.map((item) => {
                    const snack = snacks.find((s) => s._id === item.snack);
                    if (!snack) return item;
                    const stock = snack.stock ?? Infinity;
                    if (item.quantity > stock) {
                        changed = true;
                        return { ...item, quantity: stock };
                    }
                    return item;
                });

                if (changed) {
                    showWarning('Stock Adjustment', 'Some snacks in your selection exceed available stock and have been adjusted.');
                    updateSnackTicket({ snackList: newSnackList, promotion: null, discount: 0 });
                }
            }
        }
    }, [snacks]);

    // ================================ TICKET CREATION EFFECT ================================
    useEffect(() => {
        if (ticket) {
            console.log('Ticket created successfully:', ticket);
            setCurrentStep(MENU_STEPS.TICKET_DISPLAY);
        } else if (ticketError) {
            console.error('Error creating ticket:', ticketError);

            if (ticketError.includes('seats')) {
                showError('Seats Unavailable', 'Your seat selection has been occupied by other customers. Please adjust your selection.');
                setCurrentStep(MENU_STEPS.SEATS);
                fetchSeats(movieTicketData.schedule._id);
                updateMovieTicket({ seats: [] });
                return;
            } else if (ticketError.includes('snack')) {
                showError('Stock Unavailable', 'Your snack selection exceeds available stock. Please adjust your order.');
                setCurrentStep(MENU_STEPS.SNACK);
                getSnacks(snackTicketData?.branch?._id);
                updateSnackTicket({ snackList: [] });
                return;
            }

            showError('Ticket Creation Failed', 'An error occurred while creating your ticket. Please try again.');
            setCurrentStep(MENU_STEPS.PAYMENT);
        }
    }, [ticket, ticketError]);

    // ================================ MENU RENDERER ================================
    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.SCREEN:
                return (
                    <MenuSelectScreen
                        onNext={goToNextStep}
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        fetchSeats={fetchSeats}
                        getSnacks={getSnacks}
                    />
                );
            case MENU_STEPS.SEATS:
                return (
                    <MenuSelectSeats
                        onNext={goToNextStep}
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        clearSessionLoading={clearSessionLoading}
                        fetchSeats={fetchSeats}
                        seats={seats}
                        seatsLoading={seatsLoading}
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
                    />
                );
            case MENU_STEPS.INFO:
                return (
                    <MenuInfo
                        onNext={goToNextStep}
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        snackTicketData={snackTicketData}
                        updateMovieTicket={updateMovieTicket}
                        updateSnackTicket={updateSnackTicket}
                    />
                );
            case MENU_STEPS.PAYMENT:
                return (
                    <MenuPayment
                        onNext={handlePaymentComplete}
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        snackTicketData={snackTicketData}
                        updateMovieTicket={updateMovieTicket}
                        updateSnackTicket={updateSnackTicket}
                        sessionExpiresAt={holdSeatData}
                        loading={holdSessionLoading}
                        onExpire={handleExpire}
                        isSession={startedHoldSession}
                        ticketLoading={ticketLoading}
                    />
                );
            case MENU_STEPS.TICKET_DISPLAY:
                return <MenuTicketDisplay movieTicketData={movieTicketData} snackTicketData={snackTicketData} ticket={ticket} loading={ticketLoading} />;
            default:
                return <MenuSelectScreen onNext={goToNextStep} onBack={goToPreviousStep} movieTicketData={movieTicketData} updateMovieTicket={updateMovieTicket} />;
        }
    };

    // ================================ RENDER ================================
    return (
        <div className="relative flex h-auto min-h-screen w-screen flex-col overflow-hidden overflow-x-hidden overflow-y-hidden bg-slate-950">
            <Header />
            <Title text="BUY TICKET" />
            {renderCurrentMenu()}
            <div className="h-10 w-screen lg:h-20" />

            {/* Background Effects */}
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute top-[140px] left-[50px] h-20 w-20 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[180px] sm:left-[80px] sm:h-28 sm:w-28 md:top-[220px] md:left-[120px] md:h-36 md:w-36 lg:top-[275px] lg:left-[168px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[40px] -bottom-0 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[60px] sm:-bottom-0 sm:h-[350px] sm:w-[300px] md:-right-[80px] md:-bottom-0 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-0 lg:h-[580.90px] lg:w-[517.76px]" />
            <div className="pointer-events-none absolute right-[40px] bottom-0 h-20 w-20 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px] sm:right-[60px] sm:bottom-0 sm:h-28 sm:w-28 md:right-[80px] md:bottom-0 md:h-36 md:w-36 lg:right-100 lg:bottom-0 lg:h-44 lg:w-44" />

            <Footer />
        </div>
    );
};

export default TicketPurchase;
