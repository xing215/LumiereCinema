import React, { useState, useRef, useEffect } from 'react'
import ticketImg from '@assets/img/cineticket.png';
import { useNavigate } from 'react-router-dom';
import { getMovieDetailsPath, getBuyTicketPath } from '@routes/routeConfig';
import fallbackImg from '@assets/img/PosterNotFound.png';
import WishlistButton from '@components/buttons/wishlistButton.jsx';
function BuyTicketButton({ movieId, branchId= undefined }) {
    const navigate = useNavigate();
    return (
        <button
            className="absolute left-1/2 bottom-12 lg:bottom-20 -translate-x-1/2
                z-30 pointer-events-auto
                w-[calc(100%-1rem)] h-9
                sm:w-[calc(100%-1rem)] sm:h-10
                md:w-[calc(100%-1.5rem)] md:h-11
                lg:w-[calc(100%-2rem)] lg:h-12
                xl:w-[calc(100%-2.5rem)] xl:h-14
                bg-zinc-300/30 rounded-xl flex items-center justify-center transition-all duration-200 overflow-visible relative
                hover:cursor-pointer hover:bg-zinc-300/50"
            onClick={() => navigate(getBuyTicketPath(movieId, branchId))}
        >
            <span className="text-white font-unbounded font-bold text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg tracking-widest">BUY<br/>TICKET</span>
            <img
                className="pointer-events-none absolute right-0 -ml-25 top-1/2 -translate-y-[60%] opacity-100 mix-blend-normal w-1/3 h-auto origin-center rotate-[-56.11deg] z-10 scale-100 hover:scale-110 transition-transform duration-200"
                src={ticketImg}
                alt="Cinema Ticket"
            />
        </button>
    );
}


const MovieCard = ({ movie, page, selectedBranch = undefined }) => {
    if (!movie || !movie._id) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <span className="text-white">Movie data not available</span>
            </div>
        );
    }
    const [showOverlay, setShowOverlay] = useState(false);
    const [, forceUpdate] = useState(0); // for global overlay state
    const cardRef = useRef(null);
    const descRef = useRef(null);
    const titleRef = useRef(null);
    const metaRef = useRef(null);
    const buttonRef = useRef(null);
    const [descLimit, setDescLimit] = useState(200);
    const [descMaxHeight, setDescMaxHeight] = useState();
    // Responsive description truncation and height based on actual measured heights
    useEffect(() => {
        if (!descRef.current || !cardRef.current || !titleRef.current || !metaRef.current) return;
        const cardHeight = cardRef.current.offsetHeight;
        const titleHeight = titleRef.current.offsetHeight;
        const metaHeight = metaRef.current.offsetHeight;
        let buttonHeight = 0;
        if (showOverlay && buttonRef.current) {
            buttonHeight = buttonRef.current.offsetHeight + 32; // 32px for margin
        }
        // Padding and margin fudge factor (p-2, mt-2, etc)
        const fudge = 50;
        const maxH = cardHeight - titleHeight - metaHeight - buttonHeight - fudge;
        setDescMaxHeight(maxH > 40 ? maxH : 40);
        if (!movie?.description) return;
        let min = 20, max = movie.description.length, best = 20;
        const descDiv = descRef.current;
        const original = descDiv.innerText;
        const test = (len) => {
            descDiv.innerText = movie.description.slice(0, len).replace(/\s+\S*$/, '') + (len < movie.description.length ? '...' : '');
            return descDiv.scrollHeight <= maxH;
        };
        while (min <= max) {
            const mid = Math.floor((min + max) / 2);
            if (test(mid)) {
                best = mid;
                min = mid + 1;
            } else {
                max = mid - 1;
            }
        }
        descDiv.innerText = original;
        setDescLimit(best);
    }, [movie?.description, showOverlay]);

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
        <>
            <div
                ref={cardRef}
                className={`relative group h-full aspect-[300/470] justify-start overflow-hidden bg-transparent shadow-lg ${page === 'Home' ? 'min-w-1/3 lg:min-w-1/4 xl:min-w-1/6' : 'h-full w-full'}`}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
                onTouchStart={() => setShowOverlay(true)}
            >
                <div className="relative h-full w-full overflow-hidden rounded-sm md:rounded-lg lg:rounded-xl xl:rounded-2xl flex flex-col">
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
                            ref={titleRef}
                            className="cursor-pointer hover:underline hover:text-yellow-300 transition-colors duration-150"
                            onClick={() => {
                                if (movie?._id) {
                                    const url = getMovieDetailsPath(movie._id, selectedBranch?._id);
                                    window.location.replace(url);
                                }
                            }}
                        >
                            {movie?.title || 'An error occured'}
                        </span>
                        <div ref={metaRef} className="mt-1 flex flex-row items-center justify-between w-full">
                            <span className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-black font-unbounded">
                                {movie?.releaseDate ? (() => {
                                    const d = new Date(movie.releaseDate);
                                    if (isNaN(d)) return '';
                                    const day = d.getDate().toString().padStart(2, '0');
                                    const month = (d.getMonth() + 1).toString().padStart(2, '0');
                                    return `${day}/${month}`;
                                })() : ''}
                            </span>
                            <WishlistButton movie={movie} />
                        </div>
                        {/* Description div below release date & wishlist, flexible height */}
                        {movie?.description && (
                            <div
                                ref={descRef}
                                className="mt-2 overflow-auto text-white text-xs sm:text-sm md:text-base font-normal font-sans leading-snug pr-1"
                                style={{
                                    minHeight: '2.5rem',
                                    maxHeight: descMaxHeight ? descMaxHeight + 'px' : undefined
                                }}
                            >
                                {movie.description.length > descLimit
                                    ? movie.description.slice(0, descLimit).replace(/\s+\S*$/, '') + '...'
                                    : movie.description}
                            </div>
                        )}
                    </div>
                </div>
                { showOverlay && Array.isArray(movie.branches) && movie.branches.length > 0 && (
                    <div ref={buttonRef}>
                        <BuyTicketButton movieId={movie?._id} branchId={selectedBranch?._id} />
                    </div>
                ) }
            </div>
        </>
    );
};

export default MovieCard;
