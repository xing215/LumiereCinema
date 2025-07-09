import Header from "../layouts/LandingPage/Header.jsx";
import Footer from "../layouts/LandingPage/Footer.jsx";
import MovieCard from "../components/UI/MovieCard.jsx";
import BranchFilterButton from "../components/buttons/branchFilterButton.jsx";
import MovieStatusFilterButton from "../components/buttons/movieStatusFilterButton.jsx";

import Sample1 from "../assets/sample/ThamTuKien.jpg";
import Sample2 from "../assets/sample/Divided.png";

const MovieCardContainer = () => {
    return (
        <div className="w-full pb-10 grid z-20
        xl:gap-8 lg:gap-6 md:gap-4 gap-3
        lg:grid-cols-4 lg:grid-rows-3
        md:grid-cols-3 md:grid-rows-4
        grid-cols-2 grid-rows-4">
            <MovieCard linkImg={Sample1} page="MovieList"/>
            <MovieCard linkImg={Sample2} page="MovieList"/>
            <MovieCard linkImg={Sample1} page="MovieList"/>
            <MovieCard linkImg={Sample2} page="MovieList"/>
            <MovieCard linkImg={Sample1} page="MovieList"/>
            <MovieCard linkImg={Sample2} page="MovieList"/>
            <MovieCard linkImg={Sample1} page="MovieList"/>
            <MovieCard linkImg={Sample2} page="MovieList"/>
            <MovieCard linkImg={Sample1} page="MovieList"/>
            <MovieCard linkImg={Sample2} page="MovieList"/>
            <MovieCard linkImg={Sample1} page="MovieList"/>
            <MovieCard linkImg={Sample2} page="MovieList"/>
        </div>
    );
}

const MainBody = () => {
    return (
        <div className="relative flex flex-col
        w-[75%]
        xl:pt-40 lg:pt-35 md:pt-30 pt-20">
            <div className="text-center justify-center text-white font-bold font-unbounded
            lg:text-5xl md:text-4xl text-3xl
            ">MOVIES</div>
            <div className="flex w-full xl:gap-4 lg:gap-3 md:gap-2 gap-1
            md:justify-start justify-between
            xl:py-10 lg:py-8 md:py-6 py-3">
                <BranchFilterButton/>
                <MovieStatusFilterButton/>
            </div>
            <MovieCardContainer/>
            <div className="w-full lg:h-25 md:h-20 sm:h-10 h-5"/>

            <div className="absolute rotate-[150deg] mix-blend-lighten bg-sky-400/60 blur-[100px] z-10
            xl:top-150 md:top-100 top-80
            xl:right-[-300px] lg:right-[-200px] md:right-[-140px] right-[-50px]
            xl:w-[315px] lg:w-[200px] md:w-[150px] w-[100px]
            xl:h-[488px] lg:h-[400px] md:h-[300px] h-[200px]" />

            <div className="absolute mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]
            left-1/2 transform -translate-x-1/2 bottom-0
            w-44
            h-44" />
        </div>
    );
}
const MovieListPage = () => {
    return (
        <div className="w-screen flex flex-col items-center overflow-x-hidden no-scrollbar bg-slate-950
        ">
            <Header/>
            <MainBody/>
            <Footer/>
        </div>
    );
}

export default MovieListPage;