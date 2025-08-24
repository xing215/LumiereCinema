import React from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import { ROUTES } from '@routes/routeConfig.js';
import { useLogout } from '@hooks/useAuth';
import NavButton from '@components/buttons/header/navButton.jsx';
import Logo from '@components/buttons/logoButton.jsx';
import { LogOut, Menu, X } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useUser();
    const { logoutUser, loading } = useLogout();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: '<span style="color:#fff;font-size:1.5rem;font-weight:500;">You are about to logout...</span>',
            showCancelButton: true,
            background: '#23222a',
            color: '#fff',
            confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Logout</span>',
            cancelButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">Cancel</span>',
            customClass: { popup: 'swal2-popup-rating', confirmButton: 'swal2-btn-gradient', cacelButton: 'swal2-btn-gradient' },
            reverseButtons: true,
        });
        if (result.isConfirmed) {
            try {
                await logoutUser();
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                logout();
                await Swal.fire({
                    icon: 'success',
                    title: '<span style="color:#fff;font-size:1.2rem;font-weight:500;">Logged out successfully</span>',
                    background: '#23222a',
                    color: '#fff',
                    confirmButtonText: '<span style="font-weight:700;letter-spacing:0.5px;">OK</span>',
                    customClass: { popup: 'swal2-popup-rating', confirmButton: 'swal2-btn-gradient' },
                });
            }
        }
    };

    const handleAccountClick = () => {
        if (isAuthenticated) {
            navigate(ROUTES.PROFILE);
        } else {
            const currentPath = window.location.pathname + window.location.search;
            navigate(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(currentPath)}`);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside or on escape
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('header')) {
                closeMobileMenu();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMobileMenuOpen]);

    const LogoutButton = () => (
        <div className="z-50 flex h-[36px] w-auto -translate-y-1 items-center">
            <div className="h-full w-[5px] md:w-[10px] lg:w-[15px]" />
            <button className="h-[25px] w-[12px] hover:cursor-pointer md:h-[30px] md:w-[15px] lg:h-[40px] lg:w-[25px] xl:h-[45px] xl:w-[30px]" aria-label="Logout" onClick={handleLogout}>
                <LogOut className="h-full w-full text-white" strokeWidth={4} />
            </button>
        </div>
    );

    const MobileMenuButton = () => (
        <div className="z-50 flex h-[36px] w-auto items-center">
            <button
                className="h-10 w-10 p-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer sm:h-13 sm:w-13 md:h-13 md:w-13"
                aria-label="Toggle menu"
                onClick={toggleMobileMenu}
            >
                {isMobileMenuOpen ? <X className="h-full w-full text-white" strokeWidth={2.5} /> : <Menu className="h-full w-full text-white" strokeWidth={2.5} />}
            </button>
        </div>
    );

    const MobileMenu = () => (
        <div
            className={`absolute top-full right-4 z-40 w-48 rounded-lg border border-slate-700/60 bg-zinc-800/30 backdrop-blur-md transition-all duration-300 sm:w-52 md:w-56 lg:hidden ${
                isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
            }`}
        >
            <div className="flex flex-col space-y-1 px-3 py-2">
                <button
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-slate-800/50"
                    onClick={() => {
                        navigate(ROUTES.MOVIES);
                        closeMobileMenu();
                    }}
                >
                    Buy Tickets
                </button>
                <button
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-slate-800/50"
                    onClick={() => {
                        navigate(ROUTES.BUY_SNACK);
                        closeMobileMenu();
                    }}
                >
                    Buy Snacks
                </button>

                <button
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-slate-800/50"
                    onClick={() => {
                        handleAccountClick();
                        closeMobileMenu();
                    }}
                >
                    {isAuthenticated ? 'Account' : 'Login/Register'}
                </button>
                {isAuthenticated && (
                    <>
                        <div className="mx-2 my-1 h-px bg-slate-700/50" />
                        <button
                            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20"
                            onClick={() => {
                                handleLogout();
                                closeMobileMenu();
                            }}
                        >
                            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <header className="bg-opacity-10 no-scrollbar fixed top-0 z-100 w-screen overflow-y-visible bg-transparent">
            <div className="absolute top-0 left-1/2 z-20 h-8 w-[calc(120vw+2rem)] -translate-x-1/2 transform bg-gradient-to-b from-slate-950 via-slate-950 to-transparent sm:h-10 lg:h-20" />
            <div className="absolute top-0 left-1/2 z-20 h-15 w-[calc(120vw+2rem)] -translate-x-1/2 transform bg-gradient-to-b from-slate-950 via-slate-950 to-transparent blur-sm sm:h-20 sm:blur-lg lg:h-30 lg:blur-md" />

            {/* Mobile & SM & MD Navigation - justify-between */}
            <div className="relative mx-auto flex max-w-screen flex-nowrap content-center items-center justify-between overflow-x-hidden px-4 pt-2 sm:pt-3 md:pt-3 lg:hidden">
                <Logo onClick={() => navigate(ROUTES.HOME)} />
                <MobileMenuButton />
            </div>

            {/* Desktop Navigation - justify-center (LG and above) */}
            <div className="relative mx-auto hidden max-w-screen flex-nowrap content-center items-center justify-center overflow-x-hidden pt-2 md:gap-3 md:pt-3 lg:flex lg:gap-5 lg:pt-5.5 xl:gap-10 xl:pt-9">
                <Logo onClick={() => navigate(ROUTES.HOME)} />
                <NavButton name="Buy Tickets" onClick={() => navigate(ROUTES.MOVIES)} />
                <NavButton name="Buy Snacks" onClick={() => navigate(ROUTES.BUY_SNACK)} />
                <NavButton name={isAuthenticated ? 'Account' : 'Login/Register'} onClick={handleAccountClick} />
                {isAuthenticated && <LogoutButton />}
            </div>

            {/* Mobile & SM & MD Dropdown Menu */}
            <MobileMenu />
        </header>
    );
};

export default Header;
