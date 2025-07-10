import backAndForwardButton from '../../assets/img/backAndForwardButton.png';
import ArrowBackwardButton from '../../assets/img/backwardButton.svg';

const backwardButton = ({ onClick, position = 'absolute' }) => {
    const positionClass = position === 'absolute' ? 'absolute z-50 xl:left-8 lg:left-6 sm:left-3 left-0 top-1/2 -translate-y-1/2' : 'relative z-50';

    return (
        <button onClick={onClick} className={`${positionClass} h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] lg:h-[70px] lg:w-[70px] xl:h-[80px] xl:w-[80px]`} aria-label="BackwardButton">
            <div className="relative h-full w-full">
                <img src={backAndForwardButton} alt="forwardButton-bg" className="absolute top-1/2 right-0 h-full w-full -translate-y-1/4 transform" />
                <img src={ArrowBackwardButton} alt="arrow" className="absolute top-1/2 left-4 h-6 w-3 sm:left-5 sm:h-8 sm:w-4 lg:left-6 lg:h-9 lg:w-4.5 xl:left-7 xl:h-10" />
            </div>
        </button>
    );
};

export default backwardButton;
