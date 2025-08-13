import React, { useEffect } from 'react';
import IntegratedMap from '@components/display/IntegratedMap';

const CinemaPopUp = ({
    isOpen,
    onClose,
    onCinemaSelect,
    cinemas = [],
    selectedCinema = null,
    getAllCinemas = false,
    getAllCinemasClick = () => {
        console.log('Get all cinemas clicked');
    },
}) => {
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
        <div className={`fixed ${isOpen ? '' : 'hidden'} inset-0 z-1000000000 flex h-full w-full items-center justify-center bg-slate-900/10 backdrop-blur-[20px]`} onClick={handleBackdropClick}>
            <div className="h-autorounded-xl relative flex w-auto flex-col items-center justify-center shadow-xl">
                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute -top-12 -right-2 z-100 aspect-square h-auto rounded-full px-4 font-['Unbounded'] text-4xl font-bold text-white hover:bg-white/40 md:-top-15 lg:-right-12"
                >
                    ×
                </button>
                {/* Cinema Map */}
                <div className="h-auto w-auto">
                    <IntegratedMap
                        onClick={handleBranchSelect}
                        selectedCinema={selectedCinema}
                        isOpen={isOpen}
                        cinemas={cinemas}
                        getAllCinemas={getAllCinemas}
                        getAllCinemasClick={getAllCinemasClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default CinemaPopUp;
