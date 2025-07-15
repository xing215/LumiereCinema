// src/pages/TicketPurchase.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import {Title} from '../components/UI/label.jsx';
import MenuSelectScreen from '../layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '../layouts/TicketPurchase/MenuSelectSeats.jsx';
import MenuSelectSnack from '../layouts/TicketPurchase/MenuSelectSnack.jsx';
import MenuInfo from '../layouts/TicketPurchase/MenuInfo.jsx';
import MenuPayment from '../layouts/TicketPurchase/MenuPayment.jsx';
import Footer from '../layouts/LandingPage/Footer.jsx';


const TicketPurchase = () => {
    return (
        <div className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden bg-slate-950">
            <Header/>
            <Title text="BUY TICKET"/>
            <MenuSelectScreen/>
            <MenuSelectSeats/>
            <MenuSelectSnack/>
            <MenuInfo/>
            <MenuPayment/>
            <div className="h-10 w-screen lg:h-20" />
            <Footer/>
        </div>
    );
};

export default TicketPurchase;
