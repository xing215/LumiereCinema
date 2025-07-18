import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import { ROUTES } from '@routes/routeConfig.js';
import { useResetPassword } from '@hooks/useAuth';
import Header from '@layouts/LandingPage/Header.jsx';
import ChatBot from '@components/display/ChatBot.jsx';
import BackwardButton from '@components/buttons/backwardButton.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useResetPassword();
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate(ROUTES.HOME);
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Show loading while checking authentication
    if (authLoading) {
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

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setErrors({});

        if (!validateEmail(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await resetPassword(email);
            setMessage(response.data?.message || 'Email sent successfully.');
            setIsSuccess(response.success);
        } catch (error) {
            console.error('Forgot password error:', error);
            setMessage(error?.error || 'An error occurred. Please try again.');
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        setMessage('');
        setErrors({});
    };

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
                <div className="w-full max-w-xs px-4 sm:max-w-sm sm:px-0 md:max-w-md lg:max-w-lg xl:max-w-xl">
                    {/* Title */}
                    <h1 className="mb-4 text-center font-['Unbounded'] text-xl font-bold text-white sm:mb-6 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">FORGOT PASSWORD</h1>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                        {/* Message */}
                        {message && (
                            <div className={`rounded-md p-3 text-center ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <p className="font-['Libre_Franklin'] text-sm">{message}</p>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.email ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                placeholder="Enter your email address"
                                required
                            />
                            {errors.email && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.email}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4 sm:pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex h-10 w-full max-w-xs items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 hover:cursor-pointer hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)] sm:h-11 sm:max-w-sm sm:rounded-lg sm:text-base md:h-12 md:max-w-md md:rounded-xl md:text-lg lg:h-13 lg:text-xl ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
                            </button>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <span
                                onClick={() => !isLoading && navigate(ROUTES.LOGIN)}
                                className={`font-['Libre_Franklin'] text-sm font-normal text-white hover:text-purple-300 sm:text-base md:text-lg ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                                Back to Login
                            </span>
                        </div>
                    </form>
                </div>
            </div>

            <ChatBot />
            <div className="w-screen lg:h-15" />
            <Footer />
        </section>
    );
};

export default ForgotPassword;
