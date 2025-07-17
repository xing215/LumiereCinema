import React from 'react';

const ChartCard = ({ title, children, size = "col-span-1" }) => {
  return (
    <div className={`rounded-xl bg-zinc-400/50 p-3 sm:p-4 md:p-6 backdrop-blur-sm shadow-lg ${size} flex flex-col`}>
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-black font-['Libre_Franklin'] flex-shrink-0">
        {title}
      </h2>
      <div className="mt-2 sm:mt-4 flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
