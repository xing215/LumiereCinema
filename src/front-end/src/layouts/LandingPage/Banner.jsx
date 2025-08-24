import axios from 'axios';
import { getApiUrl } from '@config/api.config';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import '@styles/swiper-banner.css';
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
    const [loading, setLoading] = React.useState(true);
    const [swiperInstance, setSwiperInstance] = React.useState(null);
    
    // Tỉ lệ ảnh banner (width:height) - bạn có thể thay đổi theo ý muốn
    const aspectRatio = 4 / 3; // Ví dụ: 16:9, có thể thay thành 21:9, 4:3, v.v.
    const bannerHeight = 300; // Chiều cao cố định (px), có thể responsive

    // Hàm tính toán responsive height dựa trên screen size
    const getResponsiveHeight = () => {
        if (typeof window === 'undefined') return bannerHeight;
        const screenWidth = window.innerWidth;

        if (screenWidth < 640) return 250; // mobile
        if (screenWidth < 1024) return 400; // tablet
        if (screenWidth < 1280) return 500; // desktop
        return 700; // large desktop
    };

    const [responsiveHeight, setResponsiveHeight] = React.useState(getResponsiveHeight);

    // Update responsive height on window resize
    React.useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const res = await axios.get(getApiUrl('promotionBanner'));
                let arr = Array.isArray(res.data) ? res.data : [];
                // Preload images and filter out those that fail to load
                const preload = (url) =>
                    new Promise((resolve) => {
                        if (!url) return resolve(false);
                        const img = new window.Image();
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                        img.src = url;
                    });
                // Map to URLs
                const urlArr = arr.map((b) => b?.image || b);
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

    // Navigation handlers for custom buttons
    const handlePrev = () => {
        if (swiperInstance) {
            swiperInstance.slidePrev();
        }
    };

    const handleNext = () => {
        if (swiperInstance) {
            swiperInstance.slideNext();
        }
    };

    // Poster container with Swiper
    const renderPoster = () => {
        const currentHeight = responsiveHeight;

        if (loading)
            return (
                <div className="flex items-center justify-center text-white" style={{ height: currentHeight }}>
                    Loading...
                </div>
            );
        
        if (!banners.length) {
            return (
                <div className="flex w-full items-center justify-center" style={{ height: currentHeight }}>
                    <img
                        src={defaultBanner}
                        alt="Default Banner"
                        className="block w-full rounded-xl object-cover shadow-lg"
                        style={{
                            height: currentHeight,
                            aspectRatio: aspectRatio,
                        }}
                    />
                </div>
            );
        }

        return (
            <div
                className="relative w-full overflow-hidden rounded-xl shadow-lg"
                style={{
                    height: currentHeight,
                    aspectRatio: aspectRatio,
                }}
            >
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={banners.length > 1}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                        waitForTransition: true,
                    }}
                    speed={800}
                    effect="slide"
                    grabCursor={true}
                    touchRatio={1}
                    touchAngle={45}
                    threshold={5}
                    longSwipesRatio={0.3}
                    longSwipesMs={200}
                    followFinger={true}
                    allowTouchMove={true}
                    resistance={true}
                    resistanceRatio={0.85}
                    watchSlidesProgress={true}
                    preventClicks={false}
                    preventClicksPropagation={false}
                    slideToClickedSlide={false}
                    centeredSlides={false}
                    lazy={{
                        loadPrevNext: true,
                        loadPrevNextAmount: 1,
                    }}
                    preloadImages={false}
                    updateOnWindowResize={true}
                    resizeObserver={true}
                    // pagination={{
                    //     el: '.banner-pagination',
                    //     clickable: true,
                    //     bulletClass: 'swiper-pagination-bullet banner-bullet',
                    //     bulletActiveClass: 'banner-bullet-active',
                    //     dynamicBullets: banners.length > 5,
                    //     dynamicMainBullets: 3,
                    // }}
                    keyboard={{
                        enabled: true,
                        onlyInViewport: true,
                    }}
                    mousewheel={{
                        forceToAxis: true,
                        sensitivity: 1,
                        releaseOnEdges: true,
                    }}
                    breakpoints={{
                        320: {
                            touchRatio: 1.2,
                            threshold: 8,
                        },
                        640: {
                            touchRatio: 1,
                            threshold: 5,
                        },
                        1024: {
                            touchRatio: 0.8,
                            threshold: 3,
                        },
                    }}
                    onSwiper={setSwiperInstance}
                    className="h-full w-full banner-swiper"
                >
                    {banners.map((banner, index) => {
                        const img = banner?.image || banner;
                        return (
                            <SwiperSlide key={index} className="h-full w-full">
                                <img
                                    src={img}
                                    alt={`Banner ${index + 1}`}
                                    className="swiper-lazy block h-full w-full object-cover"
                                    draggable={false}
                                    loading="lazy"
                                    style={{
                                        objectPosition: 'center center',
                                        userSelect: 'none',
                                    }}
                                />
                                <div className="swiper-lazy-preloader"></div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Custom pagination dots - Temporarily disabled for testing */}
                {/* {banners.length > 1 && (
                    <div className="banner-pagination absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 transform space-x-2"></div>
                )} */}
            </div>
        );
    };

    return (
        <section className="relative z-10 w-screen max-w-none min-w-0 gap-8 overflow-hidden bg-slate-950 lg:pt-3">
            <div className="relative flex w-screen max-w-none min-w-0 items-center justify-center">
                {/*Left*/}

                <div className="absolute top-0 left-0 z-15 h-full w-10 bg-gradient-to-r from-black via-slate-900/80 to-transparent blur-sm sm:w-20 lg:w-30" />
                {/*Right*/}
                <div className="absolute top-0 right-0 z-15 h-full w-10 bg-gradient-to-l from-black via-slate-900/80 to-transparent blur-sm sm:w-20 lg:w-30" />
                {/* Slideable Poster */}
                {/* Only show navigation if there are banners to slide */}
                {banners.length > 0 && <BackwardButton onClick={handlePrev} position="absolute" />}
                <div className="flex flex-1 items-center justify-center px-2 sm:px-8 lg:px-10">{renderPoster()}</div>
                {banners.length > 0 && <ForwardButton onClick={handleNext} position="absolute" />}
                {/*Bottom*/}
                <div className="absolute bottom-[-15px] left-0 z-20 h-9 w-full bg-gradient-to-t from-black via-slate-950 to-transparent blur-xs sm:h-11 sm:blur-sm lg:h-12.5 xl:bottom-[-22px] xl:h-15 xl:blur-md" />

                <Decoration1 />
                <Decoration2 />
            </div>
            <Label />
            <AiSearch />
        </section>
    );
};

export default Banner;
