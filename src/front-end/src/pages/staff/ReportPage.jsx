import React, { useState, useEffect, useMemo } from 'react';
import { useGetRevenueReport, useGetAvailableBranches } from '@hooks/useReport';
import { useGetBranchById } from '@hooks/useBranch';
import StaffLayout from '@layouts/StaffLayout';
import ReportHeader from '@layouts/ReportPage/Header';
import TotalRevenueCard from '@layouts/ReportPage/TotalRevenueCard';
import ChartCard from '@layouts/ReportPage/ChartCard';
import CustomDropdown from '@components/UI/CustomDropdown';
import ByDateRevenueChart from '@layouts/ReportPage/ByDateRevenueChart';
import EmployeeRevenueList from '@layouts/ReportPage/EmployeeRevenueList';
import MovieRevenueChart from '@layouts/ReportPage/MovieRevenueChart';
import { useUser } from '@contexts/UserContext';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';

const getInitialDates = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
};

const ReportPage = () => {
    const { user } = useUser();
    const { firstDay, lastDay } = getInitialDates();
    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);
    const [selectedBranchForAdmin, setSelectedBranchForAdmin] = useState({ id: 'All branches', name: 'All branches' });

    const { getBranchById, branch: userBranch, loading: branchLoading, error: branchError } = useGetBranchById();
    const { getAvailableBranches, branches, loading: branchesLoading, error: branchesError } = useGetAvailableBranches();
    const { getRevenueReport, reportData, loading: reportLoading, error: reportError } = useGetRevenueReport();

    const isManager = useMemo(() => user?.roles?.includes('branchmanager'), [user]);
    const isAdmin = useMemo(() => user?.roles?.includes('administrator'), [user]);
    const managerBranchId = useMemo(() => user?.branch?._id, [user]);

    // useEffect để lấy dữ liệu ban đầu
    useEffect(() => {
        if (isManager && managerBranchId) {
            getBranchById(managerBranchId);
        }
        if (isAdmin) {
            getAvailableBranches();
        }
    }, [isManager, isAdmin, managerBranchId]);

    // useEffect chính để lấy dữ liệu báo cáo
    useEffect(() => {
        const filters = { startDate, endDate };
        let branchIdToFetch = null;

        if (isManager && managerBranchId) {
            branchIdToFetch = managerBranchId;
        } else if (isAdmin && selectedBranchForAdmin.id !== 'All branches') {
            branchIdToFetch = selectedBranchForAdmin.id;
        }

        if (branchIdToFetch) {
            filters.branchId = branchIdToFetch;
        }

        getRevenueReport(filters);
    }, [startDate, endDate, selectedBranchForAdmin, isManager, isAdmin, managerBranchId]);

    const dropdownOptions = [{ value: 'All branches', label: 'All branches' }, ...branches.map((branch) => ({ value: branch._id, label: branch.name }))];

    const selectedBranchObj = dropdownOptions.find((opt) => opt.value === selectedBranchForAdmin.id) || dropdownOptions[0];
    return (
        <StaffLayout backgroundClass="bg-gray-300">
            <div className="font-mina relative min-h-screen w-full bg-gray-300 lg:h-screen lg:overflow-hidden">
                <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute bottom-40 left-0 h-44 w-44 rounded-full bg-yellow-300 mix-blend-hard-light blur-[150px]"></div>
                    <div className="absolute -right-15 -bottom-10 h-44 w-44 rounded-full bg-purple-400 mix-blend-hard-light blur-[100px]"></div>
                    <div className="absolute -top-50 left-100 h-52 w-52 rounded-full bg-sky-400 mix-blend-hard-light blur-[120px]"></div>
                    <div className="absolute right-0 bottom-50 h-44 w-20 rounded-full bg-yellow-400 mix-blend-hard-light blur-[80px]"></div>
                    <div className="absolute bottom-100 left-0 h-24 w-24 rounded-full bg-pink-400 mix-blend-hard-light blur-[150px]"></div>
                    <div className="absolute top-20 right-20 h-44 w-44 rounded-full bg-pink-400 mix-blend-hard-light blur-[180px]"></div>
                </div>
                <div className="relative z-10 h-full w-full p-4 sm:p-6 lg:flex lg:flex-col">
                    <div className="lg:flex-shrink-0">
                        <ReportHeader startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
                    </div>
                    <div className="mt-6 flex items-start justify-center lg:min-h-0 lg:flex-1">
                        <div className="h-[90%] max-h-[95vh] w-[90%] overflow-auto pb-56 sm:pb-40 md:max-h-[90vh] md:pb-30 lg:max-h-none lg:overflow-visible lg:pb-0">
                            <div className="grid h-full grid-cols-1 grid-rows-4 gap-4 md:grid-cols-6 md:grid-rows-2 md:gap-6 lg:grid-cols-10">
                                <TotalRevenueCard data={reportData} isLoading={reportLoading} size="col-span-1 row-span-1 md:col-span-2 lg:col-span-4" />
                                <ChartCard title="Movie Revenue" size="col-span-1 row-span-1 md:col-span-4 lg:col-span-6">
                                    {reportLoading ? <p className="text-center text-black">Loading...</p> : <MovieRevenueChart data={reportData?.movieRevenue || []} />}
                                </ChartCard>
                                <ChartCard title="Employee Revenue" size="col-span-1 row-span-1 md:col-span-2 lg:col-span-4">
                                    {reportLoading ? <p className="text-center text-black">Loading...</p> : <EmployeeRevenueList data={reportData?.employeeRevenue || []} />}
                                </ChartCard>
                                <ChartCard title="By Date Revenue" size="col-span-1 row-span-1 md:col-span-4 lg:col-span-6">
                                    {reportLoading ? <p className="text-center text-black">Loading...</p> : <ByDateRevenueChart data={reportData?.byDateRevenue || []} />}
                                </ChartCard>
                            </div>
                        </div>
                    </div>
                    {(reportError || branchesError || branchError) && <p className="mt-4 flex-shrink-0 text-center text-red-500">{reportError || branchesError || branchError}</p>}
                </div>
                <div className="fixed bottom-1 left-1/2 z-10 w-[90%] -translate-x-1/2 sm:w-110 lg:absolute lg:origin-center">
                    {isAdmin ? (
                        <CustomDropdown
                            options={dropdownOptions}
                            value={selectedBranchObj.value}
                            onChange={(e) => {
                                const selected = dropdownOptions.find((branch) => branch.value === e.target.value);
                                if (selected) {
                                    setSelectedBranchForAdmin({ id: selected.value, name: selected.label });
                                }
                            }}
                            forceFillLabel={true}
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
                    ) : isManager ? (
                        <SelectBranchButton isLoading={branchLoading} branchName={userBranch?.name} />
                    ) : null}
                </div>
            </div>
        </StaffLayout>
    );
};

export default ReportPage;
