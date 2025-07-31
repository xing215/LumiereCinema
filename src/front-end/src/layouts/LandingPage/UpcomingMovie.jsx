import SeeMoreButton from '@components/buttons/seeMoreButton.jsx';
import UpComingFrame from '@layouts/LandingPage/UpcomingFrame/UpComingMovieFrame.jsx';

const Label = () => {
    return (
        <div className="z-20 w-screen pt-5 sm:pt-7 lg:pt-10 xl:pt-15">
            <div className="justify-start text-center font-['Unbounded'] text-sm font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">UPCOMING MOVIES</div>
        </div>
    );
};

const UpComing = () => {
    return (
        <section className="no-scrollbar relative z-18 h-auto w-screen flex-col overflow-y-visible bg-slate-950">
            <div className="absolute bottom-[-30px] left-1/3 -z-10 h-30 w-20 -translate-x-1/2 bg-purple-600/60 mix-blend-lighten blur-[100px] md:bottom-[-50px] md:h-75 md:w-50 lg:bottom-[-100px] lg:h-90 lg:w-60 xl:bottom-[-150px] xl:h-120 xl:w-80" />
            <Label />
            <UpComingFrame />
            <div className="relative h-2 w-screen bg-transparent sm:h-4 lg:h-6 xl:h-10" />
            <SeeMoreButton statusFilter={"up"} />
            <div className="relative h-10 w-screen bg-transparent sm:h-15 lg:h-20 xl:h-25" />
        </section>
    );
};

export default UpComing;
