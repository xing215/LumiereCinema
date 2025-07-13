import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';

const ByDateRevenueChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="label">{`Ngày: ${label}`}</p>
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
        <p className="text-center text-gray-500">No data available for the selected period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="Doanh thu" fill="#9B2FFF" barSize={30} />
            <Line type="monotone" name="Xu hướng" dataKey="revenue" stroke="#ff7300" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ByDateRevenueChart;