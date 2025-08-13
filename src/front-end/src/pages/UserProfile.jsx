import Header from '@/layouts/LandingPage/Header';
import ChatBot from '@components/display/ChatBot';
import { Title } from '@components/UI/label.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import Profile from '@/layouts/UserProfile/UserProfile';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@routes/routeConfig';

const UserProfile = () => {
    const location = useLocation();

    // Determine the title based on the current route
    const getPageTitle = () => {
        const pathname = location.pathname;
        switch (pathname) {
            case ROUTES.PROFILE:
                return 'ACCOUNT';
            case ROUTES.WISHLIST:
                return 'WISHLIST';
            case ROUTES.WATCH_HISTORY:
                return 'WATCH HISTORY';
            case ROUTES.LUNAR_POINT:
                return 'LUNAR POINTS';
            default:
                return 'ACCOUNT';
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-screen flex-col overflow-hidden overflow-x-hidden overflow-y-hidden bg-slate-950">
            <Header />
            <Title text={getPageTitle()} />
            <Profile />
            <div className="h-10 w-screen lg:h-20" />
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute top-[140px] left-[50px] h-20 w-20 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[180px] sm:left-[80px] sm:h-28 sm:w-28 md:top-[220px] md:left-[120px] md:h-36 md:w-36 lg:top-[275px] lg:left-[168px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[40px] -bottom-0 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[60px] sm:-bottom-0 sm:h-[350px] sm:w-[300px] md:-right-[80px] md:-bottom-0 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-0 lg:h-[580.90px] lg:w-[517.76px]" />{' '}
            <div className="pointer-events-none absolute right-[40px] bottom-0 h-20 w-20 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px] sm:right-[60px] sm:bottom-0 sm:h-28 sm:w-28 md:right-[80px] md:bottom-0 md:h-36 md:w-36 lg:right-100 lg:bottom-0 lg:h-44 lg:w-44" />
            <ChatBot />
            <Footer />
        </div>
    );
};

export default UserProfile;
