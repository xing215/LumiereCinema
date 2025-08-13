import React from 'react';

const EmployeeRevenueList = ({ data }) => {
    const formatNumber = (num) => (num ? num.toLocaleString('vi-VN') : '0');

    return (
        <div className="h-full overflow-y-auto rounded-lg bg-transparent p-2">
            {data.length > 0 ? (
                data.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-2 hover:bg-gray-100/50">
                        <span className="h-6 justify-start truncate font-['Libre_Franklin'] text-xs font-normal text-black sm:text-sm lg:text-lg">{employee.employeeName}</span>
                        <span className="h-6 justify-start font-['Libre_Franklin'] text-xs font-normal text-indigo-600 sm:text-sm lg:text-lg">{formatNumber(employee.revenue)} ₫</span>
                    </div>
                ))
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-center text-sm text-gray-500">No employee data available.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeRevenueList;
