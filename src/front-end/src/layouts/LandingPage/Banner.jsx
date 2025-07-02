import ForwardButton from "../../components/buttons/forwardButton.jsx";
import BackwardButton from "../../components/buttons/backwardButton.jsx";
import Poster from "../../components/UI/poster.jsx";
import Decoration from "../../assets/img/Banner_Decoration.png";
import AiSearch from "../../components/display/AiSearch.jsx";
import PicsLink from "../../assets/sample/Poster.png";

const Decoration1 = () => {
    return (
        <img src={Decoration} alt="Decoration1" className="absolute sm:top-0 top-3 rotate-[-82.79deg] blur-[1.93px] z-18
        xl:w-72 lg:w-50 sm:w-30 w-20
        xl:h-72 lg:h-50 sm:h-30 h-20
        xl:right-[-190px] lg:right-[-130px] sm:right-[-75px] right-[-50px] " />
    );
}

const Decoration2 = () => {
    return (
        <img src={Decoration} alt="Decoration2" className="absolute z-20
        xl:w-70 lg:w-60 md:w-40 w-20
        xl:h-70 lg:h-60 md:h-40 h-20
        xl:bottom-[-180px] lg:bottom-[-150px] md:bottom-[-95px] bottom-[-50px]
        lg:left-[-120px] md:left-[-70px] left-[-30px]
        rotate-[168.61deg] blur-[1.65px]" />
    );
}

const Label = () => {
    return (
        <div className="relative justify-center top-0 w-screen left-1/2 transform -translate-x-1/2 z">
            <div className="relative w-screen lg:h-7 md:h-5.5 sm:h-4 h-2 bg-transparent"/>
            <div className="flex sm:pt-1 pt-1.5 justify-center z-20">
                <div className="text-white text-center font-['Unbounded'] font-bold whitespace-wrap max-w-[80%]
                xl:text-5xl lg:text-4xl md:text-2xl text-sm">
                    What would you like to watch?
                </div>
            </div>
        </div>
    );
}

const Banner = () => (
    <div className="relative lg:pt-3 z-10 gap-8 w-screen overflow-x-hidden justify-center bg-slate-950">
        <div className="relative w-screen">
            {/*Left*/}
            <div className="absolute top-0 left-0 h-full lg:w-95 sm:w-60 w-30 bg-gradient-to-r from-black via-slate-900/80 to-transparent z-15" />
            {/*Right*/}
            <div className="absolute top-0 right-0 h-full lg:w-95 sm:w-60 w-30 bg-gradient-to-l from-black via-slate-900/80 to-transparent z-15" />
            <Poster Pics={PicsLink} />
            <ForwardButton />
            <BackwardButton />
            {/*Bottom*/}
            <div className="absolute bottom-[-15px] left-0 w-screen xl:h-20 lg:h-12.5 sm:h-11 h-9 bg-gradient-to-t from-black via-slate-950 to-transparent xl:blur-md sm:blur-sm blur-xs z-20" />
            <Decoration1 />
            <Decoration2 />
        </div>
        <Label/>
        <AiSearch />
    </div>
);

export default Banner;