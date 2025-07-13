import React from 'react';

const ReportHeader = ({ startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8">
      <h1 className="text-3xl sm:text-5xl font-bold tracking-wide mb-6 sm:mb-0 text-center sm:text-left pl-8">
        Revenue
      </h1>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="start-date" className="text-xs sm:text-sm">Start:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md bg-white/20 p-2 text-black placeholder-black shadow-md w-full sm:w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="end-date" className="text-xs sm:text-sm">End:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md bg-white/20 p-2 text-black placeholder-black shadow-md w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;