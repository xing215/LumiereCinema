import DropdownArrow from "../../assets/img/DropdownArrow.svg";

const movieStatusButton = () => {
    return (
        <div className="relative
        xl:w-60 lg:w-50 md:w-40 w-[49%]
        xl:h-9 lg:h-8 md:h-7 h-6">
            <div className="w-full h-full left-0 top-0 absolute bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]
            xl:rounded-xl rounded-lg " />
            <div className="absolute text-center justify-start text-white font-bold font-['Unbounded'] w-full
            left-1/2 top-1/2 transform -translate-1/2
            xl:text-base lg:text-[15px] md:text-[12px] text-[8px]">NOW SHOWING</div>
            <img src={DropdownArrow} alt="Backdrop Arrow"  className="absolute
            xl:h-3 lg:h-2.5 md:h-2 h-1.5
            xl:w-6 lg:w-5 md:w-4 w-3
            right-1/12 bottom-1/2 transform translate-1/2"/>
        </div>
    )
}

export default movieStatusButton;