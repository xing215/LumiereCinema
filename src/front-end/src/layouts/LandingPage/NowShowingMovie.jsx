import NowShowingMovieFrame from "./NowShowingFrame/NowShowingMovieFrame.jsx";

const Label = () => {
    return (
        <div className="absolute top-25 w-screen left-1/2 transform -translate-x-1/2">
            <div className="text-center text-white justify-start font-['Unbounded'] font-bold text-7xl">
                NOW SHOWING
            </div>
        </div>
    );
}
const NowShowing = () => {
    return (
        <div className="relative bg-slate-950 w-screen h-330">
            <Label/>
            <NowShowingMovieFrame/>
        </div>
    );
}

export default NowShowing;