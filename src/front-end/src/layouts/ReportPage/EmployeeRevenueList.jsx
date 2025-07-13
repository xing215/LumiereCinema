import React from 'react';

const EmployeeRevenueList = ({ data }) => {
  const formatNumber = (num) => (num ? num.toLocaleString('vi-VN') : '0');

  return (
    <div className="h-70 overflow-y-auto bg-transparent rounded-lg p-4">
      {data.length > 0 ? (
        data.map((employee, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 px-4 hover:bg-gray-100/50"
          >
            <span className="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
              {employee.employeeName}
            </span>
            <span className="text-indigo-600 text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
              {formatNumber(employee.revenue)} VND
            </span>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg">
          No employee data available.
        </p>
      )}
    </div>
  );
};

export default EmployeeRevenueList;