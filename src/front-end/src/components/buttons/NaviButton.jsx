const NextNaviButton = ({ text }) => (
    <button className="relative flex aspect-square h-auto flex-row items-center justify-center px-3 md:aspect-auto md:w-[calc(19vw)] md:max-w-[300px] md:min-w-[150px] md:justify-between md:px-0 md:pr-3">
        <div className="absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]" />
        <div className="relative hidden flex-1 py-2 pl-3 font-['Unbounded'] text-base font-bold text-white md:block md:text-[14px] xl:text-[14px]">{text}</div>
        <img src="src/assets/img/forwardButton.svg" alt="arrow" className="relative h-5 w-3 sm:w-4 md:h-4 lg:w-4.5" />
    </button>
);

export const BackNaviButton = () => (
    <button className="relative flex aspect-square h-auto flex-row items-center justify-center px-3 md:px-2.5">
        <div className="absolute h-full w-full rounded-xl bg-sky-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]" />
        <img src="src/assets/img/backwardButton.svg" alt="arrow" className="relative h-5 w-3 sm:w-4 md:h-4 lg:w-4.5" />
    </button>
);

export default NextNaviButton;
