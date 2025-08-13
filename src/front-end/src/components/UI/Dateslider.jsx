import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const SliderButton = ({ date, isSelected, onClick, opacity = 'opacity-100', hasSelectedSchedule = false }) => {
    // Utility to get day abbreviation (Mon, Tue, etc.)
    const getDayAbbr = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    };

    // Utility to get date number (16, etc.)
    const getDateNum = (dateStr) => {
        const d = new Date(dateStr);
        return d.getDate();
    };

    return (
        <button className={`relative h-10 w-10 md:h-12 md:w-12 ${opacity} transition-all duration-300 ease-in-out lg:[transform:translate3d(0,0,0)]`} onClick={onClick}>
            <div
                className={`absolute top-0 h-full w-full rounded-full transition-all duration-300 ease-in-out ${
                    isSelected ? 'scale-105 bg-blue-700/90' : hasSelectedSchedule ? 'bg-blue-400 hover:scale-100' : 'bg-blue-700/70 hover:scale-100'
                } outline-3 outline-white/70 md:outline-2 xl:outline-3`}
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-0 -space-y-1 transition-all duration-300">
                <div className="font-['Unbounded'] text-[7px] font-bold text-white sm:text-[5.5px] lg:text-[7px]">{getDayAbbr(date)}</div>
                <div className="font-['Unbounded'] text-[17px] font-bold text-white">{getDateNum(date)}</div>
            </div>
        </button>
    );
};

const DateSlider = ({ viewingDate, onDateSelect, uniqueDates, selectedScheduleDate = null, loading }) => {
    const swiperRef = useRef(null);
    const selectedIndex = uniqueDates.findIndex((date) => date.date === viewingDate);

    // Auto-slide to selected date when it changes
    useEffect(() => {
        if (swiperRef.current && selectedIndex !== -1) {
            swiperRef.current.slideTo(selectedIndex, 500);
        }
    }, [selectedIndex]);

    // Handle slide change - update selected date based on active slide
    const handleSlideChange = (swiper) => {
        const activeIndex = swiper.activeIndex;
        if (activeIndex >= 0 && activeIndex < uniqueDates.length) {
            const newDate = uniqueDates[activeIndex];
            if (newDate && newDate.date !== viewingDate) {
                onDateSelect(newDate.date);
            }
        }
    };

    // Handle direct button click
    const handleDateSelect = (dateObj) => {
        const index = uniqueDates.findIndex((d) => d.date === dateObj.date);
        if (swiperRef.current && index !== -1) {
            swiperRef.current.slideTo(index, 300);
        }
    };

    // Get button opacity based on distance from center slide
    const getButtonOpacity = (index, activeIndex) => {
        const distance = Math.abs(index - activeIndex);
        if (distance === 0) return 'opacity-100';
        if (distance === 1) return 'opacity-60';
        return 'opacity-30';
    };

    if (loading) {
        return (
            <div className="flex h-auto items-center justify-center">
                <div className="animate-pulse p-5 font-['Unbounded'] text-2xl font-bold text-white">• • •</div>
            </div>
        );
    }

    return (
        <div className="flex h-auto w-auto flex-col items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-2">
                {/* Swiper container */}
                <div className="relative h-15 w-[calc(5*56px)] md:h-16 md:w-[calc(5*64px)]">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={16}
                        slidesPerView={5}
                        centeredSlides={true}
                        initialSlide={selectedIndex >= 0 ? selectedIndex : 0}
                        grabCursor={true}
                        allowTouchMove={true}
                        speed={400}
                        loop={false}
                        watchSlidesProgress={true}
                        navigation={{
                            nextEl: '.swiper-button-next-custom',
                            prevEl: '.swiper-button-prev-custom',
                        }}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                            // Force initial centering after swiper is ready
                            setTimeout(() => {
                                if (selectedIndex >= 0) {
                                    swiper.slideTo(selectedIndex, 0);
                                }
                            }, 100);
                        }}
                        onSlideChange={handleSlideChange}
                        className="h-full w-full"
                        breakpoints={{
                            768: {
                                spaceBetween: 16,
                                slidesPerView: 5,
                                centeredSlides: true,
                            },
                            0: {
                                spaceBetween: 16,
                                slidesPerView: 5,
                                centeredSlides: true,
                            },
                        }}
                    >
                        {uniqueDates.map((dateObj, index) => (
                            <SwiperSlide key={dateObj.date} className="!flex !h-full !items-center !justify-center">
                                {({ isActive, isPrev, isNext }) => {
                                    // Determine opacity based on slide position
                                    let opacity = 'opacity-30';
                                    if (isActive) opacity = 'opacity-100';
                                    else if (isPrev || isNext) opacity = 'opacity-60';

                                    return (
                                        <SliderButton
                                            date={dateObj.date.toString()}
                                            day={dateObj.day}
                                            isSelected={dateObj.date === viewingDate}
                                            onClick={() => handleDateSelect(dateObj)}
                                            opacity={opacity}
                                            hasSelectedSchedule={selectedScheduleDate === dateObj.date}
                                        />
                                    );
                                }}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* Date display */}
            <div className="flex flex-row items-center justify-center gap-3 transition-all duration-300 md:gap-2 md:pt-2">
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                <div className="justify-start text-center font-['Unbounded'] text-[10px] font-semibold text-white sm:text-[12px]">
                    {uniqueDates.length > 0
                        ? viewingDate
                            ? new Date(uniqueDates.find((d) => d.date === viewingDate)?.date + 'T00:00:00.000Z')?.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                              }) || 'Viewing showtimes'
                            : 'Viewing showtimes'
                        : 'No showtimes available'}
                </div>
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            </div>
        </div>
    );
};

export default DateSlider;
