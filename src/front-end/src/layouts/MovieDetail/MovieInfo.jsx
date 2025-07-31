import BuyATicketButton from '@components/buttons/buyATicketButton.jsx';
import Rating from '@components/display/Rating.jsx';
import WishlistButton from '@components/buttons/wishlistButton.jsx';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@routes/routeConfig';
import { useEffect, useState } from 'react';
import { useGetMovieDetail } from '@hooks/useMovie';
import PosterFallback from '@assets/img/PosterNotFound.png';
import BPoster from '@components/UI/BPoster';
import { TrailerVideo } from '@layouts/MovieDetail/TrailerVideo.jsx';

const Description = ({ scripts }) => {
    return (
        <div className="relative flex flex-col items-center">
            <p className="font-unbounded justify-start text-center text-lg font-medium text-white sm:text-2xl md:text-3xl lg:text-4xl">DESCRIPTION</p>
            <p className="font-libre-franklin py-1 text-start text-xs font-normal text-white sm:text-lg md:py-2 md:text-xl lg:py-3 lg:text-2xl">{scripts}</p>
        </div>
    );
};
const MovieInfo = ({ movieId, branchId }) => {
    const navigate = useNavigate();
    const { getMovieDetail, movieDetail, loading, error } = useGetMovieDetail();
    
    useEffect(() => {
        if (!movieId) {
            navigate(ROUTES.NOT_FOUND, { replace: true });
            return;
        }
        getMovieDetail(movieId);
        // eslint-disable-next-line
    }, [movieId]);

    if (!movieId) return null;

    // Poster fallback logic
    const [posterSrc, setPosterSrc] = useState(movieDetail?.posterURL || PosterFallback);
    useEffect(() => {
        setPosterSrc(movieDetail?.posterURL || PosterFallback);
    }, [movieDetail]);


    // Redirect to 404 if error fetching movie
    useEffect(() => {
        if (error) {
            navigate(ROUTES.NOT_FOUND, { replace: true });
        }
    }, [error, navigate]);
    console.log('MovieInfo', movieDetail);
    return (
        <>
            <TrailerVideo videoYouTube={movieDetail?.trailerURL} />
            <div className="relative z-20 flex w-full flex-col bg-slate-950">
                <div className="relative flex w-full flex-row gap-5 md:gap-12 items-center">
                    {/* Poster */}
                    <div className="flex flex-shrink-0 items-end justify-center h-60 w-40 md:h-90 md:w-56 lg:h-95 lg:w-64 xl:h-105 xl:w-72">
                        <BPoster Pics={posterSrc} className="rounded-xl" />
                    </div>
                    {/* Info */}
                    <div className="font-unbounded flex flex-1 flex-col text-left text-white gap-2">
                        <p className="text-lg font-black leading-normal [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)] sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl">{movieDetail?.title || ''}</p>
                        <p className="text-[10px] font-black sm:text-[12px] md:text-sm xl:text-base">{
                            movieDetail?.releaseDate ? (() => {
                                const d = new Date(movieDetail.releaseDate);
                                if (isNaN(d)) return '';
                                const day = d.getDate().toString().padStart(2, '0');
                                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                                return `${day}/${month}`;
                            })() : ''
                        }</p>
                        <p className="text-[10px] font-medium sm:text-[12px] md:text-sm xl:text-base">{movieDetail?.genre?.join(', ') || ''}</p>
                        <p className="text-[10px] font-medium sm:text-[12px] md:text-sm xl:text-base">{movieDetail?.duration ? `${movieDetail.duration}'` : ''}{movieDetail?.ageRating ? ` - ${movieDetail.ageRating}` : ""}</p>
                        <div className="w-full md:h-2 xl:h-4" />
                        <Rating rated={movieDetail?.ratingsAverage || 0} userCount={movieDetail?.ratingsQuantity || 0} movieId={movieId} />
                        <div className="h-2 w-full" />
                        <div className="flex gap-2 md:gap-4 lg:gap-6 xl:gap-8">
                            {Array.isArray(movieDetail?.branches) && movieDetail.branches.length > 0 && (
                                <BuyATicketButton movieId={movieId} branchId={branchId} />
                            )}
                            <WishlistButton movie={movieDetail}/>
                        </div>
                    </div>
                </div>
                <div className="h-3 w-full md:h-5 lg:h-10" />
                {movieDetail?.description && movieDetail.description.trim() !== '' && (
                    <Description scripts={movieDetail.description} />
                )}
            </div>
        </>
    );
};

export default MovieInfo;
