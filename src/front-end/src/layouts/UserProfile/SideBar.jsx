import { useFetchProfile } from '@hooks/useUser';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@routes/routeConfig';

const MenuItems = ({ name, onclick, hide = false, blur = false, isActive = false }) => {
    return (
        <div className="group relative flex w-full flex-col justify-start">
            {hide ? null : <div className="relative h-1 w-full bg-zinc-300/30 px-3 mix-blend-color-dodge" />}
            <button
                className={`md:text-md relative h-auto w-full cursor-pointer py-3 text-center font-['Unbounded'] font-normal text-white lg:text-lg ${isActive ? 'bg-gradient-to-t from-transparent to-amber-50/20' : ''} ${blur ? 'group-hover:bg-gradient-to-t group-hover:from-transparent group-hover:to-amber-50/10' : 'group-hover:bg-amber-50/7 group-hover:mix-blend-color-dodge'}`}
                onClick={onclick}
            >
                {name}
            </button>
        </div>
    );
};

const SideBar = ({ in_lunar_point = false, onMenuClick, currentStep, user }) => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setProfile(user);
        }
    }, [user]);

    function toTitleCase(str) {
        return str?.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    const getNextTierTarget = (rank) => {
        switch (rank) {
            case 'SILVER':
                return 500;
            case 'GOLD':
                return 1500;
            case 'PLATINUM':
                return 1500;
            default:
                return 500;
        }
    };

    const getProgressPercentage = (rank, lunarPoints) => {
        const points = lunarPoints || 0;
        const target = getNextTierTarget(rank);
        return Math.min((points / target) * 100, 100);
    };

    const handleMenuClick = (menuName) => {
        if (onMenuClick) {
            onMenuClick(menuName);
        } else {
            // Fallback to original navigation logic
            switch (menuName) {
                case 'Information':
                    navigate(ROUTES.PROFILE);
                    break;
                case 'Wishlist':
                    navigate(ROUTES.WISHLIST);
                    break;
                case 'Watch history':
                    navigate(ROUTES.WATCH_HISTORY);
                    break;
                case 'Lunar points':
                    navigate(ROUTES.LUNAR_POINT);
                    break;
                default:
                    break;
            }
        }
    };

    const currentRank = profile?.loyaltyRank?.rank;
    const currentPoints = profile?.loyaltyRank?.lunarPoints || 0;
    const targetPoints = getNextTierTarget(currentRank);
    const progressPercentage = getProgressPercentage(currentRank, currentPoints);

    // Define which menu items are active based on currentStep
    const MENU_STEPS = {
        PROFILE: 0,
        WATCH_HISTORY: 1,
        WISHLIST: 2,
        LUNAR_POINTS: 3,
    };

    return (
        <div className="relative h-auto w-full overflow-hidden rounded-xl">
            {/* Header background overlays */}
            <div className="absolute inset-0 h-full w-full rounded-xl bg-zinc-300/30 mix-blend-color-dodge" />
            <div className="relative h-auto w-full rounded-xl bg-zinc-300/30 mix-blend-color-dodge">
                {/* Welcome and username */}
                <div className="relative flex flex-col items-start justify-start gap-1 py-3 pl-5">
                    <div className="relative font-['Libre_Franklin'] text-lg font-bold text-white lg:text-xl">Welcome</div>
                    <div className="text-md line-wrap relative mr-2 font-['Libre_Franklin'] leading-snug font-bold text-white lg:text-lg">{toTitleCase(profile?.name)}</div>
                </div>
            </div>
            {
                <>
                    <MenuItems name="Information" onclick={() => handleMenuClick('Information')} hide={true} isActive={currentStep === MENU_STEPS.PROFILE} />
                    <MenuItems name="Wishlist" onclick={() => handleMenuClick('Wishlist')} isActive={currentStep === MENU_STEPS.WISHLIST} />
                    <MenuItems name="Watch history" onclick={() => handleMenuClick('Watch history')} isActive={currentStep === MENU_STEPS.WATCH_HISTORY} />
                    <MenuItems name="Lunar points" onclick={() => handleMenuClick('Lunar points')} blur={true} isActive={currentStep === MENU_STEPS.LUNAR_POINTS} />
                </>
            }

            {in_lunar_point ? null : (
                <>
                    <div className="relative h-7 w-full" />
                    {/* Points Counter */}
                    <div className="absolute right-2 bottom-3 text-right font-['Unbounded'] text-[8px] font-light text-white">
                        {currentPoints}/{targetPoints}
                    </div>

                    {/* Progress Bar - LUNARPOINTS */}
                    <div className="absolute right-0 bottom-0 left-0 h-1">
                        {/* Background */}
                        <div className="h-full w-full bg-slate-950"></div>

                        {/* Progress Fill */}
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 via-sky-400 to-amber-300 transition-all duration-500 ease-in-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SideBar;
