import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.jsx';
import { ROUTES } from '../../routes/routeConfig.js';
import ResetPwdForm from '../../layouts/ResetPwd/ResetPwdForm.jsx';
import BackwardButton from '../../components/buttons/backwardButton2.jsx';

const StaffResetPwd = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useUser();

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate(ROUTES.HOME);
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white font-['Unbounded'] text-lg">Loading...</div>
            </div>
        );
    }

    // Don't render form if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return (
        <section className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden overflow-y-hidden bg-slate-950">
            <div className="pointer-events-none absolute top-[150px] left-[20px] h-40 w-40 rounded-full bg-sky-400/60 mix-blend-lighten blur-[100px] sm:top-[100px] sm:left-[180px] sm:h-45 sm:w-45 md:top-[80px] md:left-[250px] md:h-50 md:w-50 lg:-top-[141px] lg:left-[353px] lg:h-52 lg:w-52" />
            <div className="pointer-events-none absolute top-[480px] -left-[30px] h-30 w-30 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[450px] sm:-left-[30px] sm:h-35 sm:w-35 md:top-[400px] md:-left-[50px] md:h-36 md:w-36 lg:top-[373px] lg:-left-[67px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[20px] bottom-[390px] h-30 w-30 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px] sm:-right-[30px] sm:bottom-[400px] sm:h-35 sm:w-35 md:-right-[40px] md:bottom-[480px] md:h-36 md:w-36 lg:-right-[50px] lg:bottom-[500px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute right-[20px] bottom-[50px] h-40 w-40 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:-right-[0px] sm:bottom-[0px] sm:h-45 sm:w-45 md:right-[100px] md:bottom-[90px] md:h-50 md:w-50 lg:right-[250px] lg:-bottom-[100px] lg:h-56 lg:w-56" />

            {/* Main component */}
            <div className="absolute top-10 left-5 flex items-center sm:top-10 sm:left-10 md:top-10 md:left-15 lg:top-10 lg:left-20">
                <BackwardButton onClick={() => navigate(-1)} position="relative" />
            </div>
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-zinc-300/30 mix-blend-color-dodge sm:h-[450px] sm:w-[600px] md:h-[500px] md:w-[800px] lg:h-[584px] lg:w-[1000px]" />
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 pt-15 sm:px-4 sm:pt-14 md:px-6 md:pt-16 lg:px-8 lg:pt-30">
                <ResetPwdForm />
            </div>
        </section>
    );
};

export default StaffResetPwd;
