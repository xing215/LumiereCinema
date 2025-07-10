import React, { useState } from 'react';
import ChangePwd from "../../layouts/ChangePwd/ChangePwdForm.jsx";
import StaffSidebar from '../../components/display/staffSidebar.jsx';
import { useUser } from '../../contexts/UserContext.jsx';

const StaffChangePwd = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { userRoles, userName } = useUser(); // Get user data from context

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Sidebar */}
            <StaffSidebar
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                theme="dark"
                userRoles={userRoles}
                currentUser={{
                    name: userName,
                    role: userRoles[0] || 'staff'
                }}
                showQuickActions={true}
                onItemClick={(item) => console.log('Clicked:', item.label)}
            />

            {/* Main content area */}
            <div className={`flex-1 transition-all duration-300 ${
                isCollapsed 
                ? 'ml-0' 
                : 'ml-0 lg:ml-64'
            } relative overflow-hidden`}>
                <section className="relative bg-slate-950 overflow-x-hidden overflow-y-hidden w-full min-h-screen no-scrollbar">
            
            {/* Background visual */}
            <div className="
                absolute lg:-top-[141px] md:top-[80px] sm:top-[100px] top-[150px] 
                lg:left-[353px] md:left-[250px] sm:left-[180px] left-[20px]
                lg:w-52 md:w-50 sm:w-45 w-40 
                lg:h-52 md:h-50 sm:h-45 h-40 
                mix-blend-lighten bg-sky-400/60 rounded-full blur-[100px]
                pointer-events-none
            "/>
            <div className="
                absolute lg:top-[373px] md:top-[400px] sm:top-[450px] top-[480px] 
                lg:-left-[67px] md:-left-[50px] sm:-left-[30px] -left-[30px]
                lg:w-44 md:w-36 sm:w-35 w-30
                lg:h-44 md:h-36 sm:h-35 h-30 
                mix-blend-lighten bg-pink-400/60 rounded-full blur-[100px]
                pointer-events-none
            "/>
            <div className="
                absolute lg:bottom-[500px] md:bottom-[480px] sm:bottom-[400px] bottom-[390px]
                lg:-right-[50px] md:-right-[40px] sm:-right-[30px] -right-[20px]
                lg:w-44 md:w-36 sm:w-35 w-30
                lg:h-44 md:h-36 sm:h-35 h-30 
                mix-blend-lighten bg-amber-300/60 rounded-full blur-[100px]
                pointer-events-none
            "/>
            <div className="
                absolute lg:-bottom-[100px] md:bottom-[90px] sm:bottom-[0px] bottom-[50px]
                lg:right-[250px] md:right-[100px] sm:-right-[0px] right-[20px]
                lg:w-56 md:w-50 sm:w-45 w-40
                lg:h-56 md:h-50 sm:h-45 h-40
                mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]
                pointer-events-none
            "/>

            {/* Main component */}
            <div className="
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                lg:w-[1000px] md:w-[800px] sm:w-[600px] w-[500px]
                lg:h-[590px] md:h-[550px] sm:h-[500px] h-[450px]
                mix-blend-color-dodge bg-zinc-300/30 rounded-xl
                pointer-events-none
            " />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] lg:pt-30 md:pt-16 sm:pt-14 pt-15 lg:px-8 md:px-6 sm:px-4 px-6">
                <ChangePwd />
            </div>
        </section>
            </div>
        </div>
    );
};

export default StaffChangePwd;
