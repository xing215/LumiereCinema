import React from 'react';

const EmployeeRevenueList = ({ data }) => {
  const formatNumber = (num) => (num ? num.toLocaleString('vi-VN') : '0');

  return (
    <div className="h-full overflow-y-auto bg-transparent rounded-lg p-2">
      {data.length > 0 ? (
        data.map((employee, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 px-2 hover:bg-gray-100/50"
          >
            <span className="text-gray-800 text-xs sm:text-sm font-medium truncate">
              {employee.employeeName}
            </span>
            <span className="text-indigo-600 text-xs sm:text-sm font-semibold">
              {formatNumber(employee.revenue)} VND
            </span>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-gray-500 text-sm">No employee data available.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeRevenueList;