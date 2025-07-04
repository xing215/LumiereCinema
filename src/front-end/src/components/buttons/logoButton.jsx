import logo from '../../assets/img/Logo.svg';
const Logo = () => {
    return (
        <div className="relative w-auto h-auto flex z-100 -translate-y-1">
            <button className="xl:w-14 lg:w-12 md:w-10 w-7
            xl:h-10 lg:h-9 md:h-8 h-6
            items-center">
                <img src={logo} alt="Logo"
                     className=" w-full h-full object-contain" />
            </button>
            <div className="lg:w-[15px] md:w-[10px] w-[5px] h-full"/>
            <div className="lg:w-[83px] md:w-[53px] sm:[33-px] w-[10px] h-full"/>
        </div>
    )
}
export default Logo;