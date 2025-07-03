// src/pages/Registration.jsx
import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import RegistrationForm from "../layouts/Registration/RegistrationForm.jsx";
import ChatBot from "../components/display/ChatBot.jsx";

const Registration = () => {
    return (
        <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-purple-900 min-h-screen overflow-x-hidden max-w-screen">
            <Header/>
            <RegistrationForm/>
            <ChatBot/>
        </div>
    );
};

export default Registration;
