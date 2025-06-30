import NavButton from '../../components/buttons/navButton.jsx';
import SearchButton from '../../components/buttons/searchButton.jsx';
import Logo from "../../components/buttons/logoButton.jsx";

const Header = () => (
    <div className="fixed top-0 z-100 w-screen bg-transparent bg-opacity-80">
        <div className="absolute top-0 left-0 w-screen h-20 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent z-20" />
        <div className="absolute top-0 left-0 w-screen h-50 bg-gradient-to-b from-slate-950 via-slate-900 to-transparent blur-xl z-20" />
        <div className="relative overflow-x-hidden flex justify-center items-center gap-1 flex-nowrap content-center lg:pt-5.5 md:pt-3 pt-2 max-w-screen mx-auto">
            <Logo />
            <NavButton name="Buy Tickets" />
            <NavButton name="Buy Snacks" />
            <NavButton name="Login/Register" />
            <SearchButton />
            </div>
    </div>
);

export default Header;