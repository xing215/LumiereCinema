import logo from '../../assets/img/Logo.svg';
const Logo = () => {
    return (
        <div className="relative z-100 flex h-auto w-auto -translate-y-1">
            <button className="h-6 w-7 items-center hover:cursor-pointer md:h-8 md:w-10 lg:h-9 lg:w-12 xl:h-10 xl:w-14">
                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </button>
            <div className="h-full w-[5px] md:w-[10px] lg:w-[15px]" />
            <div className="sm:[33-px] h-full w-[10px] md:w-[53px] lg:w-[83px]" />
        </div>
    );
};
export default Logo;
