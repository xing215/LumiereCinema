import backAndForwardButton from "../../assets/img/backAndForwardButton.png"
import ArrowForwardButton from "../../assets/img/forwardButton.svg"

const forwardButton = () => {
    return (
        <button className="absolute right-6 top-1/2 -translate-y-1/2 w-[70px] h-[70px] z-50"
        aria-label="ForwardButton">
            <div className="relative w-full h-full">
                <img
                    src={backAndForwardButton}
                    alt="forwardButton-bg"
                    className="absolute w-[70px] h-[70px] top-0 right-0"
                />
                <img
                    src={ArrowForwardButton}
                    alt="arrow"
                    className="absolute w-5 h-10 top-4 right-6"
                />
            </div>
        </button>
    );
};

export default forwardButton