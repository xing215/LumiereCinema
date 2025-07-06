import backward from "../../assets/img/backward2.svg"

const backwardButton = ({ onClick, position = "absolute" }) => {
    const positionClass = position === "absolute" 
        ? "absolute z-50 xl:left-8 lg:left-6 sm:left-3 left-0 top-1/2 -translate-y-1/2" 
        : "relative z-50";
    
    return (
        <button 
            onClick={onClick}
            className={`${positionClass}
        xl:w-[60px] lg:w-[50px] sm:w-[40px] w-[30px]
        xl:h-[60px] lg:h-[50px] sm:h-[40px] h-[30px]`}
        aria-label="BackwardButton">
                <div className="relative w-full h-full">
                    <img
                        src={backward}
                        alt="forwardButton-bg"
                        className="absolute w-full h-full top-1/2 transform -translate-y-1/4 right-0"
                    />
                </div>
        </button>
    );
};

export default backwardButton