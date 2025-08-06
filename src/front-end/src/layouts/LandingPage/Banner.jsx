
import axios from 'axios';
import { getApiUrl } from '@config/api.config';
import React from 'react';
import BackwardButton from '@components/buttons/backwardButton';
import ForwardButton from '@components/buttons/forwardButton';
import Decoration from '@assets/img/Banner_Decoration.png';
import AiSearch from '@components/display/AiSearch';
import defaultBanner from '@assets/img/defaultBanner.png';

const Decoration1 = () => {
    return (
        <img
            src={Decoration}
            alt="Decoration1"
            className="absolute top-3 right-[-50px] z-18 h-20 w-20 rotate-[-82.79deg] blur-[1.93px] sm:top-0 sm:right-[-75px] sm:h-30 sm:w-30 lg:right-[-130px] lg:h-50 lg:w-50 xl:right-[-190px] xl:h-72 xl:w-72"
        />
    );
};

const Decoration2 = () => {
    return (
        <img
            src={Decoration}
            alt="Decoration2"
            className="absolute bottom-[-50px] left-[-30px] z-20 h-20 w-20 rotate-[168.61deg] blur-[1.65px] md:bottom-[-95px] md:left-[-70px] md:h-40 md:w-40 lg:bottom-[-150px] lg:left-[-120px] lg:h-60 lg:w-60 xl:bottom-[-180px] xl:h-70 xl:w-70"
        />
    );
};

const Label = () => {
    return (
        <div className="z relative top-0 left-1/2 w-screen -translate-x-1/2 transform justify-center">
            <div className="relative h-2 w-screen bg-transparent sm:h-4 md:h-5.5 lg:h-7" />
            <div className="z-20 flex justify-center pt-1.5 sm:pt-1">
                <div className="whitespace-wrap max-w-[80%] text-center font-['Unbounded'] text-sm font-bold text-white md:text-2xl lg:text-4xl xl:text-5xl">What would you like to watch?</div>
            </div>
        </div>
    );
};


const Banner = () => {
    const [banners, setBanners] = React.useState([]);
    const [current, setCurrent] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const res = await axios.get(getApiUrl('promotionBanner'));
                let arr = Array.isArray(res.data) ? res.data : [];
                // Preload images and filter out those that fail to load
                const preload = (url) => new Promise(resolve => {
                    if (!url) return resolve(false);
                    const img = new window.Image();
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    img.src = url;
                });
                // Map to URLs
                const urlArr = arr.map(b => b?.image || b);
                const results = await Promise.all(urlArr.map(preload));
                const validArr = arr.filter((b, i) => results[i]);
                setBanners(validArr);
            } catch (e) {
                setBanners([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);


    const handlePrev = () => {
        setCurrent((prev) => (banners.length ? (prev - 1 + banners.length) % banners.length : 0));
    };
    const handleNext = () => {
        setCurrent((prev) => (banners.length ? (prev + 1) % banners.length : 0));
    };

    // Auto-advance banner every 5 seconds
    React.useEffect(() => {
        if (!banners.length) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    // Poster image scaling: responsive, max width/height, centered
    const renderPoster = () => {
        if (loading) return <div className="flex items-center justify-center w-full h-60 text-white">Loading...</div>;
        if (!banners.length) {
            return (
                <img
                    src={defaultBanner}
                    alt="Default Banner"
                    className="w-full h-full block object-cover rounded-xl shadow-lg"
                    style={{ minHeight: '180px' }}
                />
            );
        }
        const img = banners[current]?.image || banners[current];
        return (
            <img
                src={img}
                alt={`Banner ${current + 1}`}
                className="w-full h-full block object-cover rounded-xl shadow-lg"
                style={{ minHeight: '180px' }}
            />
        );
    };

return (
    <section className="relative z-10 w-screen min-w-0 max-w-none gap-8 bg-slate-950 lg:pt-3 overflow-hidden">
        <div className="relative w-screen flex items-center justify-center min-w-0 max-w-none">
            {/*Left*/}
            <div className="absolute top-0 left-0 z-15 h-full w-30 bg-gradient-to-r from-black via-slate-900/80 to-transparent sm:w-60 lg:w-95" />
            {/*Right*/}
            <div className="absolute top-0 right-0 z-15 h-full w-30 bg-gradient-to-l from-black via-slate-900/80 to-transparent sm:w-60 lg:w-95" />
            {/* Slideable Poster */}
            {/* Only show navigation if there are banners to slide */}
            {banners.length > 0 && <BackwardButton onClick={handlePrev} position="absolute" />}
            <div className="flex-1 flex items-center justify-center min-h-[180px]">
                {renderPoster()}
            </div>
            {banners.length > 0 && <ForwardButton onClick={handleNext} position="absolute" />}
            {/*Bottom*/}
            <div className="absolute bottom-[-15px] left-0 z-20 h-9 w-full bg-gradient-to-t from-black via-slate-950 to-transparent blur-xs sm:h-11 sm:blur-sm lg:h-12.5 xl:h-20 xl:blur-md" />            <Decoration1 />
            <Decoration2 />        </div>
        <Label />
        <AiSearch />
    </section>
)};

export default Banner;
