import { useFetchProfile } from "@hooks/useUser";  
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ROUTES } from '@routes/routeConfig'; 

const MenuItems = ({name, onclick, hide=false, blur=false, isActive=false}) => {
return (
            <div className="relative w-full flex flex-col justify-start group">
            {hide ? null : <div className="relative w-full h-1 px-3 mix-blend-color-dodge bg-zinc-300/30" />}
            <button
                className={`relative cursor-pointer w-full h-auto py-3 text-center text-white md:text-md lg:text-lg font-normal font-['Unbounded'] ${isActive ? 'bg-gradient-to-t from-transparent to-amber-50/20' : ''} ${blur ? 'group-hover:bg-gradient-to-t group-hover:from-transparent group-hover:to-amber-50/10' :'group-hover:mix-blend-color-dodge group-hover:bg-amber-50/7' }`}
                onClick={onclick}
            >
                {name}
            </button>
        </div>
    );
};

const SideBar = ({in_lunar_point=false, onMenuClick, currentStep, user}) => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setProfile(user);
        }
    }, [user]);
    
    function toTitleCase(str) {
        return str?.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
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
        LUNAR_POINTS: 3
    };

    return (
        <div className="relative w-full h-auto rounded-xl overflow-hidden">
            {/* Header background overlays */}
            <div className="absolute w-full h-full inset-0 bg-zinc-300/30 mix-blend-color-dodge rounded-xl" />
            <div className="relative w-full h-auto mix-blend-color-dodge bg-zinc-300/30 rounded-xl">

            {/* Welcome and username */}
            <div className="relative flex flex-col items-start justify-start py-3 pl-5 gap-1">
            <div className=" relative text-white text-lg lg:text-xl font-bold font-['Libre_Franklin'] ">
                Welcome
            </div>
            <div className=" relative text-white text-md lg:text-lg leading-snug mr-2 font-bold font-['Libre_Franklin'] line-wrap">
                 {toTitleCase(profile?.name)}
            </div>
            </div>
            </div>
            {<>
            <MenuItems 
                name="Information" 
                onclick={() => handleMenuClick("Information")} 
                hide={true} 
                isActive={currentStep === MENU_STEPS.PROFILE}
            />
            <MenuItems 
                name="Wishlist" 
                onclick={() => handleMenuClick("Wishlist")} 
                isActive={currentStep === MENU_STEPS.WISHLIST}
            />
            <MenuItems 
                name="Watch history" 
                onclick={() => handleMenuClick("Watch history")} 
                isActive={currentStep === MENU_STEPS.WATCH_HISTORY}
            />
            <MenuItems 
                name="Lunar points" 
                onclick={() => handleMenuClick("Lunar points")} 
                blur={true} 
                isActive={currentStep === MENU_STEPS.LUNAR_POINTS}
            />
            </>}

            {in_lunar_point ? null : <>
                <div className="relative w-full h-7"/>
                {/* Points Counter */}
                <div className="absolute right-2 bottom-3 text-right text-white text-[8px] font-light font-['Unbounded']">
                    {currentPoints}/{targetPoints}
                </div>

                {/* Progress Bar - LUNARPOINTS */}
                <div className="absolute bottom-0 left-0 right-0 h-1">
                    {/* Background */}
                    <div className="w-full h-full bg-slate-950"></div>
                    
                    {/* Progress Fill */}
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 via-sky-400 to-amber-300 transition-all duration-500 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </>}
        </div>
    );
};

export default SideBar;
