import React from 'react';
import { UserProvider } from './contexts/UserContext.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import Login from './pages/Login';
import StaffLogin from './pages/staff/Login';
import StaffResetPwd from './pages/staff/ResetPwd';
import ChangePwd from './pages/ChangePwd';
import StaffChangePwd from './pages/staff/ChangePwd';
import MovieListPage from './pages/MovieList.jsx';
import CheckInCounterPage from './pages/staff/CheckInCounterPage.jsx';
import ScheduleManagePage from './pages/staff/ScheduleManagePage.jsx';
import PromotionManagePage from './pages/staff/PromotionManagePage.jsx';
import ReportPage from './pages/staff/ReportPage';
import ScreenManagePage from './pages/staff/ScreenManagePage.jsx';
import BranchManagePage from './pages/staff/BranchManagePage.jsx';
import AccountManagePage from './pages/staff/AccountManagePage.jsx';
import ResetPwdEmail from './pages/ResetPwdEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

const App = () => {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/staff/login" element={<StaffLogin />} />
                    <Route path="/reset-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/confirm" element={<ResetPwdEmail />} />
                    <Route path="/movies" element={<MovieListPage />} />
                    
                    {/* Protected routes - require authentication */}
                    <Route path="/change-password" element={
                        <ProtectedRoute>
                            <ChangePwd />
                        </ProtectedRoute>
                    } />
                    
                    {/* Staff routes - require staff roles */}
                    <Route path="/staff/reset-password" element={<StaffResetPwd />} />
                    <Route path="/staff/change-password" element={
                        <ProtectedRoute requiredRoles={['cashier', 'checkincounter', 'branchmanager', 'administrator']}>
                            <StaffChangePwd />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/checkin" element={
                        <ProtectedRoute requiredRoles={['checkincounter', 'branchmanager', 'administrator']}>
                            <CheckInCounterPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/schedule" element={
                        <ProtectedRoute requiredRoles={['branchmanager', 'administrator']}>
                            <ScheduleManagePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/promotion" element={
                        <ProtectedRoute requiredRoles={['branchmanager', 'administrator']}>
                            <PromotionManagePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/report" element={
                        <ProtectedRoute requiredRoles={['cashier', 'checkincounter', 'branchmanager', 'administrator']}>
                            <ReportPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/screen" element={
                        <ProtectedRoute requiredRoles={['branchmanager', 'administrator']}>
                            <ScreenManagePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/branch" element={
                        <ProtectedRoute requiredRoles={['branchmanager', 'administrator']}>
                            <BranchManagePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/staff/account" element={
                        <ProtectedRoute requiredRoles={['administrator']}>
                            <AccountManagePage />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </UserProvider>
    );
};

export default App;
