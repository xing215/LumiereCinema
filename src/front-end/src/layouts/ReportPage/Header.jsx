import React from 'react';

const ReportHeader = ({ startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-y-4 px-4 sm:px-8">
      <h1 className="w-full text-center text-3xl font-bold tracking-wide sm:w-auto sm:text-left sm:text-4xl lg:text-5xl sm:ml-[10%]">
        Revenue
      </h1>
      <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:mr-[3%]">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label htmlFor="start-date" className="flex-shrink-0 text-sm">Start:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md bg-white/20 p-2 text-black shadow-md"
          />
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label htmlFor="end-date" className="flex-shrink-0 text-sm">End:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md bg-white/20 p-2 text-black shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;