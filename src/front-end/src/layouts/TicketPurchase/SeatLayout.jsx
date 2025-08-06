// ================================ IMPORTS ================================
import screen from '@assets/img/Screen.svg';
import { useEffect, useRef, useState } from 'react';

// ================================ SEAT COMPONENTS ================================

export const Seats = ({ seatColor, isTaken = false, isSelected, onClick, seatCol, seatRow, canCursor = true, isHidden = false }) => {
    const seatSize = 'w-[' + Math.round(100 / (seatCol > seatRow ? seatCol : seatRow)).toString() + '%]';
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div 
            className={`${seatSize} min-w-[30px] ${isHidden ? 'opacity-0' : 'opacity-100'} group aspect-square relative flex flex-col gap-[10%] ${isTaken || !canCursor || isHidden ? 'pointer-events-none' : 'cursor-pointer'}`}
            onClick={isHidden ? undefined : handleClick}
        >
            <div className={`h-full z-1 md:h-[70%] w-full relative cursor-pointer transition-colors duration-200 ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor} rounded-sm`} />
            <div className={`h-[20%] z-1 w-full relative hidden md:block cursor-pointer transition-colors duration-200 ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor} rounded-sm`} />
        </div>
    );
};

export const CoupleSeat = ({ seatColor, isSelected, onClick, seatRow, seatCol, isTaken, canCursor = true, isHidden=false }) => {
    const seatSize = 'w-[' + Math.round(100 / (seatCol > seatRow ? seatCol : seatRow) * 2).toString() + '%]';
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    }; 

    return (
        <div 
            className={`${seatSize} min-w-[68px] ${isHidden ? 'opacity-0' : 'opacity-100'} group relative flex flex-row gap-2 ${isTaken || !canCursor || isHidden ? 'pointer-events-none' : 'cursor-pointer'}`}
            onClick={isHidden ? undefined : handleClick}
        >
            <Seats seatColor={seatColor} isSelected={isSelected} seatRow={seatRow} seatCol={seatCol} isTaken={isTaken} canCursor={canCursor} />
            <Seats seatColor={seatColor} isSelected={isSelected} seatRow={seatRow} seatCol={seatCol} isTaken={isTaken} canCursor={canCursor} />
            <div className={`absolute inset-0 flex z-0 r-[50%] md:h-[55%] w-5 h-[75%] top-1 mx-auto items-center transition-colors justify-center ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor}`} />
        </div>
    );
};

// ================================ MINI MAP COMPONENT ================================

