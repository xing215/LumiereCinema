import trailerVideo from '@assets/sample/Video/TrailerVideo.mp4';
export const TrailerVideo = () => {
    return (
        <div className="relative z-15 flex w-full items-center justify-center">
            <div className="relative w-full">
                <video
                    src={trailerVideo}
                    autoPlay
                    // muted
                    loop
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="absolute left-0 h-full w-[5%] bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="absolute right-0 h-full w-[5%] bg-gradient-to-l from-slate-950 to-transparent" />
            <div className="absolute bottom-0 h-[10%] w-full bg-gradient-to-t from-slate-950 to-transparent blur-xs" />
        </div>
    );
};
