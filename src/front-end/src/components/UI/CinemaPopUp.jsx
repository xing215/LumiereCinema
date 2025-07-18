import React, { useEffect, useRef } from 'react';
import IntegratedMap from '@components/display/IntegratedMap';

const CinemaPopUp = ({ isOpen, onClose, onCinemaSelect, cinemas = [] , selectedCinema = null}) => {

    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

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
    }, [isOpen, onClose, cinemas, onCinemaSelect]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleBranchSelect = (branch) => {
        onCinemaSelect(branch);
        onClose();
        // updateMovieTicket({ branch: branch}); // reset schedule
    };

    return (
        <div 
            className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-50 flex items-center justify-center w-full h-full bg-slate-900/10 backdrop-blur-[20px]`}
            onClick={handleBackdropClick}
        >
            <div className="relative w-auto h-auto bg-white rounded-xl shadow-xl flex flex-col items-center justify-center">
                {/* Close button */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute -top-12 -right-12 z-100 text-white font-['Unbounded'] text-4xl font-bold hover:bg-white/40 rounded-full h-auto px-4 aspect-square"
                >
                    ×
                </button>
                {/* IntegratedMap replaces custom content */}
                <div className="w-full h-full flex items-center justify-center">
                    <IntegratedMap onClick={handleBranchSelect} selectedCinema={selectedCinema} isOpen={isOpen} />
                </div>
            </div>
        </div>
    );
};

export default CinemaPopUp;