import { useState, useEffect } from 'react';

const SliderButton = ({ date, day, isSelected, onClick, opacity = 'opacity-100', hasSelectedSchedule = false, 
    onTouchStart, onTouchMove, onTouchEnd }) => {
    return (
        <button 
            className={`relative w-10 h-10 md:w-12 md:h-12 ${opacity} transition-all duration-300 ease-in-out lg:[transform:translate3d(0,0,0)]`}
            onClick={(e) => {
                // Prevent default behavior on mobile
                if (window.innerWidth < 768) {
                    e.preventDefault();
                }
                onClick();
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className={`absolute top-0 h-full w-full rounded-full transition-all duration-300 ease-in-out ${
                isSelected 
                    ? 'bg-blue-700/90 scale-105' 
                    : hasSelectedSchedule 
                        ? 'bg-blue-400 hover:scale-100' 
                        : 'bg-blue-700/70 hover:scale-100'
            } outline-3 outline-white/70 md:outline-2 xl:outline-3`} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 -space-y-1 transition-all duration-300 z-10">
                <div className="font-['Unbounded'] text-[7px] font-bold text-white sm:text-[5.5px] lg:text-[7px]">{day}</div>
                <div className="font-['Unbounded'] text-[17px] font-bold text-white">{date}</div>
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

const DateSlider = ({ selectedDate, onDateSelect, mockSchedules, selectedScheduleDate = null }) => {
    const VISIBLE_DATES = 5; // Number of dates to show in the slider
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [previewIndex, setPreviewIndex] = useState(null); // For real-time preview
    const [isMouseDown, setIsMouseDown] = useState(false); // Track if mouse is down but not yet dragging
    
    // Generate all available dates based on schedule data
    const generateAllDates = () => {
        // Extract unique dates from schedule data (only dates that have schedules)
        const uniqueDates = [...new Set(mockSchedules.map(schedule => {
            return new Date(schedule.startTime).toISOString().split('T')[0];
        }))].sort();

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        return uniqueDates.map(dateString => {
            const currentDate = new Date(dateString + 'T00:00:00.000Z');
            
            return {
                date: currentDate.getDate(),
                day: dayNames[currentDate.getDay()],
                fullDate: dateString, // YYYY-MM-DD format
                displayDate: currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                scheduleCount: mockSchedules.filter(schedule => 
                    new Date(schedule.startTime).toISOString().split('T')[0] === dateString
                ).length
            };
        });
    };

    const allDates = generateAllDates();
    
    // Find the index of the selected date
    const selectedIndex = allDates.findIndex(date => date.fullDate === selectedDate);
    
    // Calculate transform offset to center the selected date
    const getTransformOffset = () => {
        // Responsive button width calculations
        const isMobile = window.innerWidth < 768; // md breakpoint
        const buttonWidth = isMobile ? 40 : 48; // w-10 = 40px for mobile, md:w-12 = 48px for desktop
        const gap = 16; // gap-4 = 16px
        const buttonWithGap = buttonWidth + gap;
        
        // Calculate the center position of the container (in button positions)
        const containerCenter = Math.floor(VISIBLE_DATES / 2); // This should be 2 for 5 buttons (0,1,2,3,4)
        
        // Calculate offset needed to move selected date to center
        // This will work even when there aren't enough buttons on either side
        const offset = (selectedIndex - containerCenter) * buttonWithGap;
        
        return -offset + dragOffset; // Add drag offset for real-time feedback
    };


    // Desktop (mouse) drag handlers
    const handleDesktopDragStart = (e) => {
        if (window.innerWidth < 768) return;
        setIsMouseDown(true);
        setDragStart(e.clientX);
        setDragOffset(0);
    };

    const handleDesktopDragMove = (e) => {
        if (window.innerWidth < 768) return;
        if (!isMouseDown && !isDragging) return;
        e.preventDefault();
        const currentX = e.clientX;
        const diff = currentX - dragStart;
        if (!isDragging && Math.abs(diff) > 5) setIsDragging(true);
        if (isDragging) {
            setDragOffset(diff);
            const buttonWidth = 48;
            const gap = 16;
            const buttonWithGap = buttonWidth + gap;
            const draggedPositions = Math.round(-diff / buttonWithGap);
            const newPreviewIndex = Math.max(0, Math.min(allDates.length - 1, selectedIndex + draggedPositions));
            setPreviewIndex(newPreviewIndex);
        }
    };

    const handleDesktopDragEnd = () => {
        if (window.innerWidth < 768) return;
        if (!isMouseDown && !isDragging) return;
        if (isDragging) {
            const buttonWidth = 48;
            const gap = 16;
            const buttonWithGap = buttonWidth + gap;
            const draggedPositions = Math.round(-dragOffset / buttonWithGap);
            const newIndex = Math.max(0, Math.min(allDates.length - 1, selectedIndex + draggedPositions));
            if (newIndex !== selectedIndex && allDates[newIndex]) {
                const newDate = allDates[newIndex];
                onDateSelect(newDate.fullDate, newDate.displayDate);
            }
        }
        setIsMouseDown(false);
        setIsDragging(false);
        setDragOffset(0);
        setPreviewIndex(null);
    };

    // Mobile (touch) drag handlers
    const handleMobileDragStart = (e) => {
        if (window.innerWidth >= 768) return;
        setIsMouseDown(true);
        setDragStart(e.touches[0].clientX);
        setDragOffset(0);
    };

    const handleMobileDragMove = (e) => {
        if (window.innerWidth >= 768) return;
        if (!isMouseDown && !isDragging) return;
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const diff = currentX - dragStart;
        if (!isDragging && Math.abs(diff) > 5) setIsDragging(true);
        if (isDragging) {
            setDragOffset(diff);
            const buttonWidth = 40;
            const gap = 16;
            const buttonWithGap = buttonWidth + gap;
            const draggedPositions = Math.round(-diff / buttonWithGap);
            const newPreviewIndex = Math.max(0, Math.min(allDates.length - 1, selectedIndex + draggedPositions));
            setPreviewIndex(newPreviewIndex);
        }
    };

    const handleMobileDragEnd = () => {
        if (window.innerWidth >= 768) return;
        if (!isMouseDown && !isDragging) return;
        if (isDragging) {
            const buttonWidth = 40;
            const gap = 16;
            const buttonWithGap = buttonWidth + gap;
            const draggedPositions = Math.round(-dragOffset / buttonWithGap);
            const newIndex = Math.max(0, Math.min(allDates.length - 1, selectedIndex + draggedPositions));
            if (newIndex !== selectedIndex && allDates[newIndex]) {
                const newDate = allDates[newIndex];
                onDateSelect(newDate.fullDate, newDate.displayDate);
            }
        }
        setIsMouseDown(false);
        setIsDragging(false);
        setDragOffset(0);
        setPreviewIndex(null);
    };


    // Add event listeners for mouse/touch events
    useEffect(() => {
        // Desktop
        const handleMouseMove = (e) => handleDesktopDragMove(e);
        const handleMouseUp = () => handleDesktopDragEnd();
        // Mobile
        const handleTouchMove = (e) => handleMobileDragMove(e);
        const handleTouchEnd = () => handleMobileDragEnd();

        if (isMouseDown || isDragging) {
            if (window.innerWidth >= 768) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            } else {
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd);
            }
        }

        return () => {
            if (window.innerWidth >= 768) {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            } else {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [isMouseDown, isDragging, dragStart, selectedIndex, allDates, onDateSelect]);

    return (
        <div className="flex h-auto w-auto flex-col items-center justify-center">
            <div className="relative flex h-16 flex-row items-center justify-center gap-4 md:h-16 py-2 overflow-hidden w-[calc(5*56px)] md:w-[calc(5*64px)]">
                <div 
                    className={`absolute left-2 md:left-1 flex flex-row items-center gap-4 transition-transform duration-500 ease-in-out ${isDragging ? 'transition-none' : ''}`}
                    style={{
                        transform: `translateX(${getTransformOffset()}px)`,
                        touchAction: window.innerWidth < 768 ? 'none' : 'none' // Always prevent default for drag
                    }}
                    // Only attach mouse events on desktop
                    {...(window.innerWidth >= 768 ? { onMouseDown: handleDesktopDragStart } : {})}
                    onTouchStart={handleMobileDragStart}
                >
                    {allDates.map((dateObj, index) => {
                        // Calculate distance from original selected date for opacity
                        const distanceFromSelected = Math.abs(index - selectedIndex);
                        
                        // Check if this is the preview date during drag
                        const isPreviewDate = isDragging && previewIndex === index;
                        const isCurrentSelected = dateObj.fullDate === selectedDate;
                        
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
                                key={dateObj.fullDate}
                                className="flex-shrink-0 transition-all duration-300 ease-in-out"
                            >
                                <ButtonComponent
                                    date={dateObj.date.toString()}
                                    day={dateObj.day}
                                    isSelected={isPreviewDate || (isCurrentSelected && !isDragging)}
                                    onClick={() => {
                                        // Only allow clicks if not currently dragging
                                        if (!isDragging) {
                                            onDateSelect(dateObj.fullDate, dateObj.displayDate);
                                        }
                                    }}
                                    hasSelectedSchedule={selectedScheduleDate === dateObj.fullDate}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="hidden flex-row items-center justify-center gap-3 pt-3 md:flex md:gap-2 md:pt-2 transition-all duration-300">
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                <div className="justify-start text-center font-['Unbounded'] text-[10px] font-semibold text-white sm:text-[12px]">
                    {selectedDate ? allDates.find(d => d.fullDate === selectedDate)?.displayDate || 'Viewing showtimes' : 'Viewing showtimes'}
                </div>
                <div className="h-[3px] w-3 bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            </div>
        </div>
    );
};

export default DateSlider;