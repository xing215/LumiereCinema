import Sample1 from "../../assets/sample/ThamTuKien.jpg"
import Sample2 from "../../assets/sample/Divided.png"

import MovieCard from "../../components/UI/MovieCard.jsx";

const SuggestionFame = () => {
    return(
        <div className="w-full grid
        lg:h-120 md:h-80 sm:h-50 h-120
        sm:grid-cols-4
        grid-cols-2
        lg:gap-7.5 md:gap-5 gap-3
        lg:py-6 md:py-4 py-3">
            <MovieCard key="movie-1" linkImg={Sample1}/>
            <MovieCard key="movie-2" linkImg={Sample2}/>
            <MovieCard key="movie-3" linkImg={Sample1}/>
            <MovieCard key="movie-4" linkImg={Sample2}/>
        </div>
    )
}
const Suggestion = () => {
    return (
        <div className="relative flex flex-col w-full items-center
        lg:py-16 md:py-14 sm:py-10 py-6">
            <p className="font-unbounded text-white font-bold
            lg:text-4xl md:text-3xl sm:text-2xl text-lg">YOU MIGHT LIKE THIS</p>
            <SuggestionFame/>
        </div>
    )
}

export default Suggestion;