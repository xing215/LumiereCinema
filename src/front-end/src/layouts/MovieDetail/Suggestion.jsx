import Sample1 from '@assets/sample/ThamTuKien.jpg';
import Sample2 from '@assets/sample/Divided.png';

import MovieCard from '@components/UI/MovieCard.jsx';

const SuggestionFame = () => {
    return (
        <div className="grid h-120 w-full grid-cols-2 gap-3 py-3 sm:h-50 sm:grid-cols-4 md:h-80 md:gap-5 md:py-4 lg:h-120 lg:gap-7.5 lg:py-6">
            <MovieCard key="movie-1" linkImg={Sample1} />
            <MovieCard key="movie-2" linkImg={Sample2} />
            <MovieCard key="movie-3" linkImg={Sample1} />
            <MovieCard key="movie-4" linkImg={Sample2} />
        </div>
    );
};
const Suggestion = () => {
    return (
        <div className="relative flex w-full flex-col items-center py-6 sm:py-10 md:py-14 lg:py-16">
            <p className="font-unbounded text-lg font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">YOU MIGHT LIKE THIS</p>
            <SuggestionFame />
        </div>
    );
};

export default Suggestion;
