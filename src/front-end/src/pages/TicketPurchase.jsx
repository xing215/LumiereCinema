// src/pages/TicketPurchase.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import {Title} from '../components/UI/label.jsx';
import MenuSelectScreen from '../layouts/TicketPurchase/MenuSelectScreen.jsx';
import MenuSelectSeats from '../layouts/TicketPurchase/MenuSelectSeats.jsx';


const TicketPurchase = () => {
    return (
        <div className="bg-slate-950 w-screen h-auto">
            <Header/>
            <Title text="BUY TICKET"/>
            {/* <MenuSelectScreen/> */}
            <MenuSelectSeats/>
        </div>
    );
};

export default TicketPurchase;
