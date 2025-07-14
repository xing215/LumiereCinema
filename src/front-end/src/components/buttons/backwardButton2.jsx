import backward from '../../assets/img/backward2.svg';

const backwardButton = ({ onClick, position = 'absolute' }) => {
    const positionClass = position === 'absolute' ? 'absolute z-50 xl:left-8 lg:left-6 sm:left-3 left-0 top-1/2 -translate-y-1/2' : 'relative z-50';

    return (
        <button
            onClick={onClick}
            className={`${positionClass} h-[30px] w-[30px] hover:cursor-pointer sm:h-[40px] sm:w-[40px] lg:h-[50px] lg:w-[50px] xl:h-[60px] xl:w-[60px]`}
            aria-label="BackwardButton"
        >
            <div className="relative h-full w-full">
                <img src={backward} alt="forwardButton-bg" className="absolute top-1/2 right-0 h-full w-full -translate-y-1/4 transform" />
            </div>
        </button>
    );
};

export default backwardButton;
