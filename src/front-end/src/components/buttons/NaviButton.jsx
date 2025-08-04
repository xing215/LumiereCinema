import ArrowForwardButton from '@assets/img/forwardButton.svg';
import ArrowBackwardButton from '@assets/img/backwardButton.svg';

const NextNaviButton = ({ text, onClick, showTextOnMobile = false }) => (
    <button
        className={`group relative flex hover:cursor-pointer ${showTextOnMobile ? 'aspect-auto w-[60vw]' : 'aspect-square'} h-auto flex-row items-center justify-center px-3 transition-all duration-300 md:aspect-auto md:w-[calc(19vw)] md:max-w-[300px] md:min-w-[150px] md:justify-between md:px-0 md:pr-3`}
        onClick={onClick}
    >
        <div className="absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 group-hover:bg-purple-600" />
        <div className={`relative flex-1 py-[9px] pl-3 font-['Unbounded'] text-[14px] font-bold text-white md:block ${showTextOnMobile ? 'block pr-2' : 'hidden'}`}>{text}</div>
        <img src={ArrowForwardButton} alt="arrow" className="pb-0.1 relative h-5 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:w-4 md:h-4 lg:w-4.5" />
    </button>
);

export const BackNaviButton = ({ onClick }) => (
    <button className="group relative flex hover:cursor-pointer aspect-square h-auto flex-row items-center justify-center px-3 transition-all duration-300 md:px-2.5" onClick={onClick}>
        <div className="absolute h-full w-full rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 group-hover:bg-blue-700" />
        <img src={ArrowBackwardButton} alt="arrow" className="relative h-5 w-3 transition-transform duration-300 group-hover:-translate-x-1 sm:w-4 md:h-4 lg:w-4.5" />
    </button>
);

export default NextNaviButton;
