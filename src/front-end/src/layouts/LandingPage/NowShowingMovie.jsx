import NowShowingMovieFrame from './NowShowingFrame/NowShowingMovieFrame.jsx';

const NowShowing = () => {
    return (
        <section className="no-scrollbar relative z-20 h-auto w-screen flex-col overflow-y-visible bg-slate-950">
            <div className="absolute bottom-0 h-40 w-20 rotate-[18.79deg] bg-purple-600/70 mix-blend-lighten blur-[100px] sm:h-60 sm:w-30 lg:bottom-[-100px] lg:left-[-70px] lg:h-100 lg:w-50 xl:left-[-100px] xl:h-140 xl:w-70" />
            <NowShowingMovieFrame />
            <div className="relative h-3 w-screen bg-transparent sm:h-6 lg:h-9 xl:h-15" />
        </section>
    );
};

export default NowShowing;
