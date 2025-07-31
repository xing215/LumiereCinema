import Header from "@/layouts/LandingPage/Header";
import { Title } from "@components/UI/label.jsx";
import Footer from "@layouts/LandingPage/Footer.jsx";
import Wishlist from "@/layouts/Wishlist/Wishlist.jsx";

const WishlistPage = () => {
    return (
        <div className="overflow-y-hidden overflow-hidden relative flex flex-col h-auto min-h-screen w-screen overflow-x-hidden bg-slate-950">
            <Header />
            <Title text="ACCOUNT" />
            <Wishlist />
            <div className="h-10 w-screen lg:h-20" />
            <div className="pointer-events-none absolute top-[60px] -left-[20px] h-20 w-20 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px] sm:top-[80px] sm:-left-[30px] sm:h-28 sm:w-28 md:top-[100px] md:-left-[50px] md:h-36 md:w-36 lg:top-[135px] lg:-left-[71px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute top-[140px] left-[50px] h-20 w-20 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px] sm:top-[180px] sm:left-[80px] sm:h-28 sm:w-28 md:top-[220px] md:left-[120px] md:h-36 md:w-36 lg:top-[275px] lg:left-[168px] lg:h-44 lg:w-44" />
            <div className="pointer-events-none absolute -right-[40px] -bottom-0 h-[250px] w-[200px] rotate-[150deg] bg-sky-400/60 mix-blend-lighten blur-[100px] sm:-right-[60px] sm:-bottom-0 sm:h-[350px] sm:w-[300px] md:-right-[80px] md:-bottom-0 md:h-[450px] md:w-[400px] lg:-right-100 lg:-bottom-0 lg:h-[580.90px] lg:w-[517.76px]" />
            <div className="pointer-events-none absolute right-[40px] bottom-0 h-20 w-20 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px] sm:right-[60px] sm:bottom-0 sm:h-28 sm:w-28 md:right-[80px] md:bottom-0 md:h-36 md:w-36 lg:right-100 lg:bottom-0 lg:h-44 lg:w-44" />
            <Footer />
        </div>
    )
}

export default WishlistPage;