import React, { useEffect } from 'react';
import Header from '@layouts/LandingPage/Header';
import ChatBot from '@components/display/ChatBot';
import Footer from '@layouts/LandingPage/Footer';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@routes/routeConfig';

const Developing = () => {
    const navigate = useNavigate();
    return (
        <section className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden overflow-y-hidden bg-slate-950">
            <Header />

            {/* Background visual */}
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute top-[140px] left-[50px] h-20 w-20 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[180px] sm:left-[80px] sm:h-28 sm:w-28 md:top-[220px] md:left-[120px] md:h-36 md:w-36 lg:top-[275px] lg:left-[168px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[40px] -bottom-0 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[60px] sm:-bottom-0 sm:h-[350px] sm:w-[300px] md:-right-[80px] md:-bottom-0 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-0 lg:h-[580.90px] lg:w-[517.76px]" />
            <div className="pointer-events-none absolute right-[40px] bottom-0 h-20 w-20 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px] sm:right-[60px] sm:bottom-0 sm:h-28 sm:w-28 md:right-[80px] md:bottom-0 md:h-36 md:w-36 lg:right-100 lg:bottom-0 lg:h-44 lg:w-44" />

            {/* Main component */}
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 pt-15 sm:px-4 sm:pt-14 md:px-6 md:pt-16 lg:px-8 lg:pt-30">
                <div className="w-full max-w-xs px-4 sm:max-w-sm sm:px-0 md:max-w-md lg:max-w-lg xl:max-w-xl">
                    <h1 className="mb-4 text-center font-['Unbounded'] text-2xl font-bold text-white sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Not found</h1>
                    <p className="font-[Merriweather Sans] mb-6 text-center text-sm text-gray-300 sm:mb-8 sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                        The page you are looking for does not exist.
                        <br />
                        Please check the URL or return to the home page.
                    </p>
                    <button
                        className="relative left-1/2 z-20 flex h-4 w-25 -translate-x-1/2 transform items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-[8px] font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:cursor-pointer sm:h-7 sm:w-46 sm:rounded-lg md:text-sm lg:h-9 lg:w-64 lg:rounded-xl lg:text-lg"
                        onClick={() => navigate(ROUTES.HOME)}
                    >
                        RETURN TO HOME
                    </button>
                </div>
            </div>

            <ChatBot />
            <div className="h-10 w-screen lg:h-2" />
            <Footer />
        </section>
    );
};

export default Developing;
