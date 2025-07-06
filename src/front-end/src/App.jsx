import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import Login from './pages/Login';
import StaffLogin from './pages/staff/Login';
import ResetPwd from './pages/ResetPwd';
import StaffResetPwd from './pages/staff/ResetPwd';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/reset-password" element={<ResetPwd />} />
                <Route path="/staff/reset-password" element={<StaffResetPwd />} />
            </Routes>
        </Router>
    );
};

export default App;
