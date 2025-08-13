const NavButton = ({ name, onClick }) => {
    return (
        <button
            className="font-unbounded lg:text-md relative items-center justify-start text-center text-[10px] font-normal text-nowrap text-white hover:cursor-pointer md:text-[12px] xl:text-lg"
            onClick={onClick}
        >
            {name}
        </button>
    );
};
export default NavButton;
