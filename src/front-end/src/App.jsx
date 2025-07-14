import React from 'react';
import { UserProvider } from './contexts/UserContext.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import Login from './pages/Login';
import StaffLogin from './pages/staff/Login';
import ResetPwd from './pages/ResetPwd';
import StaffResetPwd from './pages/staff/ResetPwd';
import ChangePwd from './pages/ChangePwd';
import StaffChangePwd from './pages/staff/ChangePwd';
import MovieListPage from './pages/MovieList.jsx';
import CheckInCounterPage from './pages/staff/CheckInCounterPage.jsx';
import ScheduleManagePage from './pages/staff/ScheduleManagePage.jsx';
import PromotionManagePage from './pages/staff/PromotionManagePage.jsx';
import ScreenManagePage from './pages/staff/ScreenManagePage.jsx';
import BranchManagePage from './pages/staff/BranchManagePage.jsx';
import AccountManagePage from './pages/staff/AccountManagePage.jsx';

const App = () => {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/staff/login" element={<StaffLogin />} />
                    <Route path="/reset-password" element={<ResetPwd />} />
                    <Route path="/staff/reset-password" element={<StaffResetPwd />} />
                    <Route path="/change-password" element={<ChangePwd />} />
                    <Route path="/staff/change-password" element={<StaffChangePwd />} />
                    <Route path="/movies" element={<MovieListPage />} />
                    <Route path="/staff/checkin" element={<CheckInCounterPage />} />
                    <Route path="/staff/schedule" element={<ScheduleManagePage />} />
                    <Route path="/staff/promotion" element={<PromotionManagePage />} />
                    <Route path="/staff/screen" element={<ScreenManagePage />} />
                    <Route path="/staff/branch" element={<BranchManagePage />} />
                    <Route path="/staff/account" element={<AccountManagePage />} />
                </Routes>
            </Router>
        </UserProvider>
    );
};

export default App;
