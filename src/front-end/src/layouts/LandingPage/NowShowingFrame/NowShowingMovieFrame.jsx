import Sample1 from"../../../assets/sample/ThamTuKien.jpg";
import Sample2 from"../../../assets/sample/Divided.png";
import MovieFrame from "../../../components/MovieFrame.jsx";
import BackwardButton from "../../../components/buttons/backwardButton.jsx";
import ForwardButton from "../../../components/buttons/forwardButton.jsx";

const NowShowingFrame = () => {
    return (
        <div className="absolute top-65 h-200 w-screen bg-transparent bg-opacity-80">
            <BackwardButton/>
            <ForwardButton/>
            {/*Left*/}
            <div className="absolute top-0 left-0 h-200 w-100 bg-gradient-to-r from-black to-transparent z-15" />
            {/*Right*/}
            <div className="absolute top-0 right-0 h-200 w-100 bg-gradient-to-l from-black to-transparent z-15" />

            <div className="relative flex justify-center gap-10 w-auto h-full overflow-x-auto no-scrollbar">
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