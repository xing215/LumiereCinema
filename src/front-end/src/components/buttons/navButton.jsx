const NavButton = ({ name }) => {
    return (
        <div className="relative w-auto h-8 flex z-100">
            <div className="xl:w-[20px] lg:w-[15px] md:w-[10px] sm:w-[5px] w-[3px] h-full"/>
            <button className="lg:min-w-41 md:min-w-30 sm:min-w-25 min-w-20
            h-[22px] items-center inline-flex text-center justify-start text-white font-medium font-['Unbounded']
            xl:text-lg lg:text-lg md:text-md sm:text-sm text-[8px]">
                {name}
            </button>
            <div className="xl:w-[20px] lg:w-[15px] md:w-[10px] sm:w-[5px] w-[3px] h-full"/>
        </div>
    );
};
export default NavButton;
