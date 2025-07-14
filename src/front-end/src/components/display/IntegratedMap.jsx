import MapView from '../../assets/sample/Maps.png';
import LocationTable from './LocationTable.jsx';

const IntegratedMap = () => {
    return (
        <div className="relative z-20 flex w-screen justify-center gap-3 lg:block lg:gap-0">
            <div className="relative z-20 h-70 w-[35%] sm:h-75 md:h-80 lg:absolute lg:left-28 lg:h-full lg:w-auto xl:left-53">
                <LocationTable />
            </div>

            <div className="no-scrollbar relative h-70 w-[55%] overflow-auto rounded-xl sm:h-75 md:h-80 md:w-[60%] lg:left-1/2 lg:h-140 lg:w-[85%] lg:-translate-x-1/2 lg:transform lg:rounded-2xl xl:h-180 xl:w-[75%]">
                <img src={MapView} alt="MapView" className="absolute top-0 h-[350px] object-cover sm:h-[800px] sm:w-[3200px]" />
            </div>
        </div>
    );
};

export default IntegratedMap;
