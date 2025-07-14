import React from 'react';
import ChartCard from './ChartCard';

const TotalRevenueCard = ({ data, isLoading, size }) => {  const formatNumber = (num) => (num ? num.toLocaleString('vi-VN') : '0');

  const revenue = data?.totalRevenue?.totalRevenue;
  const tickets = data?.totalRevenue?.totalTickets;
  const movies = data?.totalMovies;
  // Chia doanh thu cho 1000 để hiển thị theo đơn vị nghìn
  const revenueInThousands = revenue ? Math.round(revenue / 1000) : 0;

  return (
    <ChartCard title="Total Revenue" size={size}>
      <div className="flex flex-col justify-center items-center h-full text-center">
        {isLoading ? (
          <p className="text-center text-black">Loading...</p>
        ) : (
          <>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-unbounded font-bold text-slate-900">
              {formatNumber(revenueInThousands)}
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-black">nghìn VND</p>
            <div className="mt-4 space-y-1 text-xs sm:text-sm lg:text-base text-black">
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