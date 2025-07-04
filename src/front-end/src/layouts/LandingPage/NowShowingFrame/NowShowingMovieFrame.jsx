import Sample1 from"../../../assets/sample/ThamTuKien.jpg";
import Sample2 from"../../../assets/sample/Divided.png";
import MovieFrame from "../../../components/MovieFrame.jsx";
import BackwardButton from "../../../components/buttons/backwardButton.jsx";
import ForwardButton from "../../../components/buttons/forwardButton.jsx";

const NowShowingFrame = () => {
    return (
        <div className="relative w-screen bg-transparent">
            <BackwardButton/>
            <ForwardButton/>
            {/*Left*/}
            <div className="absolute bottom-0 left-0 bg-gradient-to-r from-black to-transparent z-15
            xl:h-96 lg:h-93.5 md:h-87 h-45
            xl:w-50 lg:w-40 sm:w-25 w-15 " />
            {/*Right*/}
            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-black to-transparent z-15
            xl:h-96 lg:h-93.5 md:h-87 h-45
            xl:w-50 lg:w-40 sm:w-25 w-15 " />
            <div className="relative w-sceen h:pt-8 lg:h-6 md:h-4 h-2 "/>
            <div className="relative bg-transparent flex justify-center w-screem h-full overflow-x-auto no-scrollbar
            xl:gap-10 lg:gap-6 md:gap-4 gap-2">
                <MovieFrame linkImg={Sample1}/>
                <MovieFrame linkImg={Sample1}/>
                <MovieFrame linkImg={Sample1}/>
                <MovieFrame linkImg={Sample2}/>
                <MovieFrame linkImg={Sample2}/>
                <MovieFrame linkImg={Sample1}/>
            </div>
        </div>
    );
}

export default NowShowingFrame;