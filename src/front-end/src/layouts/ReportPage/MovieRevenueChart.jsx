import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MovieRevenueChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-lg max-w-xs">
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
    <div className="w-full h-full flex justify-center items-center">
      {data.length === 0 ? (
        <p className="text-center text-gray-500">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="movieTitle" tick={false} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="Doanh thu" fill="#9B2FFF" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MovieRevenueChart;