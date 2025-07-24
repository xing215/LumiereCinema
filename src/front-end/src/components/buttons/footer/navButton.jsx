const NavButton = ({ name }) => {
    return (
        <button className="font-unbounded lg:text-md relative items-center justify-start text-center text-[10px] font-normal text-nowrap text-white hover:cursor-pointer md:text-[12px] xl:text-lg">
            {name}
        </button>
    );
};
export default NavButton;
