import ForwardButton from '@components/buttons/forwardButton.jsx';
import BackwardButton from '@components/buttons/backwardButton.jsx';
import Poster from '@components/UI/poster.jsx';
import Decoration from '@assets/img/Banner_Decoration.png';
import AiSearch from '@components/display/AiSearch.jsx';
import PicsLink from '@assets/sample/Poster.png';

const Decoration1 = () => {
    return (
        <img
            src={Decoration}
            alt="Decoration1"
            className="absolute top-3 right-[-50px] z-18 h-20 w-20 rotate-[-82.79deg] blur-[1.93px] sm:top-0 sm:right-[-75px] sm:h-30 sm:w-30 lg:right-[-130px] lg:h-50 lg:w-50 xl:right-[-190px] xl:h-72 xl:w-72"
        />
    );
};

const Decoration2 = () => {
    return (
        <img
            src={Decoration}
            alt="Decoration2"
            className="absolute bottom-[-50px] left-[-30px] z-20 h-20 w-20 rotate-[168.61deg] blur-[1.65px] md:bottom-[-95px] md:left-[-70px] md:h-40 md:w-40 lg:bottom-[-150px] lg:left-[-120px] lg:h-60 lg:w-60 xl:bottom-[-180px] xl:h-70 xl:w-70"
        />
    );
};

const Label = () => {
    return (
        <div className="z relative top-0 left-1/2 w-screen -translate-x-1/2 transform justify-center">
            <div className="relative h-2 w-screen bg-transparent sm:h-4 md:h-5.5 lg:h-7" />
            <div className="z-20 flex justify-center pt-1.5 sm:pt-1">
                <div className="whitespace-wrap max-w-[80%] text-center font-['Unbounded'] text-sm font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">What would you like to watch?</div>
            </div>
        </div>
    );
};

const Banner = () => (
    <section className="no-scrollbar relative z-10 w-screen justify-center gap-8 bg-slate-950 lg:pt-3">
        <div className="relative w-screen">
            {/*Left*/}
            <div className="absolute top-0 left-0 z-15 h-full w-30 bg-gradient-to-r from-black via-slate-900/80 to-transparent sm:w-60 lg:w-95" />
            {/*Right*/}
            <div className="absolute top-0 right-0 z-15 h-full w-30 bg-gradient-to-l from-black via-slate-900/80 to-transparent sm:w-60 lg:w-95" />
            <Poster Pics={PicsLink} />
            <ForwardButton />
            <BackwardButton />
            {/*Bottom*/}
            <div className="absolute bottom-[-15px] left-0 z-20 h-9 w-screen bg-gradient-to-t from-black via-slate-950 to-transparent blur-xs sm:h-11 sm:blur-sm lg:h-12.5 xl:h-20 xl:blur-md" />
            <Decoration1 />
            <Decoration2 />
        </div>
        <Label />
        <AiSearch />
    </section>
);

export default Banner;
