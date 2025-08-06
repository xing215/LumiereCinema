import Header from '@layouts/LandingPage/Header.jsx';
import Banner from '@layouts/LandingPage/Banner.jsx';
import ChatBot from '@components/display/ChatBot';
import AiSearch from '@components/display/AiSearch';
import NowShowing from '@layouts/LandingPage/NowShowingMovie.jsx';
import Maps from '@layouts/LandingPage/Maps.jsx';
import UpComing from '@layouts/LandingPage/UpcomingMovie.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import { useFetchBranches } from '@hooks/useBranch';
import { useEffect } from 'react';
import ErrorModal from '@layouts/Error';

const LandingPage = () => {
    const { fetchBranches, branches, loading, error } = useFetchBranches();
    useEffect(() => {
        fetchBranches();
    }, []);    return (
        <div className="no-scrollbar flex w-screen flex-col items-center overflow-hidden bg-slate-950">
            <Header />
            <div className="relative w-full">
                <Banner />
                <AiSearch />
            </div>
            <NowShowing />
            <Maps cinemas={branches} />
            <UpComing />
            <Footer />
            <ChatBot />
        </div>
    );
};

export default LandingPage;
