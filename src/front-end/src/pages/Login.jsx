import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext.jsx';
import { ROUTES } from '../routes/routeConfig.js';
import Header from '../layouts/LandingPage/Header.jsx';
import LoginForm from '../layouts/Login/LoginForm.jsx';
import ChatBot from '../components/display/ChatBot.jsx';
import Footer from '../layouts/LandingPage/Footer.jsx';

const Login = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useUser();

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            const userRoles = user.roles || [];
            const hasStaffRole = userRoles.some(role => 
                ['cashier', 'checkincounter', 'branchmanager', 'administrator'].includes(role)
            );
            
            if (hasStaffRole) {
                navigate(ROUTES.STAFF_ROOT);
            } else {
                navigate(ROUTES.HOME);
            }
        }
    }, [isAuthenticated, isLoading, user, navigate]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white font-['Unbounded'] text-lg">Loading...</div>
            </div>
        );
    }

    // Don't render login form if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return (
        <section className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden overflow-y-hidden bg-slate-950">
            <Header />

            {/* Background visual */}
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute top-[140px] left-[50px] h-20 w-20 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[180px] sm:left-[80px] sm:h-28 sm:w-28 md:top-[220px] md:left-[120px] md:h-36 md:w-36 lg:top-[275px] lg:left-[168px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[100px] -bottom-30 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[120px] sm:-bottom-40 sm:h-[350px] sm:w-[300px] md:-right-[190px] md:-bottom-50 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-80 lg:h-[580.90px] lg:w-[517.76px]" />

            {/* Main component */}
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 pt-15 sm:px-4 sm:pt-14 md:px-6 md:pt-16 lg:px-8 lg:pt-30">
                <LoginForm />
            </div>
            <ChatBot />

            <div className="w-screen lg:h-15" />
            <Footer />
        </section>
    );
};

export default Login;
