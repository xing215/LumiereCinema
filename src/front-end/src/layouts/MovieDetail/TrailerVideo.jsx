import trailerVideo from "../../assets/sample/Video/TrailerVideo.mp4";
export const TrailerVideo = () => {
    return (
        <div className="relative w-full flex justify-center items-center z-15">
            <div className="relative w-full">
                <video
                    src={trailerVideo}
                    autoPlay
                    // muted
                    loop
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="absolute left-0 h-full w-[5%] bg-gradient-to-r from-slate-950 to-transparent"/>
            <div className="absolute right-0 h-full w-[5%] bg-gradient-to-l from-slate-950 to-transparent"/>
            <div className="absolute bottom-0 w-full h-[10%] bg-gradient-to-t from-slate-950 to-transparent blur-xs"/>
        </div>
    );
}