import IntegratedMap from "../../components/display/IntegratedMap.jsx";

const Label = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full z-20
        pt-5 sm:pt-7 lg:pt-10 xl:pt-15">
            <div className="text-white font-bold font-['Unbounded']
            xl:text-5xl lg:text-4xl md:text-2xl text-sm">
                LUMIERE NEAR YOU
            </div>
        </div>
    );
}

const Maps = () => {
    return (
        <section className="relative z-19 w-screen flex flex-col items-center justify-center bg-slate-950 overflow-y-visible no-scrollbar">
            <Label/>
            <div className="w-full xl:h-10 lg:h-5 h-3"/>
            <IntegratedMap/>
            <div className="w-full xl:h-15 lg:h-10 md:h-5 h-1"/>
            <div className="absolute mix-blend-lighten bg-pink-400/60 rounded-full blur-[100px] bottom-0
            xl:left-20 left-0
            xl:w-44 lg:w-35 h-30
            xl:h-44 lg:h-35 w-30"/>
            <div className="absolute rotate-[150deg] mix-blend-lighten bg-sky-400/60 blur-[100px] z-10 bottom-0
            xl:right-[-150px] lg:right-[-100px] md:right-[-70px] right-0
            xl:w-[315px] lg:w-[200px] md:w-[150px] w-[100px]
            xl:h-[488px] lg:h-[400px] md:h-[300px] h-[200px]" />
        </section>
    );
}

export default Maps;