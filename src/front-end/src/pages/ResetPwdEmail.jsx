import React, { useEffect, useState } from 'react';
import { useUser } from '@contexts/UserContext';
import Header from '@layouts/LandingPage/Header.jsx';
import ChangePwdForm from '@layouts/ChangePwd/ChangePwdForm.jsx';
import ChatBot from '@components/display/ChatBot';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@routes/routeConfig.js';
import Footer from '@layouts/LandingPage/Footer.jsx';

const ResetPwdEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [resetToken, setResetToken] = useState(null);
    const [tokenError, setTokenError] = useState(false);
    const { isAuthenticated, logout } = useUser();

    useEffect(() => {
        // If logged in, auto logout before proceeding
        if (isAuthenticated) {
            logout();
        }
        const token = searchParams.get('token');
        if (token) {
            setResetToken(token);
        } else {
            setTokenError(true);
        }
    }, [searchParams, isAuthenticated, logout]);

    return (
        <section className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden overflow-y-hidden bg-slate-950">
            <Header />

            {/* Background visual */}
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute bottom-[170px] left-[100px] h-35 w-35 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:bottom-[180px] sm:left-[130px] sm:h-38 sm:w-38 md:bottom-[190px] md:left-[150px] md:h-40 md:w-40 lg:bottom-[200px] lg:left-[200px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[100px] -bottom-30 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[120px] sm:-bottom-40 sm:h-[350px] sm:w-[300px] md:-right-[190px] md:-bottom-50 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-80 lg:h-[580.90px] lg:w-[517.76px]" />
            
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 pt-15 sm:px-4 sm:pt-14 md:px-6 md:pt-16 lg:px-8 lg:pt-30">
            {/* Main component */}
            {tokenError ? 
                setTimeout(() => {
                    navigate(ROUTES.HOME);
                }, 0)
             : (
                <ChangePwdForm ResetToken={resetToken} />
            )}
        </div>
        <div className="w-screen lg:h-15" />
        <Footer />
    </section>
    );
};

export default ResetPwdEmail;
