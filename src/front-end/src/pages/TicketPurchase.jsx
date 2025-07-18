// src/pages/TicketPurchase.jsx
import React, { useState, useEffect } from 'react';
import {useNavigate, useSearchParams, useLocation} from 'react-router-dom';
import Header from '../layouts/LandingPage/Header.jsx';
import { Title } from '../components/UI/label.jsx';
import MenuSelectScreen from '../layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '../layouts/TicketPurchase/MenuSelectSeats.jsx';
import MenuSelectSnack from '../layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '../layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '../layouts/TicketPurchase/MenuPayment.jsx';
import Footer from '../layouts/LandingPage/Footer.jsx';

const MENU_STEPS = {
    SCREEN: 0,
    SEATS: 1,
    SNACK: 2,
    INFO: 3,
    PAYMENT: 4,
};

const TicketPurchase = () => {

    // Mock data for schedules and cinemas (call in menuSelectScreen)
    // const schedules = [
    //     { 
    //         _id: 'sid',
    //         movie: {_id: 'mid', name: 'Movie 1', poster: 'poster1.jpg'},
    //         screen: {_id:'ssid', name: 'Screen 1', totalSeats: 80},
    //         startTime: '2025-07-14T08:00:00.000',
    //         endTime: '2025-07-14T10:30:00.000',
    //         OccupiedSeat: [
    //             { row: 'A', no: 1 },
    //             { row: 'A', no: 2 }
    //         ],
    //     },
    // ];

    // const cinemas = [
    //     {
    //     "_id": "66b8a1c4f2e8d5a1b3c4d5c1",
    //     "name": "Lumiere Cao Thắng",
    //     "address": "379-381 Cao Thắng St, Ward 12",
    //     "city": "Ho Chi Minh City",
    //     "location": {
    //         "type": "Point",
    //         "coordinates": [106.6917, 10.7769]
    //     },
    //     "isActive": true,
    //     "showings": "7"
    //     }        
    // ];

// =============================== TICKETS =============================== 


    const location = useLocation();
    const [urlparm] = useSearchParams();
    const movieId = urlparm.get('movieId');
    const branchId = urlparm.get('branchId');
    const locationHook = useLocation();
    // get movie, branch by Id from backend
    const pickedMovie = {_id: 'mid', name: 'Movie 1', poster: 'poster1.jpg'};
    const pickedBranch = (branchId == null ? 
        {
        "_id": null,
        "name": null,
        "address": null,
        "city": null,
        "location": {
            "type": null,
            "coordinates": null
        },
        "isActive": null,
        "showings": null
        }     
        : 
        {
        "_id": "66b8a1c4f2e8d5a1b3c4d5c1",
        "name": "Lumiere Cao Thắng",
        "address": "379-381 Cao Thắng St, Ward 12",
        "city": "Ho Chi Minh City",
        "location": {
            "type": "Point",
            "coordinates": [106.6917, 10.7769]
        },
        "isActive": true,
        "showings": "7"
        }     );
    const passedNoLoginCustomerInfo = locationHook.state?.noLoginCustomerInfo || {
        name: null,
        phone: null,
        email: null
    };

    const [movieTicketData, setMovieTicketData] = useState({
        customer: null, // chưa rõ cách ghép he
        noLoginCustomerInfo: passedNoLoginCustomerInfo,
        branch: pickedBranch,
        schedule: { 
            _id: null,
            movie: pickedMovie,
            screen: null,
            startTime: null,
            endTime: null,
            OccupiedSeat: [
                { row: 'A', no: 1 },
                { row: 'A', no: 2 }
            ],
        },
        seats: [],
        promotion: null,
        seller: null, // Will be set if purchased at counter
        total: 0
    }); //movie is initialized with pickedMovie, all schedule data will be replaced by new schedule data when user selects a schedule, which has the same movie info

    
    // Snack Ticket Data
    const [snackTicketData, setSnackTicketData] = useState({
        customer: null,
        noLoginCustomerInfo: passedNoLoginCustomerInfo,
        branch: pickedBranch,
        snackList: [], // {snack: id, quantity: number}
        promotionCode: '',
        seller: null, // Will be set if purchased at counter
        total: 0
    });

// =============================== CHANGE TICKET INFO =============================== 


    const navigate = useNavigate()
    const updateMovieTicket = (updates) => {
        setMovieTicketData(prev => ({ ...prev, ...updates }));
    };

    useEffect(() => {
    if (movieTicketData.branch && movieTicketData.branch._id) {
        const stateObj = movieTicketData.noLoginCustomerInfo?.id
            ? { state: { noLoginCustomerInfo: movieTicketData.noLoginCustomerInfo.id } }
            : {};

        navigate(
            `?movieId=${movieId || 'null'}&branchId=${movieTicketData.branch._id || 'null'}`,
            { replace: true, ...stateObj }
        );
    }
}, [movieTicketData.branch?._id]);

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
    };
// =============================== SWITCH MENUS =============================== 

    const goToNextStep = () => {
        if (currentStep < MENU_STEPS.PAYMENT) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep == MENU_STEPS.SCREEN) {
             navigate(-1); return; 
        }
        if (currentStep > MENU_STEPS.SCREEN) {
            setCurrentStep(currentStep - 1);
        }
    };


// =============================== SWITCH MENUS =============================== 
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SCREEN);
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
                        mockSchedules={schedules}
                    />
                );
            default:
                return (
                    <MenuSelectScreen 
                        onNext={goToNextStep} 
                        onBack={goToPreviousStep}
                        movieTicketData={movieTicketData}
                        updateMovieTicket={updateMovieTicket}
                        updateSnackTicket={updateSnackTicket}
                        mockSchedules={schedules}
                        cinemas={cinemas}
                    />
                );
        }
    };

// =============================== RETURNS =============================== 

    return (
        <div className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden bg-slate-950">
            <Header />
            <Title text="BUY TICKET" />
            {renderCurrentMenu()}
            <div className="h-10 w-screen lg:h-20" />
            <Footer />
        </div>
    );
};

export default TicketPurchase;
