const NavButton = ({ name }) => {
    return (
        <button className=" relative items-center text-nowrap text-center justify-start text-white font-normal font-unbounded
        xl:text-lg lg:text-md md:text-[12px] text-[10px]">
            {name}
        </button>
    );
};
export default NavButton;
