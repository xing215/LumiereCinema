import LogoImg from '@assets/img/Logo.svg';
import NavButton from '@components/buttons/footer/navButton.jsx';
import Star from '@assets/img/Star.png';
import Moon from '@assets/img/Moon.png';
import { ROUTES } from '@routes/routeConfig.js';
import { useNavigate } from 'react-router-dom';

const SpaceH = () => {
    return <div className="h-[3px] w-full md:h-[5px] lg:h-[6px] xl:h-[10px]" />;
};
const Circle = () => {
    return <div className="h-4 w-4 rounded-full bg-zinc-300 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 xl:h-13 xl:w-13" />;
};

const Logo = () => {
    return (
        <div className="absolute top-auto bottom-3 left-1/6 z-20 flex -translate-x-1/2 transform flex-col sm:top-1/2 sm:left-1/5 sm:-translate-y-1/2">
            <img src={LogoImg} alt="Logo" className="h-7 w-10 md:h-20 md:w-30 lg:h-26 lg:w-40 xl:h-40 xl:w-60" />
            <p className="font-unbounded justify-start pt-2 text-[10px] font-bold text-white sm:text-lg md:text-xl lg:text-3xl xl:text-4xl">
                WHERE LIGHT <br />
                MEETS STORY
            </p>
            <div className="flex gap-1.5 pt-2 md:gap-2 lg:gap-3 xl:gap-4">
                <Circle />
                <Circle />
                <Circle />
            </div>
        </div>
    );
};

const AboutUs = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center md:py-12 lg:px-3.5">
            <p className="font-unbounded md:text-md text-[10px] font-bold text-white sm:text-xs lg:text-lg xl:text-xl">
                Lumiere
                <br />
                Cinema
            </p>
            <SpaceH />
            <NavButton name="About Us" onClick={() => navigate(ROUTES.ABOUT_US)} />
        </div>
    );
};

const Cinema = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center md:py-12 lg:px-3.5">
            <p className="font-unbounded md:text-md text-[10px] font-bold text-white sm:text-xs lg:text-lg xl:text-xl">Cinema</p>
            <SpaceH />
            <NavButton name="Buy Ticket" onClick={() => navigate(ROUTES.MOVIES)} />
            <SpaceH />
            <NavButton name="Buy Snack" onClick={() => navigate(ROUTES.BUY_SNACK)} />
        </div>
    );
};

const Account = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center md:py-12 lg:px-3.5">
            <p className="font-unbounded md:text-md text-[10px] font-bold text-white sm:text-xs lg:text-lg xl:text-xl">Account</p>
            <SpaceH />
            <NavButton name="Profile" onClick={() => navigate(ROUTES.PROFILE)} />
            <SpaceH />
            <NavButton name="Wishlist" onClick={() => navigate(ROUTES.WISHLIST)} />
            <SpaceH />
            <NavButton name="Watch History" onClick={() => navigate(ROUTES.WATCH_HISTORY)} />
        </div>
    );
};

const Extras = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center md:py-12 lg:px-3.5">
            <p className="font-unbounded md:text-md text-[10px] font-bold text-white sm:text-xs lg:text-lg xl:text-xl">Extras</p>
            <SpaceH />
            <NavButton name="Lunar Point" onClick={() => navigate(ROUTES.LUNAR_POINT)} />
        </div>
    );
};

const ControlFrame = () => {
    return (
        <div className="absolute top-10 left-1/2 z-20 flex -translate-x-1/2 transform gap-7 md:top-3 md:right-20 md:left-auto md:translate-x-0 md:gap-7 lg:top-5 lg:right-25 lg:gap-5 xl:top-1/3 xl:right-30 xl:-translate-y-1/2 xl:gap-15">
            <AboutUs />
            <Cinema />
            <Account />
            <Extras />
        </div>
    );
};

const ContactUs = () => {
    return (
        <div className="font-unbounded absolute right-3 bottom-3 z-20 flex flex-col text-right text-white md:right-20 md:bottom-1/5 lg:right-25 xl:right-30">
            <span className="text-[10px] font-bold md:text-[13px] lg:text-lg xl:text-xl">Contact Us</span>
            <SpaceH />
            <span className="text-[8px] md:text-[10px] lg:text-sm xl:text-base">
                <span className="font-bold">Address:</span> No 227 Nguyen Van Cu street,{' '}
                <span className="md:hidden" aria-hidden="true">
                    <br />
                </span>
                Cho Quan ward, Ho Chi Minh city <br />
                <span className="font-bold">Phone Number:</span> 0912983278 <br />
                <span className="font-bold">Email:</span> lumiere.cinema@clc.fitus.edu.vn <br />
            </span>
            <img
                src={Moon}
                alt="Moon"
                className="absolute top-[20px] left-[-25px] h-5 w-5 rotate-[11.07deg] sm:top-auto sm:left-auto md:right-[-60px] md:bottom-[-50px] md:h-20 md:w-20 lg:right-[-100px] lg:bottom-[-80px] lg:h-30 lg:w-30 xl:right-[-120px] xl:bottom-[-100px] xl:h-40 xl:w-40"
            />
            <img
                src={Star}
                alt="Star1"
                className="absolute top-0 bottom-30 left-[-20px] h-5 w-5 rotate-[-26.51deg] sm:h-8 sm:w-8 md:top-[-5px] md:bottom-30 md:left-[-30px] md:h-10 md:w-10 lg:top-[-10px] lg:bottom-38 lg:left-[-50px] lg:h-13 lg:w-13 xl:left-[-70px] xl:h-17 xl:w-17"
            />
            <img
                src={Star}
                alt="Star1"
                className="absolute bottom-4 h-5 w-5 rotate-[32.31deg] sm:h-8 sm:w-8 md:bottom-[-10px] md:left-10 md:h-10 md:w-10 lg:bottom-[-15px] lg:h-13 lg:w-13 xl:bottom-[-20px] xl:h-17 xl:w-17"
            />
        </div>
    );
};

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div className="relative bottom-0 z-20 h-60 w-screen md:h-80 lg:h-100 xl:h-130">
            <div className="absolute z-10 h-full w-full bg-slate-900" />
            <Logo />
            <div className="font-unbounded absolute top-2 left-1/2 z-20 -translate-x-1/2 transform justify-start text-center text-[7px] font-normal text-white md:top-auto md:bottom-3 md:left-1/5 md:text-[10px] lg:text-xs xl:left-1/6">
                @2025 Lumiere Cinema.{' '}
                <span className="md:hidden" aria-hidden="true">
                    <br />
                </span>
                All rights reserved.
            </div>
            <ControlFrame />
            <ContactUs />
            <div className="bg-gradient-multi absolute z-5 h-1/2 w-full blur-[100px]" />
        </div>
    );
};

export default Footer;
