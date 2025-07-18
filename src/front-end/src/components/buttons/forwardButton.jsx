import backAndForwardButton from '@assets/img/backAndForwardButton.png';
import ArrowForwardButton from '@assets/img/forwardButton.svg';

const forwardButton = () => {
    return (
        <button
            className="absolute top-1/2 right-0 z-50 h-[45px] w-[45px] -translate-y-1/2 hover:cursor-pointer sm:right-3 sm:h-[60px] sm:w-[60px] lg:right-6 lg:h-[70px] lg:w-[70px] xl:right-8 xl:h-[80px] xl:w-[80px]"
            aria-label="ForwardButton"
        >
            <div className="relative h-full w-full">
                <img src={backAndForwardButton} alt="forwardButton-bg" className="absolute top-1/2 right-0 h-full w-full -translate-y-1/4 transform" />
                <img src={ArrowForwardButton} alt="arrow" className="absolute top-1/2 right-4 h-6 w-3 sm:right-5 sm:h-8 sm:w-4 lg:right-6 lg:h-9 lg:w-4.5 xl:right-7 xl:h-10" />
            </div>
        </button>
    );
};

export default forwardButton;
