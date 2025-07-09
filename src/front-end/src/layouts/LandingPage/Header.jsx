import NavButton from '../../components/buttons/header/navButton.jsx';
import SearchButton from '../../components/buttons/searchButton.jsx';
import Logo from "../../components/buttons/logoButton.jsx";

const Header = () => (
    <header className="fixed top-0 z-100 w-screen bg-transparent bg-opacity-100 overflow-y-visible no-scrollbar">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[calc(120vw+2rem)] lg:h-20 sm:h-10 h-8 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent z-20" />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[calc(120vw+2rem)] lg:h-30 sm:h-20 h-15 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent lg:blur-md sm:blur-lg blur-sm z-20" />
        <div className="relative overflow-x-hidden flex justify-center items-center xl:gap-10 lg:gap-5 md:gap-3 flex-nowrap content-center xl:pt-9 lg:pt-5.5 md:pt-3 pt-2 max-w-screen mx-auto">
            <Logo />
            <NavButton name="Buy Tickets" />
            <NavButton name="Buy Snacks" />
            <NavButton name="Login/Register" />
            <SearchButton />
            </div>
    </header>
);

export default Header;