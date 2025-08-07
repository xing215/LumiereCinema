import SideBar from "./SideBar";
import React, { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import { useLocation, useNavigate } from "react-router-dom";
import CustomDropdown from "@/components/UI/CustomDropdown";
import { ROUTES } from '@routes/routeConfig';
import { useUser } from '@contexts/UserContext';

// Import the individual layout components
import WatchHistoryComponent from "@/layouts/WatchHistory/WatchHistory";
import WishlistComponent from "@/layouts/Wishlist/Wishlist";
import LunarPointsComponent from "@/layouts/LunarPoints/LunarPoints";

const MENU_STEPS = {
    PROFILE: 0,
    WATCH_HISTORY: 1,
    WISHLIST: 2,
    LUNAR_POINTS: 3
};

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();
    
    const [currentStep, setCurrentStep] = useState(MENU_STEPS.PROFILE);
    const [accountPage, setAccountPage] = useState('Information');

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const [currentPath, setCurrentPath] = useState(location.pathname);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        // Set the current step based on the URL
        if (currentPath === ROUTES.PROFILE) {
            setCurrentStep(MENU_STEPS.PROFILE);
            setAccountPage('Information');
        } else if (currentPath === ROUTES.WATCH_HISTORY) {
            setCurrentStep(MENU_STEPS.WATCH_HISTORY);
            setAccountPage('Watch history');
        } else if (currentPath === ROUTES.WISHLIST) {
            setCurrentStep(MENU_STEPS.WISHLIST);
            setAccountPage('Wishlist');
        } else if (currentPath === ROUTES.LUNAR_POINT) {
            setCurrentStep(MENU_STEPS.LUNAR_POINTS);
            setAccountPage('Lunar points');
        }
    }, [currentPath]);

    const handleInputChange = (e) => {
        const { value } = e.target;
        setAccountPage(value);
        
        if (value === 'Information') {
            setCurrentStep(MENU_STEPS.PROFILE);
            navigate(ROUTES.PROFILE);
        } else if (value === 'Wishlist') {
            setCurrentStep(MENU_STEPS.WISHLIST);
            navigate(ROUTES.WISHLIST);
        } else if (value === 'Watch history') {
            setCurrentStep(MENU_STEPS.WATCH_HISTORY);
            navigate(ROUTES.WATCH_HISTORY);
        } else if (value === 'Lunar points') {
            setCurrentStep(MENU_STEPS.LUNAR_POINTS);
            navigate(ROUTES.LUNAR_POINT);
        }
    };

    const handleSidebarMenuClick = (menuName) => {
        switch (menuName) {
            case 'Information':
                setCurrentStep(MENU_STEPS.PROFILE);
                setAccountPage('Information');
                navigate(ROUTES.PROFILE);
                break;
            case 'Wishlist':
                setCurrentStep(MENU_STEPS.WISHLIST);
                setAccountPage('Wishlist');
                navigate(ROUTES.WISHLIST);
                break;
            case 'Watch history':
                setCurrentStep(MENU_STEPS.WATCH_HISTORY);
                setAccountPage('Watch history');
                navigate(ROUTES.WATCH_HISTORY);
                break;
            case 'Lunar points':
                setCurrentStep(MENU_STEPS.LUNAR_POINTS);
                setAccountPage('Lunar points');
                navigate(ROUTES.LUNAR_POINT);
                break;
            default:
                break;
        }
    };

    const renderCurrentMenu = () => {
        switch (currentStep) {
            case MENU_STEPS.PROFILE:
                return <ProfileForm />;
            case MENU_STEPS.WATCH_HISTORY:
                return <WatchHistoryComponent />;
            case MENU_STEPS.WISHLIST:
                return <WishlistComponent />;
            case MENU_STEPS.LUNAR_POINTS:
                return <LunarPointsComponent />;
            default:
                return <ProfileForm />;
        }
    };

    return (
        <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full md:gap-3 flex-col md:flex-row justify-center items-center md:items-start md:justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                {/* Mobile Dropdown */}
                <div className="block md:hidden w-[95%] h-auto pb-3">
                    <CustomDropdown 
                        name="accountPage"
                        placeholder=""
                        value={accountPage}
                        onChange={handleInputChange}
                        bgColor="indigo-700 backdrop-blur-[30px]"
                        inputBgColor="pink-400"
                        variant={'figma'}
                        hoverColor="purple-700"
                        borderColor=""
                        textColor="white"
                        dropdownTextColor="white"
                        height="h-10"
                        inputTextSize="text-md"
                        optionTextSize="text-sm"
                        openDirection='down'
                        textAlign="left"
                        options={[
                            { value: 'Information', label: 'Information' },
                            { value: 'Wishlist', label: 'Wishlist' },
                            { value: 'Watch history', label: 'Watch history' },
                            { value: 'Lunar points', label: 'Lunar points' },
                        ]}
                    />
                </div>
                
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-[25%] h-auto">
                    <SideBar 
                        onMenuClick={handleSidebarMenuClick} 
                        currentStep={currentStep} 
                        user={user}
                    />
                </div>
                
                {/* Main Content Area */}
                <div className="relative w-full h-auto md:w-[72%]">
                    <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                    <div className="p-10 md:pl-12 mx-auto md:mx-0">
                        {renderCurrentMenu()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
