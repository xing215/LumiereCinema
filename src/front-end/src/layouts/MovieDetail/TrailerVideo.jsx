function extractYouTubeID(url) {
    if (!url) return '';
    // Match standard and short YouTube URLs
    const regExp = /(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regExp);
    if (match && match[1]) return match[1];
    // If only the ID is provided
    if (/^[\w-]{11}$/.test(url)) return url;
    return '';
}

import React, { useRef, useState } from "react";

export const TrailerVideo = ({ videoYouTube }) => {
    const videoId = extractYouTubeID(videoYouTube);
    const [videoError, setVideoError] = useState(false);
    const iframeRef = useRef(null);

    // YouTube iframe API does not allow direct access to the content for CORS reasons,
    // so we use onError and a timeout fallback for blank/invalid videoId
    const handleIframeError = () => {
        setVideoError(true);
    };

    // Fallback: if videoId is empty or invalid, hide
    React.useEffect(() => {
        if (!videoId) setVideoError(true)
        else setVideoError(false);
    }, [videoId]);

    if (videoError) return (
        <div className="h-20 lg:h-30 w-full" />
    );

    return (
        <div className="relative z-15 flex w-full items-center justify-center">
            <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                    ref={iframeRef}
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&controls=0&iv_load_policy=3&loop=1`}
                    title="Trailer Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={handleIframeError}
                ></iframe>
            </div>
            <div className="absolute left-0 h-full w-[5%] bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 h-full w-[5%] bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 h-[50%] w-full bg-gradient-to-t from-slate-950 to-transparent blur-xs pointer-events-none" />
        </div>
    );
};
