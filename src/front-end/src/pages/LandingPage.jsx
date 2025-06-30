// src/pages/LandingPage.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import Banner from "../layouts/LandingPage/Banner.jsx";
import ChatBot from "../components/modal/ChatBot.jsx";
import NowShowing from "../layouts/LandingPage/NowShowingMovie.jsx";

const LandingPage = () => {
    return (
        <div className="bg-slate-950 max-w-screen h-auto">
            <Header/>
            <Banner/>
            <ChatBot/>
            <NowShowing/>
        </div>
    );
};

export default LandingPage;
