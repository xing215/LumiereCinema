// src/pages/TicketPurchase.jsx
import React, { useState } from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import {Title} from '../components/UI/label.jsx';
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
    PAYMENT: 4
};

const TicketPurchase = () => {
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.SCREEN);

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

    const handlePaymentComplete = () => {
        // Handle payment completion logic here
        // For now, we can just keep the user on the payment step
        // or redirect to a confirmation page
        console.log('Payment completed!');
    };

    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.SCREEN:
                return <MenuSelectScreen onNext={goToNextStep} onBack={goToPreviousStep} />;
            case MENU_STEPS.SEATS:
                return <MenuSelectSeats onNext={goToNextStep} onBack={goToPreviousStep} />;
            case MENU_STEPS.SNACK:
                return <MenuSelectSnack onNext={goToNextStep} onBack={goToPreviousStep} />;
            case MENU_STEPS.INFO:
                return <MenuInfo onNext={goToNextStep} onBack={goToPreviousStep} />;
            case MENU_STEPS.PAYMENT:
                return <MenuPayment onNext={handlePaymentComplete} onBack={goToPreviousStep} />;
            default:
                return <MenuSelectScreen onNext={goToNextStep} onBack={goToPreviousStep} />;
        }
    };

    return (
        <div className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden bg-slate-950">
            <Header/>
            <Title text="BUY TICKET"/>
            {renderCurrentMenu()}
            <div className="h-10 w-screen lg:h-20" />
            <Footer/>
        </div>
    );
};

export default TicketPurchase;
