import backAndForwardButton from '@assets/img/backAndForwardButton.png';
import ArrowForwardButton from '@assets/img/forwardButton.svg';

const forwardButton = ({ onClick, position = 'absolute' }) => {
    const positionClass = position === 'absolute' ? 'absolute z-50 xl:right-8 lg:right-6 sm:right-3 right-0 top-1/2 -translate-y-1/2' : 'relative z-50';
    return (
        <button
            onClick={onClick}
            className={`${positionClass} hidden h-[45px] w-[45px] hover:cursor-pointer sm:block sm:h-[60px] sm:w-[60px] lg:h-[70px] lg:w-[70px] xl:h-[80px] xl:w-[80px]`}
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
