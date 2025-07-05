import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import LoginForm from "../layouts/Login/LoginForm.jsx";
import ChatBot from "../components/display/ChatBot.jsx";

const Login = () => {
    return (
        <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-purple-900 min-h-screen overflow-x-hidden max-w-screen">
            <Header/>
            <div className="lg:pt-12 md:pt-8 sm:pt-4 pt-0">
                <LoginForm/>
            </div>
            <ChatBot/>  
        </div>
    );
};

export default Login;
