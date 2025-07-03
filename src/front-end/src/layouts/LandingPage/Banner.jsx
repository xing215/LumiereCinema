import ForwardButton from "../../components/buttons/forwardButton.jsx";
import BackwardButton from "../../components/buttons/backwardButton.jsx";
import Poster from "../../components/UI/poster.jsx";
import Decoration from "../../assets/img/Banner_Decoration.png";
import AiSearch from "../../components/display/AiSearch.jsx";
import PicsLink from "../../assets/sample/Poster.png";

const Decoration1 = () => {
    return (
        <img src={Decoration} alt="Decoration1" className="absolute z-18 w-72 h-72 top-0 right-[-190px] rotate-[-82.79deg] blur-[1.93px]" />
    );
}

const Decoration2 = () => {
    return (
        <img src={Decoration} alt="Decoration2" className="absolute z-50 w-64 h-64 top-270 left-[-180px] rotate-[168.61deg] blur-[1.65px]" />
    );
}

const Label = () => {
    return (
        <div className="absolute flex justify-center bottom-0 w-screen left-1/2 transform -translate-x-1/2">
            <div className="text-center text-white justify-center font-['Unbounded'] font-bold text-7xl sm:text-4xl whitespace-nowrap inline-block w-fit">
                What would you like to watch?
            </div>
        </div>
    );
}

const Banner = () => (
    <div className="relative pt-12 z-10 min-h-screen gap-8 w-screen overflow-x-hidden justify-center bg-slate-950">
        {/*Left*/}
        <div className="absolute top-0 left-0 h-screen w-150 bg-gradient-to-r from-black to-transparent z-15" />
        {/*Right*/}
        <div className="absolute top-0 right-0 h-screen w-150 bg-gradient-to-l from-black to-transparent z-15" />
        {/*Bottom*/}
        <div className="absolute top-125 left-0 w-screen h-35 bg-gradient-to-t from-black via-slate-950 to-transparent blur-sm z-20" />
        <ForwardButton />
        <BackwardButton />
        <Poster Pics={PicsLink} />
        <Label/>
        <AiSearch />
        <Decoration1 />
        <Decoration2 />
    </div>
);

export default Banner;