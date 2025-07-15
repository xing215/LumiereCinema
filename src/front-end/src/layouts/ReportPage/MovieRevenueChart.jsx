import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MovieRevenueChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip max-w-xs rounded border border-gray-300 bg-white p-2 text-xs shadow-lg sm:text-sm">
                    <p className="label font-bold break-words">{`${label}`}</p>
                    <p className="intro" style={{ color: payload[0].color }}>
                        {`Doanh thu: ${payload[0].value.toLocaleString('vi-VN')} VND`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full">
            {data.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-center text-gray-500">No data available.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="movieTitle" tick={false} />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="revenue" name="Revenue" fill="#9B2FFF" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default MovieRevenueChart;
