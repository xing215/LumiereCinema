import backAndForwardButton from "../../assets/img/backAndForwardButton.png"
import ArrowBackwardButton from "../../assets/img/backwardButton.svg"

const backwardButton = () => {
    return (
        <button className="absolute left-6 top-1/2 -translate-y-1/2 w-[70px] h-[70px] z-50"
        aria-label="BackwardButton">
                <div className="relative w-full h-full">
                    <img
                        src={backAndForwardButton}
                        alt="forwardButton-bg"
                        className="absolute w-[70px] h-[70px] top-0 right-0"
                    />
                    <img
                        src={ArrowBackwardButton}
                        alt="arrow"
                        className="absolute w-5 h-10 top-4 left-6"
                    />
                </div>
        </button>
    );
};

export default backwardButton