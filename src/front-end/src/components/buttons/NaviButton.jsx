const NextNaviButton = ({ text }) => (
  <button className="flex flex-row items-center justify-center md:justify-between h-auto relative aspect-square md:aspect-auto md:w-[calc(19vw)] md:max-w-[300px] md:min-w-[150px] px-3 md:px-0 md:pr-3">
    <div className="absolute w-full h-full bg-pink-400 rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]" />
    <div className="hidden md:block relative flex-1 text-white text-base md:text-[14px] xl:text-[14px] font-bold font-['Unbounded'] pl-3 py-2">
      {text}
    </div>
    <img
      src="src/assets/img/forwardButton.svg"
      alt="arrow"
      className="relative lg:w-4.5 sm:w-4 w-3 md:h-4 h-5"
    />
  </button>
);

export const BackNaviButton = () => (
  <button className="flex flex-row items-center justify-center h-auto relative aspect-square px-3 md:px-2.5">
    <div className="absolute w-full h-full bg-sky-400 rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]" />
    <img
      src="src/assets/img/backwardButton.svg"
      alt="arrow"
      className="relative lg:w-4.5 sm:w-4 w-3 md:h-4 h-5"
    />
  </button>
);

export default NextNaviButton;