import NavButton from '../../components/buttons/header/navButton.jsx';
import SearchButton from '../../components/buttons/searchButton.jsx';
import Logo from '../../components/buttons/logoButton.jsx';

const Header = () => (
    <header className="bg-opacity-100 no-scrollbar fixed top-0 z-100 w-screen overflow-y-visible bg-transparent">
        <div className="absolute top-0 left-1/2 z-20 h-8 w-[calc(120vw+2rem)] -translate-x-1/2 transform bg-gradient-to-b from-slate-950 via-slate-950 to-transparent sm:h-10 lg:h-20" />
        <div className="absolute top-0 left-1/2 z-20 h-15 w-[calc(120vw+2rem)] -translate-x-1/2 transform bg-gradient-to-b from-slate-950 via-slate-950 to-transparent blur-sm sm:h-20 sm:blur-lg lg:h-30 lg:blur-md" />
        <div className="relative mx-auto flex max-w-screen flex-nowrap content-center items-center justify-center overflow-x-hidden pt-2 md:gap-3 md:pt-3 lg:gap-5 lg:pt-5.5 xl:gap-10 xl:pt-9">
            <Logo />
            <NavButton name="Buy Tickets" />
            <NavButton name="Buy Snacks" />
            <NavButton name="Login/Register" />
            <SearchButton />
        </div>
    </header>
);

export default Header;
