import MapView from "../../assets/sample/Maps.png";
import LocationTable from "./LocationTable.jsx";

const IntegratedMap = () => {
    return (
        <div className="relative flex lg:block w-screen justify-center lg:gap-0 gap-3 z-20">
            <div className="lg:absolute relative z-20
            lg:w-auto w-[35%]
            lg:h-full md:h-80 sm:h-75 h-70
            xl:left-63 lg:left-28">
                <LocationTable/>
            </div>

            <div className="relative lg:rounded-2xl rounded-xl overflow-auto no-scrollbar
            xl:w-[75%] lg:w-[85%] md:w-[60%] w-[55%]
            xl:h-180 lg:h-140 md:h-80 sm:h-75 h-70
            lg:left-1/2 lg:transform lg:-translate-x-1/2">
                <img src={MapView} alt="MapView" className="absolute sm:w-[3200px] sm:h-[800px]
                h-[350px] object-cover top-0"/>
            </div>
        </div>
    );
}

export default IntegratedMap;