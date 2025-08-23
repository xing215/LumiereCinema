import React, { useState, useRef, useEffect } from 'react';
import ticketImg from '@assets/img/cineticket.png';
import { useNavigate } from 'react-router-dom';
import { getMovieDetailsPath, getBuyTicketPath } from '@routes/routeConfig';
import fallbackImg from '@assets/img/PosterNotFound.png';
import WishlistButton from '@components/buttons/wishlistButton.jsx';
function BuyTicketButton({ movieId, branchId = undefined }) {
    const navigate = useNavigate();
    return (
        <button
            className="pointer-events-auto absolute relative bottom-12 left-1/2 z-30 flex h-9 w-[calc(100%-1rem)] -translate-x-1/2 items-center justify-center overflow-visible rounded-xl bg-zinc-300/30 transition-all duration-200 hover:cursor-pointer hover:bg-zinc-300/50 sm:h-10 sm:w-[calc(100%-1rem)] md:h-11 md:w-[calc(100%-1.5rem)] lg:bottom-20 lg:h-12 lg:w-[calc(100%-2rem)] xl:h-14 xl:w-[calc(100%-2.5rem)]"
            onClick={() => navigate(getBuyTicketPath(movieId, branchId))}
        >
            <span className="font-unbounded text-[11px] font-bold tracking-widest text-white sm:text-xs md:text-sm lg:text-base xl:text-lg">
                BUY
                <br />
                TICKET
            </span>
            <img
                className="pointer-events-none absolute top-1/2 right-0 z-10 -ml-25 h-auto w-1/3 origin-center -translate-y-[60%] scale-100 rotate-[-56.11deg] opacity-100 mix-blend-normal transition-transform duration-200 hover:scale-110"
                src={ticketImg}
                alt="Cinema Ticket"
            />
        </button>
    );
}

const MovieCard = ({ movie, page, selectedBranch = undefined }) => {
    if (!movie || !movie._id) {
        return (
            <div className="flex h-full w-full items-center justify-center">
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
        let min = 20,
            max = movie.description.length,
            best = 20;
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
                forceUpdate((n) => n + 1);
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
                className={`group relative aspect-[300/470] h-full justify-start overflow-hidden bg-transparent shadow-lg ${
                    page === 'Home' 
                        ? 'min-w-[85px] sm:min-w-[100px] md:min-w-1/3 lg:min-w-1/4 xl:min-w-1/6' 
                        : 'h-full w-full'
                }`}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
                onTouchStart={() => setShowOverlay(true)}
            >
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg md:rounded-lg lg:rounded-xl xl:rounded-2xl">
                    <img
                        src={linkImg}
                        alt={movie?.title || 'Movie'}
                        className={[
                            'h-full w-full rounded-lg object-cover text-white transition-all duration-200 md:rounded-lg lg:rounded-xl xl:rounded-2xl',
                            showOverlay ? 'blur-sm' : '',
                            !showOverlay ? 'group-hover:blur-sm' : '',
                        ].join(' ')}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImg;
                        }}
                    />
                    {(showOverlay || undefined) && (
                        <div
                            className={[
                                'absolute inset-0 z-10 opacity-100',
                                'pointer-events-none transition-opacity duration-200',
                                'rounded-lg',
                                'md:rounded-lg',
                                'lg:rounded-xl',
                                'xl:rounded-2xl',
                                'bg-black/60',
                            ].join(' ')}
                        ></div>
                    )}
                    {!showOverlay && (
                        <div
                            className={[
                                'absolute inset-0 z-10 opacity-0 group-hover:opacity-100',
                                'pointer-events-none transition-opacity duration-200',
                                'rounded-lg',
                                'md:rounded-lg',
                                'lg:rounded-xl',
                                'xl:rounded-2xl',
                                'bg-black/60',
                            ].join(' ')}
                        ></div>
                    )}
                    <div
                        className={`font-unbounded absolute top-5 left-2 z-20 w-[calc(100%-1rem)] justify-start p-2 text-[11px] font-black text-white [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] sm:text-xs md:text-sm lg:text-base xl:text-lg ${showOverlay ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}
                    >
                        <span
                            ref={titleRef}
                            className="cursor-pointer transition-colors duration-150 hover:text-yellow-300 hover:underline"
                            onClick={() => {
                                if (movie?._id) {
                                    const url = getMovieDetailsPath(movie._id, selectedBranch?._id);
                                    window.location.replace(url);
                                }
                            }}
                        >
                            {movie?.title || 'An error occured'}
                        </span>
                        <div ref={metaRef} className="mt-1 flex w-full flex-row items-center justify-between">
                            <span className="font-unbounded text-[10px] font-black text-white sm:text-xs md:text-sm lg:text-base xl:text-lg">
                                {movie?.releaseDate
                                    ? (() => {
                                          const d = new Date(movie.releaseDate);
                                          if (isNaN(d)) return '';
                                          const day = d.getDate().toString().padStart(2, '0');
                                          const month = (d.getMonth() + 1).toString().padStart(2, '0');
                                          return `${day}/${month}`;
                                      })()
                                    : ''}
                            </span>
                            <WishlistButton movie={movie} />
                        </div>
                        {/* Description div below release date & wishlist, flexible height */}
                        {movie?.description && (
                            <div
                                ref={descRef}
                                className="mt-2 overflow-auto pr-1 font-sans text-xs leading-snug font-normal text-white sm:text-sm md:text-base"
                                style={{
                                    minHeight: '2.5rem',
                                    maxHeight: descMaxHeight ? descMaxHeight + 'px' : undefined,
                                }}
                            >
                                {movie.description.length > descLimit ? movie.description.slice(0, descLimit).replace(/\s+\S*$/, '') + '...' : movie.description}
                            </div>
                        )}
                    </div>
                </div>
                {showOverlay && Array.isArray(movie.branches) && movie.branches.length > 0 && (
                    <div ref={buttonRef}>
                        <BuyTicketButton movieId={movie?._id} branchId={selectedBranch?._id} />
                    </div>
                )}
            </div>
        </>
    );
};

export default MovieCard;
