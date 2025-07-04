import backAndForwardButton from "../../assets/img/backAndForwardButton.png"
import ArrowBackwardButton from "../../assets/img/backwardButton.svg"

const backwardButton = () => {
    return (
        <button className="absolute z-50
        xl:left-8 lg:left-6 sm:left-3 left-0 top-1/2 -translate-y-1/2
        xl:w-[80px] lg:w-[70px] sm:w-[60px] w-[45px]
        xl:h-[80px] lg:h-[70px] sm:h-[60px] h-[45px]"
        aria-label="BackwardButton">
                <div className="relative w-full h-full">
                    <img
                        src={backAndForwardButton}
                        alt="forwardButton-bg"
                        className="absolute w-full h-full top-1/2 transform -translate-y-1/4 right-0"
                    />
                    <img
                        src={ArrowBackwardButton}
                        alt="arrow"
                        className="absolute lg:w-4.5 sm:w-4 w-3
                        xl:h-10 lg:h-9 sm:h-8 h-6
                        top-1/2 xl:left-7 lg:left-6 sm:left-5 left-4"
                    />
                </div>
        </button>
    );
};

export default backwardButton