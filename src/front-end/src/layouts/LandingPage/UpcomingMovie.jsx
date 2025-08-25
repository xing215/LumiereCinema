import UpComingFrame from '@layouts/LandingPage/UpcomingFrame/UpComingMovieFrame.jsx';

const UpComing = () => {
    return (
        <section className="no-scrollbar relative z-18 h-auto w-screen flex-col overflow-y-visible bg-slate-950">
            <div className="absolute bottom-[-30px] left-1/3 -z-10 h-30 w-20 -translate-x-1/2 bg-purple-600/60 mix-blend-lighten blur-[100px] md:bottom-[-50px] md:h-75 md:w-50 lg:bottom-[-100px] lg:h-90 lg:w-60 xl:bottom-[-150px] xl:h-120 xl:w-80" />
            <UpComingFrame />
            <div className="relative h-10 w-screen bg-transparent sm:h-15 lg:h-20 xl:h-25" />
        </section>
    );
};

export default UpComing;
