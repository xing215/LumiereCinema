import React from 'react';
import Header from "../layouts/LandingPage/Header.jsx";
import LoginForm from "../layouts/Login/LoginForm.jsx";
import ChatBot from "../components/display/ChatBot.jsx";

const Login = () => {
    return (
        <section className="relative bg-slate-950 overflow-x-hidden overflow-y-hidden w-screen min-h-screen no-scrollbar">
            <Header/>
            
            {/* Background visual */}
            <div className="
                absolute lg:top-[135px] md:top-[100px] sm:top-[80px] top-[60px] 
                lg:-left-[71px] md:-left-[50px] sm:-left-[30px] -left-[20px]
                lg:w-44 md:w-36 sm:w-28 w-20 
                lg:h-44 md:h-36 sm:h-28 h-20 
                mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]
                pointer-events-none
            "/>
            <div className="
                absolute lg:top-[275px] md:top-[220px] sm:top-[180px] top-[140px] 
                lg:left-[168px] md:left-[120px] sm:left-[80px] left-[50px]
                lg:w-44 md:w-36 sm:w-28 w-20 
                lg:h-44 md:h-36 sm:h-28 h-20 
                mix-blend-lighten bg-pink-400/60 rounded-full blur-[100px]
                pointer-events-none
            "/>
            <div className="
                absolute lg:-bottom-80 md:-bottom-50 sm:-bottom-40 -bottom-30
                lg:-right-100 md:-right-[190px] sm:-right-[120px] -right-[100px]
                lg:w-[517.76px] md:w-[400px] sm:w-[300px] w-[200px]
                lg:h-[580.90px] md:h-[450px] sm:h-[350px] h-[250px]
                rotate-[150deg] mix-blend-lighten bg-sky-400/60 blur-[100px]
                pointer-events-none
            "/>

            {/* Main component */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] lg:pt-30 md:pt-16 sm:pt-14 pt-15 lg:px-8 md:px-6 sm:px-4 px-6">
                <LoginForm/>
            </div>
            <ChatBot/>  
        </section>
    );
};

export default Login;
