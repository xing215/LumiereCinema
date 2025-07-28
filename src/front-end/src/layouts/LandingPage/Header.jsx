import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import { ROUTES } from '@routes/routeConfig.js';
import { useLogout } from '@hooks/useAuth';
import NavButton from '@components/buttons/header/navButton.jsx';
import SearchButton from '@components/buttons/searchButton.jsx';
import Logo from '@components/buttons/logoButton.jsx';
import { LogOut } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useUser();
    const { logoutUser, loading } = useLogout();

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            navigate(ROUTES.HOME);
        }
    };

    const handleAccountClick = () => {
        if (isAuthenticated) {
            // Temporarily navigate to '#' as requested
            navigate(ROUTES.PROFILE);
        } else {
            navigate(ROUTES.LOGIN);
        }
    };

    const LogoutButton = () => (
        <div className="z-50 flex h-[36px] w-auto -translate-y-1 items-center">
            <div className="h-full w-[5px] md:w-[10px] lg:w-[15px]" />
            <button 
                className="h-[25px] w-[12px] hover:cursor-pointer md:h-[30px] md:w-[15px] lg:h-[40px] lg:w-[25px] xl:h-[45px] xl:w-[30px]" 
                aria-label="Logout"
                onClick={handleLogout}
            >
                <LogOut className="h-full w-full text-white" strokeWidth={4} />
            </button>
        </div>
    );

    return (
        <header className="bg-opacity-100 no-scrollbar fixed top-0 z-100 w-screen overflow-y-visible bg-transparent">
            <div className="absolute top-0 left-1/2 z-20 h-8 w-[calc(120vw+2rem)] -translate-x-1/2 transform bg-gradient-to-b from-slate-950 via-slate-950 to-transparent sm:h-10 lg:h-20" />
            <div className="absolute top-0 left-1/2 z-20 h-15 w-[calc(120vw+2rem)] -translate-x-1/2 transform bg-gradient-to-b from-slate-950 via-slate-950 to-transparent blur-sm sm:h-20 sm:blur-lg lg:h-30 lg:blur-md" />
            <div className="relative mx-auto flex max-w-screen flex-nowrap content-center items-center justify-center overflow-x-hidden pt-2 md:gap-3 md:pt-3 lg:gap-5 lg:pt-5.5 xl:gap-10 xl:pt-9">
                <Logo onClick={() => navigate(ROUTES.HOME)} />
                <NavButton name="Buy Tickets" onClick={() => navigate(ROUTES.MOVIES)} />
                <NavButton name="Buy Snacks" onClick={() => navigate(ROUTES.BUY_SNACK)} />
                <NavButton 
                    name={isAuthenticated ? 'Account' : 'Login/Register'} 
                    onClick={handleAccountClick}
                />
                <SearchButton />
                {isAuthenticated && <LogoutButton />}
            </div>
        </header>
    );
};

export default Header;
