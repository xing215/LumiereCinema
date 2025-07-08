import NowShowingMovieFrame from "./NowShowingFrame/NowShowingMovieFrame.jsx";
import SeeMoreButton from "../../components/buttons/seeMoreButton.jsx";

const Label = () => {
    return (
        <div className="w-screen pt-5 sm:pt-7 lg:pt-10 xl:pt-15">
            <div className="text-center text-white justify-start font-['Unbounded'] font-bold
            xl:text-5xl lg:text-4xl md:text-2xl text-sm">
                NOW SHOWING
            </div>
        </div>
    );
}

const NowShowing = () => {
    return (
        <section className="relative flex-col bg-slate-950 w-screen h-auto z-20 overflow-y-visible no-scrollbar">
            <div className="absolute bottom-0 lg:bottom-[-100px] xl:left-[-100px] lg:left-[-70px] rotate-[18.79deg] mix-blend-lighten bg-purple-600/70 blur-[100px]
            xl:w-70 lg:w-50 sm:w-30 w-20
            xl:h-140 lg:h-100 sm:h-60 h-40" />
            <Label/>
            <NowShowingMovieFrame/>
            <div className="relative bg-transparent w-screen xl:h-10 lg:h-6 sm:h-4 h-2"/>
            <SeeMoreButton/>
            <div className="relative bg-transparent w-screen xl:h-15 lg:h-9 sm:h-6 h-3"/>
        </section>
    );
}

export default NowShowing;