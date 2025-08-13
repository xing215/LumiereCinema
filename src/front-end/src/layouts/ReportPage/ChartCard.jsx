import React from 'react';

const ChartCard = ({ title, children, size = 'col-span-1' }) => {
    return (
        <div className={`rounded-xl bg-zinc-400/50 p-3 shadow-lg backdrop-blur-sm sm:p-4 md:p-6 ${size} flex flex-col`}>
            <h2 className="flex-shrink-0 text-center font-['Libre_Franklin'] text-lg font-bold text-black sm:text-xl md:text-2xl">{title}</h2>
            <div className="mt-2 min-h-0 flex-1 sm:mt-4">{children}</div>
        </div>
    );
};

export default ChartCard;
