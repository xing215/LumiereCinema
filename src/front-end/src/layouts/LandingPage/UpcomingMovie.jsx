import NowShowingMovieFrame from "./NowShowingFrame/NowShowingMovieFrame.jsx";
import SeeMoreButton from "../../components/buttons/seeMoreButton.jsx";
import UpComingFrame from "./UpcomingFrame/UpComingMovieFrame.jsx";

const Label = () => {
    return (
        <div className="w-screen pt-5 sm:pt-7 lg:pt-10 xl:pt-15 z-20">
            <div className="text-center text-white justify-start font-['Unbounded'] font-bold
            xl:text-5xl lg:text-4xl md:text-2xl text-sm">
                UPCOMING MOVIES
            </div>
        </div>
    );
}

const UpComing = () => {
    return (
        <section className="relative flex-col bg-slate-950 w-screen h-auto z-18 overflow-y-visible no-scrollbar">
            <div className="absolute mix-blend-lighten bg-purple-600/60 blur-[100px] z-10
            left-1/3 -translate-x-1/2
            xl:bottom-[-150px] lg:bottom-[-100px] md:bottom-[-50px] bottom-[-30px]
            xl:w-80 lg:w-60 md:w-50 w-20
            xl:h-120 lg:h-90 md:h-75 h-30" />
            <Label/>
            <UpComingFrame/>
            <div className="relative bg-transparent w-screen xl:h-10 lg:h-6 sm:h-4 h-2"/>
            <SeeMoreButton/>
            <div className="relative bg-transparent w-screen xl:h-25 lg:h-20 sm:h-15 h-10"/>
        </section>
    );
}

export default UpComing;