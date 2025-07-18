import { useState, useEffect, useCallback } from 'react';
import {BackNaviButton} from '@components/buttons/NaviButton';

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
        <button 
            className={`relative w-10 h-10 md:w-12 md:h-12 ${opacity} transition-all duration-300 ease-in-out lg:[transform:translate3d(0,0,0)]`}
            onClick={onClick}
        >
            <div className={`absolute top-0 h-full w-full rounded-full transition-all duration-300 ease-in-out ${
                isSelected 
                    ? 'bg-blue-700/90 scale-105' 
                    : hasSelectedSchedule 
                        ? 'bg-blue-400 hover:scale-100' 
                        : 'bg-blue-700/70 hover:scale-100'
            } outline-3 outline-white/70 md:outline-2 xl:outline-3`} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 -space-y-1 transition-all duration-300 z-10">
                <div className="font-['Unbounded'] text-[7px] font-bold text-white sm:text-[5.5px] lg:text-[7px]">{getDayAbbr(date)}</div>
                <div className="font-['Unbounded'] text-[17px] font-bold text-white">{getDateNum(date)}</div>
            </div>
        </button>
    );
};

const SliderButtonInactive1 = (props) => {
    return <SliderButton {...props} opacity="opacity-60" />;
};

const SliderButtonInactive2 = (props) => {
    return <SliderButton {...props} opacity="opacity-30" />;
};

