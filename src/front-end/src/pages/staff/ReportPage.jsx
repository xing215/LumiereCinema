import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StaffLayout from '../../layouts/StaffLayout'; // Đường dẫn đúng
import ReportHeader from '../../layouts/ReportPage/Header'; // Sửa lại đường dẫn
import TotalRevenueCard from '../../layouts/ReportPage/TotalRevenueCard'; // Sửa lại đường dẫn
import ChartCard from '../../layouts/ReportPage/ChartCard'; // Sửa lại đường dẫn
import CustomDropdown from '../../components/UI/CustomDropdown'; // Sửa lại đường dẫn
import ByDateRevenueChart from '../../layouts/ReportPage/ByDateRevenueChart'; // Sửa lại đường dẫn
import EmployeeRevenueList from '../../layouts/ReportPage/EmployeeRevenueList'; // Sửa lại đường dẫn
import MovieRevenueChart from '../../layouts/ReportPage/MovieRevenueChart'; // Sửa lại đường dẫn

const getInitialDates = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  return { firstDay, lastDay };
};

const ReportPage = () => {
  const { firstDay, lastDay } = getInitialDates();

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState({ id: 'All branches', name: 'All branches' });
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/branches');
        const apiBranches = response.data.map(branch => ({
          id: branch._id,
          name: branch.name
        }));
        setBranches([
          { id: 'All branches', name: 'All branches' },
          ...apiBranches
        ]);
      } catch (err) {
        console.error('Failed to fetch branches:', err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      setIsLoading(true);
      setError(null);

      const fetchRevenueSummary = async () => {
        try {
          const params = { startDate, endDate };
          if (selectedBranch.id !== 'All branches') {
            params.branchId = selectedBranch.id;
          }

          const response = await axios.get('http://localhost:5000/api/reports/revenue-summary', { params });
          setReportData(response.data);
        } catch (err) {
          setError('Failed to fetch data. Please try again.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRevenueSummary();
    }
  }, [startDate, endDate, selectedBranch]);

  const dropdownOptions = branches.map((branch) => ({
    value: branch.id,
    label: branch.name,
  }));

  return (
    <StaffLayout backgroundClass="bg-gray-300">
      <div className="bg-gray-300 overflow-x-hidden w-full h-full font-mina">
        <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute bottom-40 left-0 w-44 h-44 mix-blend-hard-light bg-yellow-300 rounded-full blur-[150px] sm:bottom-20 sm:left-5 sm:w-52 sm:h-52 sm:blur-[150px] md:bottom-30 md:left-10 md:w-60 md:h-60 md:blur-[180px] lg:bottom-15 lg:-left-30 lg:w-52 lg:h-52 lg:blur-[130px]"></div>
          <div className="absolute -bottom-10 -right-15 w-44 h-44 mix-blend-hard-light bg-purple-400 rounded-full blur-[100px] sm:bottom-10 sm:right-5 sm:w-32 sm:h-32 sm:blur-[80px] md:-bottom-10 md:right-10 md:w-40 md:h-40 md:blur-[80px] lg:-bottom-30 lg:right-0 lg:w-48 lg:h-48 lg:blur-[80px]"></div>
          <div className="absolute bottom-130 left-50 w-52 h-52 mix-blend-hard-light bg-sky-400 rounded-full blur-[160px] sm:bottom-160 sm:left-40 sm:w-64 sm:h-64 sm:blur-[140px] md:bottom-180 md:left-60 md:w-72 md:h-72 sm:blur-[130px] lg:bottom-170 lg:left-140 lg:w-80 lg:h-80 lg:blur-[180px]"></div>
          <div className="absolute bottom-50 right-0 w-20 h-44 mix-blend-hard-light bg-yellow-400 rounded-full blur-[80px] sm:bottom-80 sm:right-0 sm:w-28 sm:h-28 sm:blur-[100px] md:bottom-80 md:right-0 md:w-36 md:h-36 md:blur-[100px] lg:bottom-60 lg:left-380 lg:w-44 lg:h-68 lg:blur-[150px]"></div>
          <div className="absolute bottom-100 left-0 w-24 h-24 mix-blend-hard-light bg-pink-400 rounded-full blur-[150px] sm:top-40 sm:right-40 sm:w-52 sm:h-52 sm:blur-[180px] md:top-30 md:right-60 md:w-60 md:h-60 md:blur-[180px] lg:top-80 lg:left-50 lg:w-40 lg:h-40 lg:blur-[150px]"></div>
          <div className="absolute top-20 right-20 w-44 h-44 mix-blend-hard-light bg-pink-400 rounded-full blur-[180px] sm:top-40 sm:right-40 sm:w-52 sm:h-52 sm:blur-[180px] md:top-60 md:right-0 md:w-60 md:h-60 md:blur-[280px] lg:top-80 lg:right-50 lg:w-30 lg:h-30 lg:blur-[130px]"></div>
        </div>
        <div className="flex justify-center">
          <div className="relative z-10 w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <ReportHeader
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            <div className="mt-8">
              <div className="max-w-md mx-auto">
                <CustomDropdown
                  options={dropdownOptions}
                  value={selectedBranch.name}
                  onChange={(e) => {
                    const selected = branches.find((branch) => branch.id === e.target.value);
                    if (selected) {
                      setSelectedBranch(selected);
                    }
                  }}
                  placeholder="Select a branch"
                  bgColor="pink-400"
                  hoverColor="pink-500"
                  textColor="black"
                />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 sm:grid-cols-8 gap-6">
              <TotalRevenueCard data={reportData} isLoading={isLoading} />
              <ChartCard title="Movie Revenue" size="col-span-4 sm:col-span-5">
                {isLoading ? (
                  <p className="text-center text-black">Loading...</p>
                ) : (
                  <MovieRevenueChart data={reportData?.movieRevenue || []} />
                )}
              </ChartCard>
              <ChartCard title="Employee Revenue" size="col-span-4 sm:col-span-3">
                {isLoading ? (
                  <p className="text-center text-black">Loading...</p>
                ) : (
                  <EmployeeRevenueList data={reportData?.employeeRevenue || []} />
                )}
              </ChartCard>
              <ChartCard title="By Date Revenue" size="col-span-4 sm:col-span-5">
                {isLoading ? (
                  <p className="text-center text-black">Loading...</p>
                ) : (
                  <ByDateRevenueChart data={reportData?.byDateRevenue || []} />
                )}
              </ChartCard>
            </div>
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default ReportPage;