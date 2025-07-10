import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import Login from './pages/Login';
import StaffLogin from './pages/staff/Login';
import ResetPwd from './pages/ResetPwd';
import StaffResetPwd from './pages/staff/ResetPwd';
import ChangePwd from './pages/ChangePwd';
import StaffChangePwd from './pages/staff/ChangePwd';
import MovieListPage from "./pages/MovieList.jsx";
import CheckInCounterPage from "./pages/staff/CheckInCounterPage.jsx";
import ScheduleManagePage from "./pages/staff/ScheduleManagePage.jsx";

const App = () => {
    return (
        <ScheduleManagePage/>
    );
};

export default App;