const DateSlider = ({ viewingDate, onDateSelect, uniqueDates, selectedScheduleDate = null }) => {
    console.log('Rendering DateSlider with uniqueDates:', uniqueDates);
    console.log('Selected viewingDate:', viewingDate);
    console.log('Selected schedule date:', selectedScheduleDate);

    const VISIBLE_DATES = 5; 
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [previewIndex, setPreviewIndex] = useState(null); 
    const [isMouseDown, setIsMouseDown] = useState(false); 
    
    const selectedIndex = uniqueDates.findIndex(date => date.date === viewingDate);
    
    const getTransformOffset = useCallback(() => {
        const isMobile = window.innerWidth < 768; 
        const buttonWidth = isMobile ? 40 : 48; 
        const gap = 16;
        const buttonWithGap = buttonWidth + gap;
        
        const containerCenter = Math.floor(VISIBLE_DATES / 2); 
        const offset = (selectedIndex - containerCenter) * buttonWithGap;
        
        return -offset + dragOffset; 
    }, [selectedIndex, dragOffset]);

    // =============================== HANDLE DRAGGING =============================== 

    const handleDesktopDragStart = useCallback((e) => {
        if (window.innerWidth < 768) return;
        
        setIsMouseDown(true);
        setIsDragging(false); // Reset dragging state
        setDragStart(e.clientX);
        setDragOffset(0);
        setPreviewIndex(null);
        
        // Prevent text selection
        e.preventDefault();
    }, []);

    const handleDesktopDragMove = useCallback((e) => {
        if (window.innerWidth < 768 || !isMouseDown) return;
        
        e.preventDefault();
        const currentX = e.clientX;
        const diff = currentX - dragStart;
        
        // Start dragging if moved more than 5px
        if (!isDragging && Math.abs(diff) > 5) {
            setIsDragging(true);
        }
        
        if (isDragging || Math.abs(diff) > 5) {
            setDragOffset(diff);
            
            // Calculate preview index
            const buttonWidth = 48;
            const gap = 16;
            const buttonWithGap = buttonWidth + gap;
            const draggedPositions = Math.round(-diff / buttonWithGap);
            const newPreviewIndex = Math.max(0, Math.min(uniqueDates.length - 1, selectedIndex + draggedPositions));
            
            setPreviewIndex(newPreviewIndex);
        }
    }, [isMouseDown, isDragging, dragStart, selectedIndex, uniqueDates.length]);

    const handleDesktopDragEnd = useCallback(() => {
        if (window.innerWidth < 768) return;
        
        if (isDragging && previewIndex !== null && previewIndex !== selectedIndex) {
            const newDate = uniqueDates[previewIndex];
            if (newDate) {
                onDateSelect(newDate.date);
            }
        }
        
        // Reset all drag states
        setIsMouseDown(false);
        setIsDragging(false);
        setDragOffset(0);
        setPreviewIndex(null);
    }, [isDragging, previewIndex, selectedIndex, uniqueDates, onDateSelect]);

    // Handle mouse events globally when dragging
    useEffect(() => {
        const handleMouseMove = (e) => handleDesktopDragMove(e);
        const handleMouseUp = () => handleDesktopDragEnd();

        if (isMouseDown && window.innerWidth >= 768) {
            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mouseleave', handleMouseUp); // Handle mouse leaving window
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [isMouseDown, handleDesktopDragMove, handleDesktopDragEnd]);

    // Handle button clicks - prevent click when dragging
    const handleButtonClick = useCallback((dateObj) => {
        if (!isDragging) {
            onDateSelect(dateObj.date);
        }
    }, [isDragging, onDateSelect]);

    return (
        <div className="flex h-auto w-auto flex-col items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-2">
                <div className={`relative scale-90 md:hidden ${selectedIndex > 0 ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}>
                    <BackNaviButton
                        onClick={() => {
                            if (selectedIndex > 0) {
                                const prevDate = uniqueDates[selectedIndex - 1];
                                onDateSelect(prevDate.date);
                            }
                        }}
                    />
                </div>
                
                <div className="relative flex h-16 flex-row items-center justify-center gap-4 md:h-16 py-2 overflow-hidden w-[calc(5*56px)] md:w-[calc(5*64px)]">
                    <div 
                        className={`absolute left-2 md:left-1 flex flex-row items-center gap-4 transition-transform duration-500 ease-in-out ${isDragging ? 'transition-none' : ''}`}
                        style={{
                            transform: `translateX(${getTransformOffset()}px)`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                        onMouseDown={handleDesktopDragStart}
                    >
                        {uniqueDates.map((dateObj, index) => {
                            // Calculate distance from original selected date for opacity
                            const distanceFromSelected = Math.abs(index - selectedIndex);
                            
                            // Check if this is the preview date during drag
                            const isPreviewDate = isDragging && previewIndex === index;
                            const isCurrentSelected = dateObj.date === viewingDate;
                            
                            // Check if this is a neighbor of the preview date during drag
                            const isPreviewNeighbor = isDragging && previewIndex !== null && Math.abs(index - previewIndex) === 1;
                                                
                            let ButtonComponent;
                            if (isPreviewDate || (isCurrentSelected && !isDragging)) {
                                ButtonComponent = SliderButton; // Preview or selected date always full opacity
                            } else if (isCurrentSelected && isDragging) {
                                ButtonComponent = SliderButtonInactive1; // Selected date becomes second lightest when dragging
                            } else if (isPreviewNeighbor && !isCurrentSelected) {
                                ButtonComponent = SliderButtonInactive1; // Neighbors of preview date
                            } else if (distanceFromSelected === 1 && !isDragging) {
                                ButtonComponent = SliderButtonInactive1; // Adjacent to selected when not dragging
                            } else {
                                ButtonComponent = SliderButtonInactive2; // All other dates (including selected neighbors when dragging)
                            }
                            
                            return (
                                <div
                                    key={dateObj.date}
                                    className="flex-shrink-0 transition-all duration-300 ease-in-out"
                                    style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                                >
                                    <ButtonComponent
                                        date={dateObj.date.toString()}
                                        day={dateObj.day}
                                        isSelected={isPreviewDate || (isCurrentSelected && !isDragging)}
                                        onClick={() => handleButtonClick(dateObj)}
                                        hasSelectedSchedule={selectedScheduleDate === dateObj.date}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className={`relative rotate-180 md:hidden scale-90 ${selectedIndex < uniqueDates.length - 1 ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}>
                    <BackNaviButton
                        onClick={() => {
                            if (selectedIndex < uniqueDates.length - 1) {
                                const nextDate = uniqueDates[selectedIndex + 1];
                                onDateSelect(nextDate.date);
                            }
                        }}
                    />
                </div>
            </div>
            
            <div className="hidden flex-row items-center justify-center gap-3 pt-3 md:flex md:gap-2 md:pt-2 transition-all duration-300">
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                <div className="justify-start text-center font-['Unbounded'] text-[10px] font-semibold text-white sm:text-[12px]">
                    {viewingDate ? new Date(uniqueDates.find(d => d.date === viewingDate)?.date + 'T00:00:00.000Z')?.toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }) || 'Viewing showtimes' : 'Viewing showtimes'}
                </div>
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            </div>
        </div>
    );
};

export default DateSlider;