import SideBar from '@/layouts/UserProfile/SideBar';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomDropdown from '@/components/UI/CustomDropdown';
import { ROUTES } from '@routes/routeConfig';
import { useFetchProfile } from '@/hooks/useUser';
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
            <div className="relative flex w-screen items-center justify-center overflow-hidden pt-3 md:pt-7">
                <div className="text-center text-red-400">
                    <p className="mb-2 text-lg font-semibold">Error</p>
                    <p className="text-sm">Failed to load profile data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex w-full items-center justify-center overflow-hidden">
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl md:min-h-[470px] md:w-screen md:flex-row md:items-start md:justify-start md:gap-3 lg:h-auto lg:w-[calc(75vw)]">
                {/* Main Content */}
                <div className="relative h-auto w-full">
                    <div className="mx-auto w-[90%] md:mx-0">
                        {/* Header */}
                        <div className="mb-6 flex items-start justify-start">
                            {/* Xóa div spacer và gap-3.5 */}
                            <h1 className="font-['Libre_Franklin'] text-2xl font-bold text-white md:text-3xl">Lunar Points</h1>
                        </div>

                        {/* Progress Section */}
                        <div className="relative mb-12">
                            {/* Tier Label */}
                            <div className="mb-2">
                                <span className="font-['Unbounded'] text-sm font-semibold text-white md:text-base">{getTierDisplayName(currentRank)}</span>
                            </div>

                            {/* Points Counter */}
                            <div className="mb-2 flex justify-end">
                                <span className="font-['Unbounded'] text-xs font-light text-white">
                                    {currentPoints}/{targetPoints}
                                </span>
                            </div>

                            {/* Progress Bar - Flexbox Approach */}
                            <div className="relative mb-4 w-full">
                                {/* Background */}
                                <div className="h-2 w-full rounded-full bg-gray-600"></div>

                                {/* Progress with Moon */}
                                <div className="absolute top-0 left-0 flex h-2 items-center transition-all duration-500 ease-in-out" style={{ width: `${progressPercentage}%` }}>
                                    {/* Progress fill */}
                                    <div className="h-full w-full rounded-full bg-gradient-to-r from-pink-400 via-sky-400 to-amber-300"></div>

                                    {/* Moon at the end */}
                                    <div className="absolute -top-4 -right-5 h-10 w-10">
                                        <img src={Moon} alt="Moon Icon" className="h-full w-full rotate-90 object-contain" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Note */}
                        <div className="font-['Unbounded'] text-xs leading-relaxed font-light text-white">
                            <span className="font-medium">Note:</span>
                            <br />
                            <span>All customers are initially assigned to the Silver Tier, earning 1 point for every 10,000 VND spent, with no default promotion.</span>
                            <br />
                            <br />
                            <span className="font-medium">Gold Tier:</span>
                            <span> Customers are automatically upgraded to the Gold Tier upon accumulating 500 points, earning 3 points per 10,000 VND spent and receiving a default 5% discount.</span>
                            <br />
                            <br />
                            <span className="font-medium">Platinum Tier:</span>
                            <span>
                                {' '}
                                Customers are automatically upgraded to the Platinum Tier upon accumulating 1,500 points, earning 5 points per 10,000 VND spent and enjoying a default 10% discount.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LunarPoints;
