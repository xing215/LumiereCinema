// src/pages/TicketPurchase.jsx
import React, { useState, useEffect, use } from 'react';
import {useNavigate, useSearchParams, useLocation} from 'react-router-dom';
import Header from '@layouts/LandingPage/Header.jsx';
import { Title } from '@components/UI/label.jsx';
import MenuSelectScreen from '@layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '@layouts/TicketPurchase/MenuSelectSeats.jsx';
import MenuSelectSnack from '@layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '@layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '@layouts/TicketPurchase/MenuPayment.jsx';
import MenuTicketDisplay from '@layouts/TicketPurchase/MenuTicketDisplay.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import { useGetBranchById } from '@hooks/useBranch';
// Add movie hook import (assuming it exists)
import { useGetMovieDetail } from '@hooks/useMovie';
import { useUser } from '@contexts/UserContext';
import { useStartHoldSession, useClearSession, useCreateTicket } from '@hooks/useTicket';
import { useGetSnacks } from '@hooks/useBranch';


const MENU_STEPS = {
    SCREEN: 0,
    SEATS: 1,
    SNACK: 2,
    INFO: 3,
    PAYMENT: 4,
    TICKET_DISPLAY: 5
};

const TicketPurchase = () => {
    const location = useLocation();
    const [urlparm] = useSearchParams();
    const movieId = urlparm.get('movieId');
    const branchId = urlparm.get('branchId');
    const locationHook = useLocation();
    
    // Hooks for fetching data
    const { getBranchById, branch, loading: branchLoading, error: branchError } = useGetBranchById();
    const  { getMovieDetail, movieDetail, loading: movieLoading, error: movieError } = useGetMovieDetail();

    const passedNoLoginCustomerInfo = locationHook.state?.noLoginCustomerInfo || {
        name: null,
        phone: null,
        email: null
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
                coordinates: null
            },
            isActive: null,
            showings: null
        },
        schedule: { 
            _id: null,
            movie: {
                _id: null,
                name: null,
                poster: null
            },
            screen: null,
            startTime: null,
            endTime: null,
            availableSeatsCount: 0
        },
        seats: [],
        promotion: null,
        seller: null,
        total: 0,
        adultTickets: 0,
        discountedTickets: 0
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

    // Fetch movie and branch data when component mounts
    useEffect(() => {
        if (movieId && movieId !== 'null') {
            getMovieDetail(movieId);
            console.log('Fetching movie details for ID:', movieId);
            console.log('Movie detail:', movieDetail);
            console.log('Movie ticket data before update:', error);
            
        }
        
        if (branchId && branchId !== 'null') {
            getBranchById(branchId);
        }
    }, [movieId, branchId]);

    // Update movieTicketData when movie is fetched
    useEffect(() => {
        if (movieDetail && movieDetail._id) {
            updateMovieTicket({
                schedule: {
                    ...movieTicketData.schedule,
                    movie: {
                        _id: movieDetail._id,
                        name: movieDetail.title,
                        poster: movieDetail.posterURL
                    }
                }
            });
        }
    }, [movieDetail]);

    // Update both ticket data when branch is fetched
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
            
            updateMovieTicket({ branch: branchData });
            updateSnackTicket({ branch: branchData });
        }
    }, [branch]);

    const navigate = useNavigate();
    
    const updateMovieTicket = (updates) => {
        setMovieTicketData(prev => ({ ...prev, ...updates }));
    };

    // Update URL when branch changes
    useEffect(() => {
        if (movieTicketData.branch && movieTicketData.branch._id) {
            const stateObj = movieTicketData.noLoginCustomerInfo?.id
                ? { state: { noLoginCustomerInfo: movieTicketData.noLoginCustomerInfo.id } }
                : {};

            // Reset ticket data, keep movie, update branch
            setMovieTicketData(prev => ({
                ...prev,
                branch: { ...movieTicketData.branch },
                schedule: {
                    _id: null,
                    movie: prev.schedule.movie, // preserve movie
                    screen: null,
                    startTime: null,
                    endTime: null,
                    availableSeatsCount: 0
                },
                adultTickets: 0,
                discountedTickets: 0,
                seats: [],
                promotion: null,
                seller: null,
                total: 0
            }));

            setSnackTicketData(prev => ({
                ...prev,
                branch: { ...movieTicketData.branch },
                snackList: [],
                promotionCode: '',
                seller: null,
                total: 0
            }));

            navigate(
                `?movieId=${movieId || 'null'}&branchId=${movieTicketData.branch._id || 'null'}`,
                { replace: true, ...stateObj }
            );
        }
    }, [movieTicketData.branch?._id]);

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
    };
    const { isAuthenticated } = useUser();

    // Navigation methods
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SCREEN);
    const { startHoldSession, holdSeatData, loading, error } = useStartHoldSession();
    const [startedHoldSession, setStartedHoldSession] = useState(false);
    const { clearSession, loading:clearSessionLoading } = useClearSession();
    const [heldSeats, setHeldSeats] = useState([])

    function handleExpire() {
        console.log('Session expired, clearing session...', holdSeatData);
        setStartedHoldSession(false);
        setHeldSeats([]);
        setCurrentStep(MENU_STEPS.SEATS)
        alert('Your session has expired. Please select your seats again.');
        updateMovieTicket({
            seats: [],
        });
        
    }

    useEffect(() => {
        if (startedHoldSession) {
            setStartedHoldSession(false);
            setHeldSeats([]);
            clearSession();
        }
    }, [movieTicketData.seats]);

    const { getSnacks, snacks, loading:snackLoading, error:snackError } = useGetSnacks();

