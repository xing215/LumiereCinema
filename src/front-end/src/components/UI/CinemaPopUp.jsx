import React, { useEffect } from 'react';
import MapView from '../../assets/sample/Maps.png';

const CinemaPopUp = ({ isOpen, onClose, onCinemaSelect, cinemas = [] }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-slate-900/10 backdrop-blur-[20px]"
            onClick={handleBackdropClick}
        >
            <div className="w-[1442px] h-[747px] relative overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 text-2xl"
                >
                    ×
                </button>
            <div className="w-[1442px] h-[617px] left-0 top-0 absolute overflow-hidden">
                <div className="w-[1069px] h-[547px] left-[188px] top-[68px] absolute rounded-xl overflow-hidden">
                    <img
                        className="w-[1604.23px] h-[643px] left-[-312px] top-[-48px] absolute"
                        src={MapView}
                        alt="Cinema"
                    />
                </div>
                {/* Blurred colored circles */}
                <div className="w-64 h-[515px] left-[203px] top-[84px] absolute rounded-xl overflow-hidden">
                    <div className="w-72 h-[547px] left-[-10px] top-[-16px] absolute bg-black rounded-xl" />
                    <div className="w-44 h-44 left-[-124px] top-[74px] absolute mix-blend-lighten bg-pink-400/60 rounded-full blur-[100px]" />
                    <div className="left-[15px] top-[34px] absolute text-center justify-start text-white text-[10px] font-normal font-['Unbounded']">
                        Farthest distance:
                    </div>
                    <div className="w-28 h-4 left-[132px] top-[31px] absolute bg-zinc-300/70 rounded-xl" />
                    <div className="w-44 h-44 left-[214px] top-[250px] absolute mix-blend-lighten bg-amber-300/60 rounded-full blur-[100px]" />
                    <div className="w-56 h-56 left-[138px] top-[338px] absolute mix-blend-lighten bg-sky-400/60 rounded-full blur-[100px]" />
                    <div className="w-44 h-44 left-[-3px] top-[266px] absolute mix-blend-lighten bg-purple-600/60 rounded-full blur-[100px]" />
                </div>
                {/* Cinema list */}
                <div className="w-60 h-96 left-[214px] top-[141px] absolute inline-flex flex-col justify-start items-center gap-3.5 overflow-hidden">
                    {cinemas.map((cinema, idx) => (
                        <button 
                            key={idx} 
                            className="w-60 h-12 relative rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => {
                                if (onCinemaSelect) {
                                    onCinemaSelect(cinema);
                                }
                                onClose();
                            }}
                        >
                            <div className="w-60 h-12 left-0 top-0 absolute mix-blend-color-dodge bg-zinc-300/30 rounded-xl hover:bg-zinc-300/50" />
                            <div className="left-[20px] top-[10px] absolute justify-start text-white text-base font-bold font-['Libre_Franklin']">
                                {cinema.name}
                            </div>
                            <div className="left-[20px] top-[31px] absolute justify-start text-white text-[10px] font-normal font-['Libre_Franklin']">
                                {cinema.distance} • {cinema.showings}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            </div>
        </div>
    );
};

export default CinemaPopUp;