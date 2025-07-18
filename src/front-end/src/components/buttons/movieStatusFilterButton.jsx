import DropdownArrow from '@assets/img/DropdownArrow.svg';

const movieStatusButton = () => {
    return (
        <div className="relative h-6 w-[49%] md:h-7 md:w-40 lg:h-8 lg:w-50 xl:h-9 xl:w-60">
            <div className="absolute top-0 left-0 h-full w-full rounded-lg bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] xl:rounded-xl" />
            <div className="absolute top-1/2 left-1/2 w-full -translate-1/2 transform justify-start text-center font-['Unbounded'] text-[8px] font-bold text-white hover:cursor-pointer md:text-[12px] lg:text-[15px] xl:text-base">
                NOW SHOWING
            </div>
            <img
                src={DropdownArrow}
                alt="Backdrop Arrow"
                className="absolute right-1/12 bottom-1/2 h-1.5 w-3 translate-1/2 transform hover:cursor-pointer md:h-2 md:w-4 lg:h-2.5 lg:w-5 xl:h-3 xl:w-6"
            />
        </div>
    );
};

export default movieStatusButton;