useEffect(() => {
    async function holdSessionIfNeeded() {
        if (currentStep === MENU_STEPS.PAYMENT && !startedHoldSession){
            await startHoldSession({ scheduleId: movieTicketData.schedule._id, seatNumbers: movieTicketData.seats});
            await getSnacks(snackTicketData?.branch?._id);
        }
    }
 holdSessionIfNeeded();
}, [currentStep]);

useEffect(() => {
    console.log('Hold seat data updated:', holdSeatData);
    console.log('Error:', error);
    if (holdSeatData || error) 
        
            if (error) {
                    console.log(error);
                setCurrentStep(MENU_STEPS.SEATS);
                if (error === '409') {
                        alert('Your seats are occupied. Please try again.');
                } else {
                alert('An error occurred while holding your session. Please try again.');
                }               

            } else {
            setStartedHoldSession(true);
            setHeldSeats(movieTicketData?.seats)
            console.log('Hold session started successfully:', holdSeatData);
            }
}, [holdSeatData, error]);

useEffect(() => {
    if (snacks && snacks.length > 0) {
        console.log('Snacks fetched successfully:', snacks);
        // Check if snackTicketData.snackList is appropriate with snacks list
        if (Array.isArray(snackTicketData?.snackList) && snackTicketData.snackList.length > 0) {
            let changed = false;
            const newSnackList = snackTicketData.snackList.map(item => {
                const snack = snacks.find(s => s._id === item.snack);
                if (!snack) return item; // skip if not found
                const stock = snack.stock ?? Infinity;
                if (item.quantity > stock) {
                    changed = true;
                    return { ...item, quantity: stock };
                }
                return item;
            });
            if (changed) {
                alert('Some snacks in your selection exceed available stock and have been adjusted.');
                updateSnackTicket({ snackList: newSnackList });
            }
        }
    }
}, [snacks]);


    const goToNextStep = () => {
        if (currentStep < MENU_STEPS.TICKET_DISPLAY) {
            if(currentStep === MENU_STEPS.SNACK && !isAuthenticated) {
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
        if (currentStep == MENU_STEPS.SCREEN) {
             navigate(-1); 
             return; 
        }
        if (currentStep > MENU_STEPS.SCREEN) {
            if (currentStep === MENU_STEPS.PAYMENT && !isAuthenticated) {
                setCurrentStep(MENU_STEPS.INFO);
                return;
            } else if (currentStep === MENU_STEPS.PAYMENT && isAuthenticated) {
                setCurrentStep(MENU_STEPS.SNACK);
                return
            }
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        if (!isAuthenticated && currentStep > MENU_STEPS.INFO && (!movieTicketData.noLoginCustomerInfo.name || !movieTicketData.noLoginCustomerInfo.phone || !movieTicketData.noLoginCustomerInfo.email)) {
            setCurrentStep(MENU_STEPS.INFO);
            alert('Please fill in your information before proceeding.');
            return;
        }
    }, [isAuthenticated]);

        

    const { createTicket, ticket, loading: ticketLoading, error: ticketError } = useCreateTicket();

    const handlePaymentComplete = async () => {
        await createTicket({
            movieTicketData, snackTicketData
        });        

    };

    useEffect(() => {
        if (ticket) {
            console.log('Ticket created successfully:', ticket);
            setCurrentStep(MENU_STEPS.TICKET_DISPLAY);
        } else if (ticketError) {
            console.error('Error creating ticket:', ticketError);
            alert('An error occurred while creating your ticket. Please try again.');
            setCurrentStep(MENU_STEPS.PAYMENT);
        }
    }, [ticket, ticketError]);

    const renderCurrentMenu = () => {

        switch (currentStep) {
            case MENU_STEPS.SCREEN:
                return (
                    <MenuSelectScreen 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                    />
                );
            case MENU_STEPS.SEATS:
                return (
                    <MenuSelectSeats 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        heldSeats={heldSeats}
                        clearSessionLoading={clearSessionLoading}
                    />
                );
            case MENU_STEPS.SNACK:
                return (
                    <MenuSelectSnack 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        snackTicketData={snackTicketData}
                        updateSnackTicket={updateSnackTicket}
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
                        sessionExpiresAt={holdSeatData}
                        loading={loading}
                        onExpire={handleExpire}
                    />
                );
            case MENU_STEPS.TICKET_DISPLAY:
                return (
                    <MenuTicketDisplay
                        movieTicketData={movieTicketData}
                        snackTicketData={snackTicketData}
                        ticket={ticket}
                        loading={ticketLoading}
                    />
                );
            default:
                return (
                    <MenuSelectScreen 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                    />
                );
        }
    };

    return (
        <div className="overflow-y-hidden overflow-hidden relative flex flex-col h-auto min-h-screen w-screen overflow-x-hidden bg-slate-950">
            <Header />
            <Title text="BUY TICKET" />
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

export default TicketPurchase;