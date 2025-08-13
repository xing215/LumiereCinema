import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import { ROUTES } from '@routes/routeConfig.js';
import { useForgotPassword } from '@hooks/useAuth';
import Header from '@layouts/LandingPage/Header.jsx';
import ChatBot from '@components/display/ChatBot';
import BackwardButton from '@components/buttons/backwardButton.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import ForgotPwdForm from '@layouts/ResetPwd/ForgotPwdForm.jsx';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useUser();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate(ROUTES.HOME);
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950">
                <div className="font-['Unbounded'] text-lg text-white">Loading...</div>
            </div>
        );
    }

    // Don't render form if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    const forgotPwdHook = useForgotPassword();
    return (
        <section className="no-scrollbar relative min-h-screen w-screen overflow-x-hidden overflow-y-hidden bg-slate-950">
            <Header />

            {/* Background visual */}
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute bottom-[170px] left-[100px] h-35 w-35 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:bottom-[180px] sm:left-[130px] sm:h-38 sm:w-38 md:bottom-[190px] md:left-[150px] md:h-40 md:w-40 lg:bottom-[200px] lg:left-[200px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[100px] -bottom-30 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[120px] sm:-bottom-40 sm:h-[350px] sm:w-[300px] md:-right-[190px] md:-bottom-50 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-80 lg:h-[580.90px] lg:w-[517.76px]" />

            {/* Main component */}
            <div className="absolute top-10 left-5 flex items-center sm:top-15 sm:left-8 md:top-20 md:left-10 lg:top-25 lg:left-20">
                <BackwardButton onClick={() => navigate(-1)} position="relative" />
            </div>

            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 pt-15 sm:px-4 sm:pt-14 md:px-6 md:pt-16 lg:px-8 lg:pt-30">
                <ForgotPwdForm forgotPwdHook={forgotPwdHook} />
            </div>

            <div className="w-screen lg:h-15" />
            <Footer />
        </section>
    );
};

export default ForgotPassword;
