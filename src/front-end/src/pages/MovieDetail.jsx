import Header from "../layouts/LandingPage/Header.jsx";
import Footer from "../layouts/LandingPage/Footer.jsx";
import {TrailerVideo} from "../layouts/MovieDetail/TrailerVideo.jsx";
import MovieInfo from "../layouts/MovieDetail/MovieInfo.jsx";
import Suggestion from "../layouts/MovieDetail/Suggestion.jsx";

const MainBody = () => {
    return (
        <div className="relative w-[80%] flex flex-col justify-center items-center bg-slate-950">
            <TrailerVideo/>
            <MovieInfo/>
            <div className="w-full lg:h-10"/>
            <Suggestion/>
            <div className="absolute rotate-[150deg] mix-blend-lighten bg-sky-400/60 blur-[100px] z-20
            top-1/2 transform -translate-y-1/2
            xl:right-[-300px] lg:right-[-200px] md:right-[-140px] right-[-50px]
            xl:w-[315px] lg:w-[200px] md:w-[150px] w-[100px]
            xl:h-[488px] lg:h-[400px] md:h-[300px] h-[200px]" />
        </div>
    )
}
const MovieDetail = () => {
    return (
        <div className="w-screen flex flex-col justify-center items-center bg-slate-950 overflow-x-hidden">
            <Header/>
            <MainBody/>
            <Footer/>
        </div>
    );
}

export default MovieDetail;