import React from 'react';

const ChartCard = ({ title, children, size = "col-span-1" }) => {
  return (
    <div className={`rounded-xl bg-zinc-400/50 p-6 backdrop-blur-sm shadow-lg ${size}`}>
      <h2 className="text-3xl font-bold text-center text-black">{title}</h2>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
