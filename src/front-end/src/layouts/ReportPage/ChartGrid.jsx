import React from 'react';
import ChartCard from './ChartCard';

const ChartGrid = () => {
  return (
    <div className="grid grid-cols-8 gap-6">
      {/* Total Revenue */}
      <ChartCard title="Total Revenue" size="col-span-3">
        <p className="text-6xl font-unbounded font-bold text-slate-900">70,000</p>
        <p className="text-black">thousand dong</p>
        <div className="mt-4 space-y-1 text-sm text-black">
          <p>50 showing movies</p>
          <p>123k ticket bookings</p>
          <p>400 screenings</p>
        </div>
      </ChartCard>

      {/* Movie Revenue */}
      <ChartCard title="Movie Revenue" size="col-span-5">
        <div className="h-56 w-full flex items-center justify-center text-black">[Component MovieRevenueChart]</div>
      </ChartCard>

      {/* Employee Revenue */}
      <ChartCard title="Employee Revenue" size="col-span-3">
        <div className="h-56 w-full flex items-center justify-center text-black">[Component EmployeeRevenueTable]</div>
      </ChartCard>

      {/* By Date Revenue */}
      <ChartCard title="By Date Revenue" size="col-span-5">
        <div className="h-56 w-full flex items-center justify-center text-black">[Component ByDateRevenueChart]</div>
      </ChartCard>
    </div>
  );
};

export default ChartGrid;
