import SideBar from "@/layouts/UserProfile/SideBar";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomDropdown from "@/components/UI/CustomDropdown";
import { ROUTES } from '@routes/routeConfig';
import { useFetchProfile } from "@/hooks/useUser";
import Moon from '@assets/img/Moon.png';
const LunarPoints = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Profile data
    const { fetchProfile, profile, loading, error } = useFetchProfile();
    
    // State management
    const [accountPage, setAccountPage] = useState('');
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const [lastSegment, setLastSegment] = useState('/' + pathSegments[pathSegments.length - 1]);

    // Helper functions
    const getTierDisplayName = (rank) => {
        switch (rank) {
            case 'SILVER':
                return 'Silver Tier';
            case 'GOLD':
                return 'Gold Tier';
            case 'PLATINUM':
                return 'Platinum Tier';
            default:
                return 'Silver Tier';
        }
    };

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

    // Thêm function để tính toán vị trí Moon an toàn
    // const getMoonPosition = (rank, lunarPoints) => {
    //     const percentage = getProgressPercentage(rank, lunarPoints);
    //     return percentage;
    // };

    // Event handlers
    const handleInputChange = (e) => {
        const { value } = e.target;
        setAccountPage(value);
        
        switch (value) {
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
    };

    // Effects
    useEffect(() => {
        console.log('Fetching profile...');
        fetchProfile();
    }, []);

    useEffect(() => {
        const getLastSegment = '/' + pathSegments[pathSegments.length - 1];
        setLastSegment(getLastSegment);
    }, [pathSegments]);

    useEffect(() => {
        // Set the default account page based on the URL
        switch (lastSegment) {
            case ROUTES.PROFILE:
                setAccountPage('Information');
                break;
            case ROUTES.WISHLIST:
                setAccountPage('Wishlist');
                break;
            case ROUTES.WATCH_HISTORY:
                setAccountPage('Watch history');
                break;
            case ROUTES.LUNAR_POINT:
                setAccountPage('Lunar points');
                break;
            default:
                break;
        }
    }, [lastSegment]);

    // Computed values
    const currentRank = profile?.loyaltyRank?.rank;
    const currentPoints = profile?.loyaltyRank?.lunarPoints || 0;
    const targetPoints = getNextTierTarget(currentRank);
    const progressPercentage = getProgressPercentage(currentRank, currentPoints);
    // const moonPosition = getMoonPosition(currentRank, currentPoints);
    // Error handling
    if (error) {
        return (
            <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
                <div className="text-red-400 text-center">
                    <p className="text-lg font-semibold mb-2">Error</p>
                    <p className="text-sm">Failed to load profile data</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

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
                        bgColor="indigo-700 backdrop-blur-[10px]"
                        inputBgColor="zinc-300/30 mix-blend-color-dodge"
                        hoverColor="white"
                        borderColor="white"
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
                    <SideBar in_lunar_point={true} />
                </div>

                {/* Main Content */}
                <div className="relative w-full h-auto md:w-[72%]">
                    {/* Background Overlay */}
                    <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                    
                    <div className="p-10 md:pl-15 w-[90%] mx-auto md:mx-0">
                        {/* Header */}
                        <div className="flex justify-start items-start mb-6">
                            {/* Xóa div spacer và gap-3.5 */}
                            <h1 className="text-white text-2xl md:text-3xl font-bold font-['Libre_Franklin']">
                                Lunar Points
                            </h1>
                        </div>

                        {/* Progress Section */}
                        <div className="relative mb-12">
                            {/* Tier Label */}
                            <div className="mb-2">
                                <span className="text-white text-sm md:text-base font-semibold font-['Unbounded']">
                                    {getTierDisplayName(currentRank)}
                                </span>
                            </div>
                            
                            {/* Points Counter */}
                            <div className="flex justify-end mb-2">
                                <span className="text-white text-xs font-light font-['Unbounded']">
                                    {currentPoints}/{targetPoints}
                                </span>
                            </div>

                            {/* Progress Bar - Flexbox Approach */}
                            <div className="relative w-full mb-4">
                                {/* Background */}
                                <div className="w-full h-2 bg-gray-600 rounded-full"></div>
                                
                                {/* Progress with Moon */}
                                <div 
                                    className="absolute top-0 left-0 h-2 flex items-center transition-all duration-500 ease-in-out"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    {/* Progress fill */}
                                    <div className="w-full h-full bg-gradient-to-r from-pink-400 via-sky-400 to-amber-300 rounded-full"></div>
                                    
                                    {/* Moon at the end */}
                                    <div className="absolute -top-4 -right-5 w-10 h-10">
                                        <img 
                                            src={Moon} 
                                            alt="Moon Icon" 
                                            className="w-full h-full rotate-90 object-contain" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Note */}
                        <div className="text-white text-xs font-light font-['Unbounded'] leading-relaxed">
                            <span className="font-medium">Note:</span>
                            <br />
                            <span>
                                All customers are initially assigned to the Silver Tier, earning 1 point for every 10,000 VND spent, with no default promotion.
                            </span>
                            <br />
                            <br />
                            <span className="font-medium">Gold Tier:</span> 
                            <span>
                                {" "}Customers are automatically upgraded to the Gold Tier upon accumulating 500 points, earning 3 points per 10,000 VND spent and receiving a default 5% discount.
                            </span>
                            <br />
                            <br />
                            <span className="font-medium">Platinum Tier:</span> 
                            <span>
                                {" "}Customers are automatically upgraded to the Platinum Tier upon accumulating 1,500 points, earning 5 points per 10,000 VND spent and enjoying a default 10% discount.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LunarPoints;