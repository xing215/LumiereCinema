import React, { useEffect } from 'react';
import IntegratedMap from '@components/display/IntegratedMap';

const CinemaPopUp = ({ isOpen, onClose, onCinemaSelect, cinemas = [] , selectedCinema = null}) => {

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            // Reset overflow when popup closes
            document.body.style.overflow = '';
        }

        // Cleanup function to ensure overflow is reset
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = ''; // Reset overflow on unmount
        };
    }, [isOpen, onClose]);

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
            className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-1000000000 flex items-center justify-center w-full h-full bg-slate-900/10 backdrop-blur-[20px]`}
            onClick={handleBackdropClick}
        >
            <div className="relative w-auto h-auto bg-white rounded-xl shadow-xl flex flex-col items-center justify-center">
                {/* Close button */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute -top-12 -right-2 md:-top-15 lg:-right-12 z-100 text-white font-['Unbounded'] text-4xl font-bold hover:bg-white/40 rounded-full h-auto px-4 aspect-square"
                >
                    ×
                </button>
                {/* Cinema Map */}
                <div className="w-auto h-auto flex items-center justify-center overflow-hidden">
                    <IntegratedMap onClick={handleBranchSelect} selectedCinema={selectedCinema} isOpen={isOpen} cinemas = {cinemas} />
                </div>
            </div>
        </div>
    );
};

export default CinemaPopUp;