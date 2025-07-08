import LogoImg from "../../assets/img/Logo.svg"
import NavButton from "../../components/buttons/footer/navButton.jsx"
import Star from "../../assets/img/Star.png"
import Moon from "../../assets/img/Moon.png"

const SpaceH = () => {
    return (
        <div className="w-full xl:h-[10px] lg:h-[6px] md:h-[5px] h-[3px]"/>
    )
}
const Circle = () => {
    return (
        <div className="bg-zinc-300 rounded-full
        xl:w-13 lg:w-10 md:w-8 sm:w-6 w-4
        xl:h-13 lg:h-10 md:h-8 sm:h-6 h-4" />
    )
}

const Logo = () => {
    return (
        <div className="absolute flex flex-col sm:top-1/2 top-auto bottom-3 transform sm:-translate-y-1/2 z-20
        sm:left-1/5 left-1/6 -translate-x-1/2">
            <img src={LogoImg} alt="Logo" className="
            xl:w-60 lg:w-40 md:w-30 w-10
            xl:h-40 lg:h-26 md:h-20 h-7" />
            <p className="justify-start text-white font-bold font-unbounded pt-2
            xl:text-4xl lg:text-3xl md:text-xl sm:text-lg text-[10px]">
                WHERE LIGHT <br/>
                MEETS STORY
            </p>
            <div className="flex xl:gap-4 lg:gap-3 md:gap-2 gap-1.5 pt-2">
                <Circle/>
                <Circle/>
                <Circle/>
            </div>
        </div>
    )
}

const AboutUs = () => {
    return (
        <div className="lg:px-3.5 md:py-12 flex flex-col items-center ">
            <p className="text-white font-unbounded font-bold
            xl:text-xl lg:text-lg md:text-md sm:text-xs text-[10px]">Lumiere<br/>Cinema</p>
            <SpaceH/>
            <NavButton name="About Us"/>
        </div>
    );
}

const Cinema = () => {
    return (
        <div className="lg:px-3.5 md:py-12 flex flex-col items-center ">
            <p className="text-white font-unbounded font-bold
            xl:text-xl lg:text-lg md:text-md sm:text-xs text-[10px]">Cinema</p>
            <SpaceH/>
            <NavButton name="Buy Ticket"/>
            <SpaceH/>
            <NavButton name="Buy Snack"/>
        </div>
    );
}

const Account = () => {
    return (
        <div className="lg:px-3.5 md:py-12 flex flex-col items-center ">
            <p className="text-white font-unbounded font-bold
            xl:text-xl lg:text-lg md:text-md sm:text-xs text-[10px]">Account</p>
            <SpaceH/>
            <NavButton name="Profile"/>
            <SpaceH/>
            <NavButton name="Wishlist"/>
            <SpaceH/>
            <NavButton name="Watch History"/>
        </div>
    );
}

const Extras = () => {
    return (
        <div className="lg:px-3.5 md:py-12 flex flex-col items-center ">
            <p className="text-white font-unbounded font-bold
            xl:text-xl lg:text-lg md:text-md sm:text-xs text-[10px]">Extras</p>
            <SpaceH/>
            <NavButton name="Lunar Point"/>
        </div>
    );
}

const ControlFrame = () => {
    return (
        <div className="absolute z-20 flex
        xl:gap-15 lg:gap-5 md:gap-7 gap-7
        left-1/2 -translate-x-1/2 top-10
        xl:top-1/3 transform xl:-translate-y-1/2 md:translate-x-0
        lg:top-5 md:top-3
        xl:right-30 lg:right-25 md:right-20 md:left-auto">
            <AboutUs/>
            <Cinema/>
            <Account/>
            <Extras/>
        </div>
    );
}

const ContactUs = () => {
    return (
        <div className="absolute flex flex-col text-right text-white font-unbounded z-20
        md:bottom-1/5 bottom-3
        xl:right-30 lg:right-25 md:right-20 right-3">
            <span className="xl:text-xl lg:text-lg md:text-[13px] text-[10px] font-bold">Contact Us</span>
            <SpaceH/>
            <span className="xl:text-base lg:text-sm md:text-[10px] text-[8px]">
                <span className="font-bold">Address:</span> No 227 Nguyen Van Cu street, <span className="md:hidden" aria-hidden="true"><br /></span>
                Cho Quan ward, Ho Chi Minh city <br/>
                <span className="font-bold">Phone Number:</span> 0912983278 <br/>
                <span className="font-bold">Email:</span> lumiere.cinema@clc.fitus.edu.vn <br/>
            </span>
            <img src={Moon} alt="Moon" className="rotate-[11.07deg] absolute
            xl:bottom-[-100px] lg:bottom-[-80px] md:bottom-[-50px] sm:top-auto top-[20px]
            xl:right-[-120px] lg:right-[-100px] md:right-[-60px] sm:left-auto left-[-25px]
            xl:w-40 lg:w-30 md:w-20 h-5
            xl:h-40 lg:h-30 md:h-20 w-5"/>
            <img src={Star} alt="Star1" className="rotate-[-26.51deg] absolute
             xl:w-17 lg:w-13 md:w-10 sm:w-8 w-5
             xl:h-17 lg:h-13 md:h-10 sm:h-8 h-5
             xl:left-[-70px] lg:left-[-50px] md:left-[-30px] left-[-20px]
             lg:top-[-10px] md:top-[-5px] top-0
             lg:bottom-38 md:bottom-30 bottom-30"/>
            <img src={Star} alt="Star1" className="rotate-[32.31deg] absolute
             xl:w-17 lg:w-13 md:w-10 sm:w-8 w-5
             xl:h-17 lg:h-13 md:h-10 sm:h-8 h-5
             xl:bottom-[-20px] lg:bottom-[-15px] md:bottom-[-10px] bottom-4
             md:left-10"/>
        </div>
    );
}

const Footer = () => {
    return (
        <div className="relative bottom-0 w-screen z-20
        xl:h-130 lg:h-100 md:h-80 h-60">
            <div className="absolute w-full h-full bg-slate-900 z-10"/>
            <Logo/>
            <div className="absolute z-20 xl:left-1/6 md:left-1/5 left-1/2 transform -translate-x-1/2 text-center justify-start text-white  font-normal font-unbounded
            lg:text-xs md:text-[10px] text-[7px]
            top-2 md:top-auto md:bottom-3 ">
                @2025 Lumiere Cinema. <span className="md:hidden" aria-hidden="true"><br /></span>
                All rights reserved.
            </div>
            <ControlFrame/>
            <ContactUs/>
            <div className=" absolute w-full h-1/2 bg-gradient-multi blur-[100px] z-5" />
        </div>
    );
}

export default Footer;
