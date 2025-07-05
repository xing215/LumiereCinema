// src/pages/TicketPurchase.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import {Title} from '../components/UI/label.jsx';
import MenuBuyTicket from '../layouts/TicketPurchase/MenuBuyTicket.jsx';


const TicketPurchase = () => {
    return (
        <div className="bg-slate-950 max-w-screen h-auto">
            <Header/>
            <Title text="BUY TICKET"/>
            <MenuBuyTicket/>
        </div>
    );
};

export default TicketPurchase;