const MiniMap = ({ seatMap, containerRef, contentRef, needsScrolling, onNavigate, schedule }) => {
    const miniMapRef = useRef();
    const [miniMapDimensions, setMiniMapDimensions] = useState({ width: 0, height: 0 });
    const [viewportRect, setViewportRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [hideMiniMap, setHideMiniMap] = useState(false);
    const rowKeys = Object.keys(seatMap).sort();

    useEffect(() => {
        if (!needsScrolling || !containerRef.current || !contentRef.current) return;

        const updateMiniMap = () => {
            if (!containerRef.current || !contentRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const contentRect = contentRef.current.getBoundingClientRect();
            
            // Calculate mini-map dimensions (max 150px wide, maintain aspect ratio)
            const maxWidth = 150;
            const aspectRatio = contentRect.width / contentRect.height;
            const miniWidth = Math.min(maxWidth, contentRect.width * 0.2);
            const miniHeight = miniWidth / aspectRatio;
            setMiniMapDimensions({ width: miniWidth, height: miniHeight });

            // Calculate viewport rectangle position and size on mini-map
            const scaleX = miniWidth / containerRef.current.scrollWidth;
            const scaleY = miniHeight / containerRef.current.scrollHeight;
            const viewportWidth = containerRect.width * scaleX;
            const viewportHeight = containerRect.height * scaleY;
            const viewportX = containerRef.current.scrollLeft * scaleX;
            const viewportY = containerRef.current.scrollTop * scaleY;

            setViewportRect({
                x: viewportX,
                y: viewportY,
                width: viewportWidth,
                height: viewportHeight
            });

            // Hide minimap if viewport covers most of the content
            const coverageX = viewportWidth / miniWidth;
            const coverageY = viewportHeight / miniHeight;
            setHideMiniMap(coverageX > 0.9 && coverageY > 0.9);
        };

        updateMiniMap();
        const interval = setInterval(updateMiniMap, 16);
        
        // Listen to scroll events
        const container = containerRef.current;
        container.addEventListener('scroll', updateMiniMap);
        
        return () => {
            clearInterval(interval);
            container.removeEventListener('scroll', updateMiniMap);
        };
    }, [needsScrolling, containerRef, contentRef]);

    const handleMiniMapClick = (e) => {
        if (!containerRef.current || !miniMapRef.current) return;

        const miniMapRect = miniMapRef.current.getBoundingClientRect();
        const clickX = e.clientX - miniMapRect.left;
        const clickY = e.clientY - miniMapRect.top;

        // Convert minimap coordinates to scroll position
        const scaleX = containerRef.current.scrollWidth / miniMapDimensions.width;
        const scaleY = containerRef.current.scrollHeight / miniMapDimensions.height;
        
        const newScrollLeft = clickX * scaleX - containerRef.current.clientWidth / 2;
        const newScrollTop = clickY * scaleY - containerRef.current.clientHeight / 2;

        containerRef.current.scrollTo({
            left: Math.max(0, Math.min(newScrollLeft, containerRef.current.scrollWidth - containerRef.current.clientWidth)),
            top: Math.max(0, Math.min(newScrollTop, containerRef.current.scrollHeight - containerRef.current.clientHeight)),
            behavior: 'smooth'
        });
    };

    if (!needsScrolling || hideMiniMap) return null;

    return (
        <div className="absolute top-[10%] right-0 bg-black/80 p-2 rounded-lg z-40 border border-gray-600 backdrop-blur-lg">
            <div 
                ref={miniMapRef}
                className="relative bg-gray-800 rounded cursor-pointer overflow-hidden"
                style={{ 
                    width: miniMapDimensions.width, 
                    height: miniMapDimensions.height 
                }}
                onClick={handleMiniMapClick}
            >
                {/* Mini seat layout */}
                <div className="absolute inset-0 flex flex-col justify-center items-center">                    
                    {/* Mini seats */}
                    <div className="flex flex-row gap-0.5 text-[6px]">
                        {/* Row letters */}
                        <div className="flex flex-col gap-0.5">
                            {rowKeys.map((rowKey) => (
                                <div key={rowKey} className="w-2 h-1.5 flex items-center justify-center text-white text-[4px]">
                                    {rowKey}
                                </div>
                            ))}
                        </div>
                        {/* Seats grid */}
                        <div className="flex flex-col gap-0.5">
                            {rowKeys.map((rowKey) => (
                                <div key={rowKey} className="flex flex-row gap-0.5 h-1.5">
                                    {(() => {
                                        const seats = seatMap[rowKey];
                                        const seatElements = [];
                                        let i = 0;
                                        while (i < seats.length) {
                                            const current = seats[i];
                                            const next = seats[i + 1];
                                            const isTaken = (current.status === 'occupied' || current.status === 'holding');
                                            const isHidden = current.isHidden;
                                            const nextIsHidden = next && next.isHidden;
                                            const nextIsTaken = next && (next.status === 'occupied' || next.status === 'holding');
                                            if (
                                                current.category.toLowerCase() === 'couple' &&
                                                next &&
                                                next.category.toLowerCase() === 'couple'
                                            ) {
                                                seatElements.push(
                                                    <div
                                                        key={current.seatNumber + '-' + next.seatNumber}
                                                        className={`w-[14px] h-1.5 rounded-[1px] ${isHidden && nextIsHidden ? 'opacity-0' : 'opacity-100'} ${isTaken || nextIsTaken ? 'bg-gray-400' : 'bg-yellow-400'}`}
                                                    />
                                                );
                                                i += 2;
                                            } else {
                                                seatElements.push(
                                                    <div
                                                        key={current.seatNumber}
                                                        className={`w-1.5 h-1.5 rounded-[1px] ${isHidden ? 'opacity-0' : 'opacity-100'} ${isTaken ? 'bg-gray-400' : (current.category.toLowerCase() === 'couple' ? 'bg-yellow-400' : 'bg-blue-400')}`}
                                                    />
                                                );
                                                i += 1;
                                            }
                                        }
                                        return seatElements;
                                    })()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Viewport indicator */}
                <div
                    className="absolute border-2 border-pink-400 bg-pink-400/20 pointer-events-none"
                    style={{
                        left: viewportRect.x,
                        top: viewportRect.y,
                        width: viewportRect.width,
                        height: viewportRect.height,
                    }}
                />
            </div>
        </div>
    );
};

// ================================ MAIN SEAT LAYOUT COMPONENT ================================

const SeatLayout = ({ 
    schedule, 
    selectedSeats, 
    seatMap = {}, 
    onClick = () => { console.log('Seat clicked'); }, 
    loading, 
    clearSessionLoading 
}) => {
    const containerRef = useRef();
    const contentRef = useRef();
    const [needsScrolling, setNeedsScrolling] = useState(false);

    const rowKeys = Object.keys(seatMap).sort();

    // Check if scrolling is needed
    useEffect(() => {
        const checkSize = () => {
            if (containerRef.current && contentRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const contentRect = contentRef.current.getBoundingClientRect();
                
                const exceedsWidth = contentRect.width > containerRect.width;
                const exceedsHeight = contentRect.height > containerRect.height;
                
                setNeedsScrolling(exceedsWidth || exceedsHeight);
            }
        };

        const timeout = setTimeout(checkSize, 1);
        window.addEventListener('resize', checkSize);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', checkSize);
        };
    }, [JSON.stringify(seatMap), loading, clearSessionLoading]);

    // Reset scrolling when seatMap changes
    useEffect(() => {
        setNeedsScrolling(false);
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, [JSON.stringify(seatMap)]);

    return (
        <div className="relative flex flex-col items-center w-full h-full">
            {/* Screen Image */}
            <img 
                src={screen}
                alt="Seat Layout"
                className="w-[80%] h-auto object-contain py-3 relative z-20"
            />
            
            {/* Seat Layout Container */}
            <div 
                ref={containerRef}
                className={`w-full h-full rounded-xl relative ${needsScrolling ? 'overflow-auto ring-1 ring-white no-scrollbar' : 'overflow-hidden flex justify-center items-center'}`}
            >
                {loading && !clearSessionLoading ? (
                    <div className="md:text-md h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white mx-2">
                        • • •
                    </div>
                ) : (
                    <div 
                        ref={contentRef}
                        className={`flex flex-row rounded-sm gap-2 z-10 min-w-max ${needsScrolling ? 'p-8' : ''}`}
                    >
                        {/* Row Labels Column */}
                        <div className="flex flex-col gap-2 min-w-[40px] h-full">
                            {rowKeys.map((rowKey) => (
                                <span
                                    key={rowKey}
                                    className={`font-['Unbounded'] h-[${(seatMap[rowKey].length > rowKeys.length ? 100/seatMap[rowKey].length : 100/rowKeys.length)}%] min-h-[30px] text-xl font-bold w-full flex items-center justify-center text-white`}
                                >
                                    {rowKey}
                                </span>
                            ))}
                        </div>
                        
                        {/* Seats Grid */}
                        <div className="flex flex-col gap-2 h-full">
                            {rowKeys.map((rowKey, rowIndex) => (
                                <div key={rowKey} className="flex flex-row items-center gap-2">
                                    {(() => {
                                        const seats = seatMap[rowKey];
                                        const seatElements = [];
                                        let i = 0;
                                        
                                        while (i < seats.length) {
                                            const current = seats[i];
                                            const next = seats[i + 1];

                                            // Check for couple seat: both VIP
                                            if (
                                                current.category.toLowerCase() === 'couple' &&
                                                next &&
                                                next.category.toLowerCase() === 'couple'
                                            ) {
                                                seatElements.push(
                                                    <CoupleSeat
                                                        key={current.seatNumber + '-' + next.seatNumber}
                                                        seatColor="bg-yellow-400 group-hover:bg-yellow-500"
                                                        isTaken={current.status === 'occupied' || current.status === 'holding'}
                                                        isSelected={selectedSeats.includes(current.seatNumber) || selectedSeats.includes(next.seatNumber)}
                                                        onClick={() => onClick?.([current.seatNumber, next.seatNumber])}
                                                        seatCol={seats.length}
                                                        seatRow={rowKeys.length}
                                                        isHidden={current.isHidden || next.isHidden}
                                                    />
                                                );
                                                i += 2;
                                            } else {
                                                seatElements.push(
                                                    <Seats
                                                        key={current.seatNumber}
                                                        seatColor={current.category.toLowerCase() === 'couple' ? 'bg-yellow-400 group-hover:bg-yellow-500' : 'bg-blue-400 group-hover:bg-blue-500'}
                                                        isTaken={current.status === 'occupied' || current.status === 'holding'}
                                                        isHidden={current.isHidden}
                                                        isSelected={selectedSeats.includes(current.seatNumber)}
                                                        onClick={() => onClick?.(current.seatNumber)}
                                                        seatCol={seats.length}
                                                        seatRow={rowKeys.length}
                                                    />
                                                );
                                                i += 1;
                                            }
                                        }
                                        return seatElements;
                                    })()}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mini-map */}
            <MiniMap
                seatMap={seatMap}
                containerRef={containerRef}
                contentRef={contentRef}
                needsScrolling={needsScrolling}
                schedule={schedule}
            />
        </div>
    );
}

export default SeatLayout;