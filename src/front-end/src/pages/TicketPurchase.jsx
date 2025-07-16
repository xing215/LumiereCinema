// src/pages/TicketPurchase.jsx
import React, { useState } from 'react';
import Header from '../layouts/LandingPage/Header.jsx';
import { Title } from '../components/UI/label.jsx';
import MenuSelectScreen from '../layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '../layouts/TicketPurchase/MenuSelectSeats.jsx';
import MenuSelectSnack from '../layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '../layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '../layouts/TicketPurchase/MenuPayment.jsx';
import Footer from '../layouts/LandingPage/Footer.jsx';

/* 
 * TICKET DATA STRUCTURE REFERENCE:
 * 
 * Movie Ticket JSON for API:
 * {
 *   "customer": "ObjectId" | null,
 *   "noLoginCustomerInfo": { "name": "", "phone": "", "email": "" },
 *   "branch": "ObjectId",
 *   "schedule": "ObjectId", 
 *   "seats": ["A1", "A2"],
 *   "promotion": "ObjectId" | null,
 *   "seller": "ObjectId" | null
 * }
 * 
 * Snack Ticket JSON for API:
 * {
 *   "customer": "ObjectId" | null,
 *   "noLoginCustomerInfo": { "name": "", "phone": "", "email": "" },
 *   "branch": "ObjectId",
 *   "snackList": [{ "snack": "ObjectId", "quantity": number }],
 *   "promotionCode": "string",
 *   "seller": "ObjectId" | null
 * }
 */

const MENU_STEPS = {
    SCREEN: 0,
    SEATS: 1,
    SNACK: 2,
    INFO: 3,
    PAYMENT: 4,
};

const TicketPurchase = () => {
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SCREEN);

    // Movie Ticket Data
    const [movieTicketData, setMovieTicketData] = useState({
        customer: null, // Will be set if user is logged in
        noLoginCustomerInfo: {
            name: '',
            phone: '',
            email: ''
        },
        branch: null,
        schedule: null,
        seats: [],
        promotion: null,
        seller: null, // Will be set if purchased at counter
        total: 0
    });

    // Snack Ticket Data
    const [snackTicketData, setSnackTicketData] = useState({
        customer: null, // Will be set if user is logged in
        noLoginCustomerInfo: {
            name: '',
            phone: '',
            email: ''
        },
        branch: null,
        snackList: [], // Array of {snack: id, quantity: number}
        promotionCode: '',
        seller: null, // Will be set if purchased at counter
        total: 0
    });

    // Utility functions to update ticket data
    const updateMovieTicket = (updates) => {
        setMovieTicketData(prev => ({ ...prev, ...updates }));
    };

    const updateSnackTicket = (updates) => {
        setSnackTicketData(prev => ({ ...prev, ...updates }));
    };

    const goToNextStep = () => {
        if (currentStep < MENU_STEPS.PAYMENT) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > MENU_STEPS.SCREEN) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePaymentComplete = async () => {
        try {
            // Handle payment completion logic here
            console.log('Processing payment...');
            console.log('Movie Ticket Data:', movieTicketData);
            console.log('Snack Ticket Data:', snackTicketData);
            
            // TODO: Send ticket data to backend API
            // Example API calls:
            // if (movieTicketData.schedule && movieTicketData.seats.length > 0) {
            //     await createMovieTicket(movieTicketData);
            // }
            // if (snackTicketData.snackList.length > 0) {
            //     await createSnackTicket(snackTicketData);
            // }
            
            console.log('Payment completed!');
        } catch (error) {
            console.error('Payment failed:', error);
        }
    };

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
