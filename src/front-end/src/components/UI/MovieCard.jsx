import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ticketImg from '@assets/img/cineticket.png';
import { useNavigate } from 'react-router-dom';
import { getMovieDetailsPath, getBuyTicketPath } from '@routes/routeConfig';
function BuyTicketButton({ movieId, branchId= undefined }) {
    const navigate = useNavigate();
    return (
        <button
            className="absolute left-1/2 bottom-20 -translate-x-1/2
                z-30 pointer-events-auto
                w-[calc(100%-1rem)] h-9
                sm:w-[calc(100%-1rem)] sm:h-10
                md:w-[calc(100%-1.5rem)] md:h-11
                lg:w-[calc(100%-2rem)] lg:h-12
                xl:w-[calc(100%-2.5rem)] xl:h-14
                mix-blend-color-dodge bg-zinc-300/30 rounded-xl flex items-center justify-center transition-all duration-200 overflow-visible relative"
            onClick={() => navigate(getBuyTicketPath(movieId, branchId))}
        >
            <span className="text-white font-unbounded font-bold text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg tracking-widest">BUY<br/>TICKET</span>
            <img
                className="pointer-events-none absolute right-0 -ml-25 top-1/2 -translate-y-[60%] opacity-100 w-1/3 h-auto origin-center rotate-[-56.11deg] z-10 scale-100 hover:scale-110 transition-transform duration-200"
                src={ticketImg}
                alt="Cinema Ticket"
            />
        </button>
    );
}
import { Heart } from 'lucide-react';
import fallbackImg from '@assets/img/PosterNotFound.png';

const MovieCard = ({ movie, page, selectedBranch = undefined }) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [, forceUpdate] = useState(0); // for global overlay state
    const cardRef = useRef(null);
    const cardId = useRef(uuidv4());
    const navigate = useNavigate();

    useEffect(() => {
        const handleTouch = (e) => {
            // Only handle touch if overlay is open
            if (!showOverlay) return;
            // If touch is outside the card, close overlay immediately
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                setShowOverlay(false);
                forceUpdate(n => n + 1);
            }
        };
        document.addEventListener('touchstart', handleTouch, { passive: true });
        return () => document.removeEventListener('touchstart', handleTouch);
    }, [showOverlay]);
    
    const linkImg = movie?.posterURL || fallbackImg;
    return (
        <div
            ref={cardRef}
            className={`relative group h-full aspect-[300/470] justify-start overflow-hidden bg-transparent shadow-lg ${page === 'Home' ? 'min-w-1/3 lg:min-w-1/4 xl:min-w-1/6' : 'h-full w-full'}`}
            onMouseEnter={() => setShowOverlay(true)}
            onMouseLeave={() => setShowOverlay(false)}
            onTouchStart={() => setShowOverlay(true)}
        >
            <div className="relative h-full w-full overflow-hidden rounded-sm md:rounded-lg lg:rounded-xl xl:rounded-2xl">
                <img
                    src={linkImg}
                    alt={movie?.title || 'Movie'}
                    className={
                        [
                            'h-full w-full rounded-sm object-cover md:rounded-lg lg:rounded-xl xl:rounded-2xl text-white transition-all duration-200',
                            (showOverlay ? 'blur-sm' : ''),
                            (!showOverlay ? 'group-hover:blur-sm' : '')
                        ].join(' ')
                    }
                    onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
                />
                {(showOverlay || undefined) && (
                    <div
                        className={[ 
                            'absolute inset-0 z-10 opacity-100',
                            'transition-opacity duration-200 pointer-events-none',
                            'rounded-sm', 'md:rounded-lg', 'lg:rounded-xl', 'xl:rounded-2xl',
                            'bg-black/60'
                        ].join(' ')}
                    ></div>
                )}
                {!showOverlay && (
                    <div
                        className={[ 
                            'absolute inset-0 z-10 opacity-0 group-hover:opacity-100',
                            'transition-opacity duration-200 pointer-events-none',
                            'rounded-sm', 'md:rounded-lg', 'lg:rounded-xl', 'xl:rounded-2xl',
                            'bg-black/60'
                        ].join(' ')}
                    ></div>
                )}
                <div
                    className={`w-[calc(100%-1rem)] left-2 top-5 absolute justify-start text-white text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-black font-unbounded [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] p-2 z-20 ${showOverlay ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}
                >
                    <span
                        className="cursor-pointer hover:underline hover:text-yellow-300 transition-colors duration-150"
                        onClick={() => {
                            if (movie?._id) navigate(getMovieDetailsPath(movie._id, selectedBranch?._id));
                        }}
                    >
                        {movie?.title || 'An error occured'}
                    </span>
                    <div className="mt-1 flex flex-row items-center justify-between w-full">
                        <span className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-black font-unbounded">
                            {movie?.releaseDate ? (() => {
                                const d = new Date(movie.releaseDate);
                                if (isNaN(d)) return '';
                                const day = d.getDate().toString().padStart(2, '0');
                                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                                return `${day}/${month}`;
                            })() : ''}
                        </span>
                        <Heart 
                            size={24} 
                            strokeWidth={2.2} 
                            className="ml-2 text-white stroke-white fill-transparent w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" 
                        />
                    </div>
                </div>
            </div>
            { showOverlay && <BuyTicketButton movieId={movie?._id} branchId={selectedBranch?._id} /> }
        </div>
    );
};

export default MovieCard;
