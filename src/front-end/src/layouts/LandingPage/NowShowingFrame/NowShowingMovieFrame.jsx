import Sample1 from '../../../assets/sample/ThamTuKien.jpg';
import Sample2 from '../../../assets/sample/Divided.png';
import MovieCard from '../../../components/UI/MovieCard.jsx';
import BackwardButton from '../../../components/buttons/backwardButton.jsx';
import ForwardButton from '../../../components/buttons/forwardButton.jsx';

const NowShowingFrame = () => {
    return (
        <div className="relative w-screen bg-transparent">
            <BackwardButton />
            <ForwardButton />
            {/*Left*/}
            <div className="absolute bottom-0 left-0 z-15 h-45 w-15 bg-gradient-to-r from-black to-transparent sm:w-25 md:h-87 lg:h-93.5 lg:w-40 xl:h-96 xl:w-50" />
            {/*Right*/}
            <div className="absolute right-0 bottom-0 z-15 h-45 w-15 bg-gradient-to-l from-black to-transparent sm:w-25 md:h-87 lg:h-93.5 lg:w-40 xl:h-96 xl:w-50" />
            <div className="w-sceen h:pt-8 relative h-2 md:h-4 lg:h-6" />
            <div className="w-screem no-scrollbar relative flex h-full justify-center gap-2 overflow-x-auto bg-transparent md:gap-4 lg:gap-6 xl:gap-10">
                <MovieCard linkImg={Sample1} page="Home" />
                <MovieCard linkImg={Sample1} page="Home" />
                <MovieCard linkImg={Sample1} page="Home" />
                <MovieCard linkImg={Sample2} page="Home" />
                <MovieCard linkImg={Sample2} page="Home" />
                <MovieCard linkImg={Sample1} page="Home" />
            </div>
        </div>
    );
};

export default NowShowingFrame;
