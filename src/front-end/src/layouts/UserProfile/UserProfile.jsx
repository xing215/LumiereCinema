import SideBar from "./SideBar";
import React, { use, useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import { useLocation, useNavigate } from "react-router-dom";
import CustomDropdown from "@/components/UI/CustomDropdown";
import { ROUTES } from '@routes/routeConfig';

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAccountPage(value);
        if (value === 'Information') {
           navigate(ROUTES.PROFILE);
        }
        else if (value === 'Wishlist') {
            navigate(ROUTES.WISHLIST);
        } else if (value === 'Watch history') {
            navigate(ROUTES.WATCH_HISTORY);
        } else if (value === 'Lunar points') {
            navigate(ROUTES.LUNAR_POINT);
        }
    };

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const [accountPage, setAccountPage] = useState('');
    const [lastSegment, setLastSegment] = useState('/' + pathSegments[pathSegments.length - 1]);
    useEffect(() => {
        const getLastSegment = '/' + pathSegments[pathSegments.length - 1];
        setLastSegment(getLastSegment);
    }, [pathSegments]);

    useEffect(() => {
        // Set the default account page based on the URL
        if (lastSegment === ROUTES.PROFILE) {
            setAccountPage('Information');
        } else if (lastSegment === ROUTES.WISHLIST) {
            setAccountPage('Wishlist');
        } else if (lastSegment === ROUTES.WATCH_HISTORY) {
            setAccountPage('Watch history');
        } else if (lastSegment === ROUTES.LUNAR_POINT) {
            setAccountPage('Lunar points');
        }
    }, [lastSegment]);

    return (
    <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
            
            <div className="relative flex h-full w-full md:gap-3 flex-col md:flex-row justify-center items-center md:items-start md:justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                <div className="block md:hidden w-[95%] h-auto pb-3">
                    <CustomDropdown name="discount"
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
                <div className="hidden md:block w-[25%] h-auto">
                    <SideBar />
                </div>
                <div className="relative w-full h-auto md:w-[72%]">
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                    <div className="p-10 md:pl-15 w-[90%] mx-auto md:mx-0">
                    <ProfileForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
