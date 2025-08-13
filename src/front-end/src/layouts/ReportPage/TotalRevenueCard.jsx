import React from 'react';
import ChartCard from './ChartCard';

const TotalRevenueCard = ({ data, isLoading, size }) => {
    const formatNumber = (num) => (num ? num.toLocaleString('vi-VN') : '0');

    const revenue = data?.totalRevenue?.totalRevenue;
    const tickets = data?.totalRevenue?.totalTickets;
    const movies = data?.totalMovies;
    const revenueInThousands = revenue ? Math.round(revenue / 1000) : 0;

    return (
        <ChartCard title="Total Revenue" size={size}>
            <div className="flex h-full flex-col items-center justify-center text-center">
                {isLoading ? (
                    <p className="text-center text-black">Loading...</p>
                ) : (
                    <>
                        <p className="font-unbounded text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">{formatNumber(revenueInThousands)}</p>
                        <p className="text-sm text-black sm:text-base lg:text-lg">thousand Vietnam dongs</p>
                        <div className="mt-4 space-y-1 text-xs text-black sm:text-sm lg:text-base">
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
