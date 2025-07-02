// src/pages/LandingPage.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import Banner from "../layouts/LandingPage/Banner.jsx";
import ChatBot from "../components/display/ChatBot.jsx";
import NowShowing from "../layouts/LandingPage/NowShowingMovie.jsx";
import Maps from "../layouts/LandingPage/Maps.jsx";
import UpComing from "../layouts/LandingPage/UpcomingMovie.jsx";

const LandingPage = () => {
    return (
        <div className="bg-slate-950 overflow-x-hidden max-w-screen h-auto">
            <Header/>
            <Banner/>
            <ChatBot/>
            <NowShowing/>
            <Maps/>
            <UpComing/>
        </div>
    );
};

export default LandingPage;
