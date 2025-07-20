import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StaffLayout from '@layouts/StaffLayout';
import ReportHeader from '@layouts/ReportPage/Header';
import TotalRevenueCard from '@layouts/ReportPage/TotalRevenueCard';
import ChartCard from '@layouts/ReportPage/ChartCard';
import CustomDropdown from '@components/UI/CustomDropdown';
import ByDateRevenueChart from '@layouts/ReportPage/ByDateRevenueChart';
import EmployeeRevenueList from '@layouts/ReportPage/EmployeeRevenueList';
import MovieRevenueChart from '@layouts/ReportPage/MovieRevenueChart';
import { getApiUrl } from '@config/api.config';

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
        const response = await axios.get(getApiUrl('branches'));
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
          const response = await axios.get(getApiUrl('revenueSummary'), { params });
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
      <div className="relative bg-gray-300 w-full min-h-screen lg:h-screen font-mina lg:overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute bottom-40 left-0 w-44 h-44 mix-blend-hard-light bg-yellow-300 rounded-full blur-[150px]"></div>
          <div className="absolute -bottom-10 -right-15 w-44 h-44 mix-blend-hard-light bg-purple-400 rounded-full blur-[100px]"></div>
          <div className="absolute -top-50 left-100 w-52 h-52 mix-blend-hard-light bg-sky-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-50 right-0 w-20 h-44 mix-blend-hard-light bg-yellow-400 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-100 left-0 w-24 h-24 mix-blend-hard-light bg-pink-400 rounded-full blur-[150px]"></div>
          <div className="absolute top-20 right-20 w-44 h-44 mix-blend-hard-light bg-pink-400 rounded-full blur-[180px]"></div>
        </div>

        <div className="relative z-10 w-full h-full lg:flex lg:flex-col p-4 sm:p-6">
          <div className="lg:flex-shrink-0">
            <ReportHeader
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </div>            <div className="lg:flex-1 mt-6 lg:min-h-0 flex items-start justify-center">
            <div className="w-[90%] h-[90%] overflow-auto max-h-[95vh] md:max-h-[90vh] lg:overflow-visible lg:max-h-none pb-56 sm:pb-40 md:pb-30 lg:pb-0">
              <div className="h-full grid grid-cols-1 grid-rows-4 md:grid-cols-6 md:grid-rows-2 lg:grid-cols-10 gap-4 md:gap-6">
                <TotalRevenueCard
                  data={reportData}
                  isLoading={isLoading}
                  size="col-span-1 row-span-1 md:col-span-2 lg:col-span-4"
                />
                <ChartCard
                  title="Movie Revenue"
                  size="col-span-1 row-span-1 md:col-span-4 lg:col-span-6"
                >
                  {isLoading ? (
                    <p className="text-center text-black">Loading...</p>
                  ) : (
                    <MovieRevenueChart data={reportData?.movieRevenue || []} />
                  )}
                </ChartCard>
                <ChartCard
                  title="Employee Revenue"
                  size="col-span-1 row-span-1 md:col-span-2 lg:col-span-4"
                >
                  {isLoading ? (
                    <p className="text-center text-black">Loading...</p>
                  ) : (
                    <EmployeeRevenueList data={reportData?.employeeRevenue || []} />
                  )}
                </ChartCard>
                <ChartCard
                  title="By Date Revenue"
                  size="col-span-1 row-span-1 md:col-span-4 lg:col-span-6"
                >
                  {isLoading ? (
                    <p className="text-center text-black">Loading...</p>
                  ) : (
                    <ByDateRevenueChart data={reportData?.byDateRevenue || []} />
                  )}
                </ChartCard>
              </div>
            </div>
          </div>          {error && <p className="text-center text-red-500 mt-4 flex-shrink-0">{error}</p>}        </div>        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-10 w-[90%] sm:w-110 lg:absolute lg:origin-center">
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
              variant="figma"
              bgColor="indigo-700 backdrop-blur-[50px]"
              inputBgColor="purple-400 backdrop-blur-[10px]"
              hoverColor="pink-500"
              borderColor="purple-500"
              textColor="white"
              openDirection="up"
              height="h-6 sm:h-7 md:h-8 lg:h-9"
              dropdownTextColor="black"
            />
        </div>
      </div>
    </StaffLayout>
  );
};

export default ReportPage;