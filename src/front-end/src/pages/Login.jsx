import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import LoginForm from "../layouts/Login/LoginForm.jsx";
import ChatBot from "../components/display/ChatBot.jsx";

const Login = () => {
    return (
        <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-purple-900 min-h-screen overflow-x-hidden max-w-screen">
            <Header/>
            <div className="flex flex-col items-center justify-center min-h-screen lg:pt-20 md:pt-16 sm:pt-14 pt-12 lg:px-8 md:px-6 sm:px-5 px-4">
                <LoginForm/>
            </div>
            <ChatBot/>  
        </div>
    );
};

export default Login;
