import React from 'react';
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';

const ByDateRevenueChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-lg text-xs sm:text-sm">
          <p>{`Date: ${label}`}</p>
          <p style={{ color: payload[0].color }}>
            {`Revenue: ${payload[0].value.toLocaleString('vi-VN')} VND`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {data.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-center text-gray-500">No data available for the selected period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Bar dataKey="revenue" name="Revenue" fill="#9B2FFF" barSize={30} />
            <Line type="monotone" name="Trend" dataKey="revenue" stroke="#ff7300" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ByDateRevenueChart;
