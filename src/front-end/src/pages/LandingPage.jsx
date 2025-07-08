// src/pages/LandingPage.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import Banner from "../layouts/LandingPage/Banner.jsx";
import ChatBot from "../components/display/ChatBot.jsx";
import NowShowing from "../layouts/LandingPage/NowShowingMovie.jsx";
import Maps from "../layouts/LandingPage/Maps.jsx";
import UpComing from "../layouts/LandingPage/UpcomingMovie.jsx";
import Footer from "../layouts/LandingPage/Footer.jsx";

const LandingPage = () => {
    return (
        <div className="bg-slate-950 overflow-hidden w-screen min-h-screen no-scrollbar">
            <Header/>
            <main className="flex flex-col gap-0">
                <Banner/>
                <NowShowing/>
                <Maps/>
                <UpComing/>
                <Footer/>
            </main>
            <ChatBot/>
        </div>
    );
};

export default LandingPage;
