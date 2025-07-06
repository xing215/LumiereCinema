import React from 'react';
import LoginForm from "../../layouts/Login/LoginForm.jsx";

const StaffLogin = () => {
    return (
        <section className="relative bg-slate-950 overflow-x-hidden overflow-y-hidden w-screen min-h-screen no-scrollbar">
            
            {/* Background visual
            <div className="w-52 h-52 mix-blend-lighten bg-sky-400/60 rounded-full blur-[100px]" />
            <div className="
                absolute lg:top-[135px] md:top-[100px] sm:top-[80px] top-[60px] 
                lg:-left-[71px] md:-left-[50px] sm:-left-[30px] -left-[20px]
                lg:w-44 md:w-36 sm:w-28 w-20 
                lg:h-44 md:h-36 sm:h-28 h-20 
                mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]
                pointer-events-none
            "/>
        
            <div className="
                absolute lg:-bottom-80 md:-bottom-50 sm:-bottom-40 -bottom-30
                lg:-right-100 md:-right-[190px] sm:-right-[120px] -right-[100px]
                lg:w-[517.76px] md:w-[400px] sm:w-[300px] w-[200px]
                lg:h-[580.90px] md:h-[450px] sm:h-[350px] h-[250px]
                rotate-[150deg] mix-blend-lighten bg-sky-400/60 blur-[100px]
                pointer-events-none
            "/> */}
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
                absolute lg:bottom-[300px] md:bottom-[295px] sm:bottom-[290px] bottom-[285px]
                lg:-right-[50px] md:-right-[40px] sm:-right-[30px] -right-[20px]
                lg:w-44 md:w-36 sm:w-35 w-30
                lg:h-44 md:h-36 sm:h-35 h-30 
                mix-blend-lighten bg-amber-300/60 rounded-full blur-[100px]
                pointer-events-none
            "/>

            {/* Main component */}
            <div className="
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                lg:w-[1000px] md:w-[800px] sm:w-[600px] w-[500px]
                lg:h-[584px] md:h-[450px] sm:h-[350px] h-[280px]
                mix-blend-color-dodge bg-zinc-300/30 rounded-xl
                // lg:pt-30 md:pt-16 sm:pt-14 pt-15 lg:px-8 md:px-6 sm:px-4 px-6
            " />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] lg:pt-30 md:pt-16 sm:pt-14 pt-15 lg:px-8 md:px-6 sm:px-4 px-6">
                <LoginForm showRegister={false} />
            </div>
        </section>
    );
};

export default StaffLogin;
