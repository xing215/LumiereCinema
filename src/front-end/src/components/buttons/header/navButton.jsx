const NavButton = ({ name, onClick }) => {
    return (
        <div className="relative z-100 flex h-8 w-auto">
            <div className="h-full w-[3px] sm:w-[5px] md:w-[10px] lg:w-[15px] xl:w-[20px]" />
            <button 
                onClick={onClick}
                className="md:text-md inline-flex h-[22px] min-w-20 items-center justify-start text-center font-['Unbounded'] text-[8px] font-medium text-white hover:cursor-pointer sm:min-w-25 sm:text-sm md:min-w-30 lg:min-w-41 lg:text-lg xl:text-xl"
            >
                {name}
            </button>
            <div className="h-full w-[3px] sm:w-[5px] md:w-[10px] lg:w-[15px] xl:w-[20px]" />
        </div>
    );
};
export default NavButton;
