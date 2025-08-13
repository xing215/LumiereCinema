import IntegratedMap from '@components/display/IntegratedMap.jsx';
import { useNavigate } from 'react-router-dom';
import { getMovieListPath } from '@/routes/routeConfig';

const Label = () => {
    return (
        <div className="relative z-20 flex w-full flex-col items-center justify-center pt-5 sm:pt-7 lg:pt-10 xl:pt-15">
            <div className="font-['Unbounded'] text-sm font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">LUMIERE NEAR YOU</div>
        </div>
    );
};

const Maps = ({ cinemas }) => {
    const navigate = useNavigate();
    return (
        <section className="no-scrollbar relative z-19 flex w-screen flex-col items-center justify-center overflow-y-visible">
            <Label />
            <div className="h-3 w-full lg:h-5 xl:h-10" />
            <div className="h-auto w-auto">
                <IntegratedMap
                    cinemas={cinemas}
                    onClick={(cinema) => {
                        navigate(getMovieListPath(undefined, cinema._id));
                    }}
                    requireCtrlToZoom={true}
                />
            </div>
            <div className="h-1 w-full md:h-5 lg:h-10 xl:h-15" />
            <div className="absolute bottom-0 left-0 h-30 w-30 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] lg:h-35 lg:w-35 xl:left-20 xl:h-44 xl:w-44" />
            <div className="absolute right-0 bottom-0 z-10 h-[200px] w-[100px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] md:right-[-70px] md:h-[300px] md:w-[150px] lg:right-[-100px] lg:h-[400px] lg:w-[200px] xl:right-[-150px] xl:h-[488px] xl:w-[315px]" />
        </section>
    );
};

export default Maps;
