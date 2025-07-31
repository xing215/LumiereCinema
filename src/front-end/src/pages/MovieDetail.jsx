import Header from '@layouts/LandingPage/Header.jsx';
import Footer from '@layouts/LandingPage/Footer.jsx';
import { TrailerVideo } from '@layouts/MovieDetail/TrailerVideo.jsx';
import MovieInfo from '@layouts/MovieDetail/MovieInfo.jsx';
import Suggestion from '@layouts/MovieDetail/Suggestion.jsx';
import { useParams, useSearchParams } from 'react-router-dom';

const MainBody = () => {
    // Extract movie ID from URL parameters
    const [searchParams] = useSearchParams();
    const movieId = searchParams.get("movieId");
    const branchId = searchParams.get("branchId");
    return (
        <div className="relative flex w-[80%] flex-col items-center justify-center bg-slate-950">
            <TrailerVideo movieId={movieId} />
            <MovieInfo movieId={movieId} branchId={branchId} />
            <div className="w-full lg:h-10" />
            <Suggestion currentMovieId={movieId} />
            <div className="absolute top-1/2 right-[-50px] z-20 h-[200px] w-[100px] -translate-y-1/2 rotate-[150deg] transform bg-sky-400/60 mix-blend-lighten blur-[100px] md:right-[-140px] md:h-[300px] md:w-[150px] lg:right-[-200px] lg:h-[400px] lg:w-[200px] xl:right-[-300px] xl:h-[488px] xl:w-[315px]" />
        </div>
    );
};
const MovieDetail = () => {
    return (
        <div className="flex w-screen flex-col items-center justify-center overflow-x-hidden bg-slate-950">
            <Header />
            <MainBody />
            <Footer />
        </div>
    );
};

export default MovieDetail;
