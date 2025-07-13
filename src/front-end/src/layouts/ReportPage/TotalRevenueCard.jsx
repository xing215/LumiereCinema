import React from 'react';
import ChartCard from './ChartCard';

const TotalRevenueCard = ({ data, isLoading }) => {
  const formatNumber = (num) => (num ? num.toLocaleString('vi-VN') : '0');

  const revenue = data?.totalRevenue?.totalRevenue;
  const tickets = data?.totalRevenue?.totalTickets;
  const movies = data?.totalMovies;

  return (
    <ChartCard title="Total Revenue" size="col-span-4 sm:col-span-3">
      <div className="flex flex-col justify-center items-center h-full">
        {isLoading ? (
          <p className="text-center text-black">Loading...</p>
        ) : (
          <>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-unbounded font-bold text-slate-900">
              {formatNumber(revenue)}
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-black">VND</p>
            <div className="mt-4 space-y-1 text-xs sm:text-sm md:text-base lg:text-lg text-black text-center">
              <p>{formatNumber(movies)} showing movies</p>
              <p>{formatNumber(tickets)} ticket bookings</p>
            </div>
          </>
        )}
      </div>
    </ChartCard>
  );
};

export default TotalRevenueCard;