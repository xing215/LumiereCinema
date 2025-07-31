import screen from '@assets/img/Screen.svg';
import { use, useEffect, useRef, useState } from 'react';

export const Seats = ({  seatColor, isTaken = false, isSelected, onClick, seatCol, seatRow, canCursor = true }) => {

    const seatSize = 'w-[' + Math.round(100 / (seatCol > seatRow ? seatCol : seatRow)).toString() + '%]';
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className={`${seatSize} min-w-[30px] group aspect-square relative flex flex-col gap-[10%] ${isTaken || !canCursor ? 'pointer-events-none' : 'cursor-pointer'}`}
        onClick={handleClick}>
            <div className={`h-full z-1 md:h-[70%] w-full relative cursor-pointer transition-colors duration-200 ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor} rounded-sm`}/>
            <div className={`h-[20%] z-1 w-full relative hidden md:block cursor-pointer transition-colors duration-200 ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor} rounded-sm`}/>
        </div>
    );
}

export const CoupleSeat = ({ seatColor, isSelected, onClick, seatRow, seatCol, isTaken, canCursor=true }) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    }; 

    const seatSize = 'w-[' + Math.round(100 / (seatCol > seatRow ? seatCol : seatRow)*2).toString() + '%]';
    const seatSizeforsmall = 'w-[' + Math.round(100 / (seatCol > seatRow ? seatCol : seatRow)).toString() + '%]';


    return (
        <div className={`${seatSize} min-w-[68px] group relative flex flex-row gap-2 ${isTaken || !canCursor ? 'pointer-events-none' : 'cursor-pointer'}`}
        onClick={handleClick}>
            <Seats seatColor={seatColor} isSelected={isSelected} seatRow={seatRow} seatCol={seatCol} isTaken={isTaken} canCursor={canCursor}/>
            <Seats seatColor={seatColor} isSelected={isSelected} seatRow={seatRow} seatCol={seatCol} isTaken={isTaken} canCursor={canCursor} />
            <div className={`absolute inset-0 flex z-0 r-[50%] md:h-[55%] w-5 h-[75%] top-1 mx-auto items-center transition-colors justify-center ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor}`}/>
        </div>
    );
}

const MiniMap = ({ seatMap, containerRef, contentRef, transform, needsPanning, onClick, schedule }) => {
    const miniMapRef = useRef();
    const [miniMapDimensions, setMiniMapDimensions] = useState({ width: 0, height: 0 });
    const [viewportRect, setViewportRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [hideMiniMap, setHideMiniMap] = useState(false);
    const rowKeys = Object.keys(seatMap).sort();

    useEffect(() => {
        if (!needsPanning || !containerRef.current || !contentRef.current) return;

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
            const scaleX = miniWidth / contentRect.width;
            const scaleY = miniHeight / contentRect.height;
            const viewportWidth = containerRect.width * scaleX;
            const viewportHeight = containerRect.height * scaleY;
            const viewportX = -transform.x * scaleX;
            const viewportY = -transform.y * scaleY;

            setViewportRect({
                x: viewportX,
                y: viewportY,
                width: viewportWidth,
                height: viewportHeight
            });

            // Hide minimap if viewport is at top-right corner
            const epsilon = 2; // px tolerance
            const atTopRight = Math.abs(viewportX - (miniWidth - viewportWidth)) < epsilon && Math.abs(viewportY) < epsilon;
            setHideMiniMap(atTopRight);
        };

        updateMiniMap();
        const interval = setInterval(updateMiniMap, 16); // ~60fps
        return () => clearInterval(interval);
    }, [transform, needsPanning, containerRef, contentRef]);

    if (!needsPanning || hideMiniMap) return null;

    return (
        <div className="absolute top-[10%] right-0 bg-black/80 p-2 rounded-lg z-40 border border-gray-600 backdrop-blur-lg">
            <div 
                ref={miniMapRef}
                className="relative bg-gray-800 rounded cursor-pointer overflow-hidden"
                style={{ 
                    width: miniMapDimensions.width, 
                    height: miniMapDimensions.height 
                }}
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
                                            const nextIsTaken = next && (next.status === 'occupied' || next.status === 'holding');
                                            if (
                                                current.category === 'VIP' &&
                                                next &&
                                                next.category === 'VIP'
                                            ) {
                                                seatElements.push(
                                                    <div
                                                        key={current.seatNumber + '-' + next.seatNumber}
                                                        className={`w-[14px] h-1.5 rounded-[1px] ${isTaken || nextIsTaken ? 'bg-gray-400' : 'bg-yellow-400'}`}
                                                    />
                                                );
                                                i += 2;
                                            } else {
                                                seatElements.push(
                                                    <div
                                                        key={current.seatNumber}
                                                        className={`w-1.5 h-1.5 rounded-[1px] ${isTaken ? 'bg-gray-400' : (current.category === 'VIP' ? 'bg-yellow-400' : 'bg-blue-400')}`}
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

const SeatLayout = ({ schedule, selectedSeats, seatMap = {}, onClick = () => { console.log('Seat clicked'); } , loading, clearSessionLoading }) => {
    const containerRef = useRef();
    const contentRef = useRef();
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [needsPanning, setNeedsPanning] = useState(false);

    // Get ordered rows
    const rowKeys = Object.keys(seatMap).sort();

    // Only center content once when panning is first needed
    const hasCenteredRef = useRef(false);
    useEffect(() => {
        const checkSize = () => {
            if (containerRef.current && contentRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const contentRect = contentRef.current.getBoundingClientRect();
                const contentStyle = window.getComputedStyle(contentRef.current);
                const paddingLeft = parseFloat(contentStyle.paddingLeft) || 0;
                const paddingRight = parseFloat(contentStyle.paddingRight) || 0;
                const paddingTop = parseFloat(contentStyle.paddingTop) || 0;
                const paddingBottom = parseFloat(contentStyle.paddingBottom) || 0;
                const effectiveContentWidth = contentRect.width - (paddingLeft + paddingRight);
                const effectiveContentHeight = contentRect.height - (paddingTop + paddingBottom);
                const exceedsWidth = effectiveContentWidth > containerRect.width;
                const exceedsHeight = effectiveContentHeight > containerRect.height;
                setNeedsPanning(exceedsWidth || exceedsHeight);
                // Center only once when panning is first needed and not dragging
                if ((exceedsWidth || exceedsHeight) && !hasCenteredRef.current && !isDragging) {
                    const centerX = (containerRect.width - effectiveContentWidth) / 2;
                    const centerY = (containerRect.height - effectiveContentHeight) / 2;
                    setTransform(prev => ({
                        ...prev,
                        x: Math.min(0, centerX),
                        y: Math.min(0, centerY)
                    }));
                    hasCenteredRef.current = true;
                }
                // Reset hasCenteredRef and seat position if no panning needed
                if (!(exceedsWidth || exceedsHeight) && hasCenteredRef.current) {
                    hasCenteredRef.current = false;
                    setTransform(prev => ({
                        ...prev,
                        x: 0,
                        y: 0
                    }));
                }
            }
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => {
            window.removeEventListener('resize', checkSize);
        };
    }, [JSON.stringify(seatMap)]);

    // Mouse/Touch event handlers for panning
    const handleStart = (clientX, clientY) => {
        if (!needsPanning) return;
        setIsDragging(true);
        setDragStart({
            x: clientX - transform.x,
            y: clientY - transform.y
        });
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging || !needsPanning) return;
        
        const newX = clientX - dragStart.x;
        const newY = clientY - dragStart.y;
        
        // Get container and content bounds for limiting pan
        if (containerRef.current && contentRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const contentRect = contentRef.current.getBoundingClientRect();
            
            const maxX = 0;
            const minX = containerRect.width - contentRect.width;
            const maxY = 0;
            const minY = containerRect.height - contentRect.height;
            
            setTransform(prev => ({
                ...prev,
                x: Math.max(minX, Math.min(maxX, newX)),
                y: Math.max(minY, Math.min(maxY, newY))
            }));
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    // Mouse events
    const handleMouseDown = (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // Touch events
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        }
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    // Handle mini-map navigation
    const handleMiniMapNavigation = (newTransform) => {
        setTransform(prev => ({
            ...prev,
            x: newTransform.x,
            y: newTransform.y
        }));
    };

    // Add global event listeners for drag
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragStart, transform]);

    

    return (
        <div className="relative flex flex-col items-center w-full h-full">
            <img 
                src={screen}
                alt="Seat Layout"
                className="w-[80%] h-auto object-contain py-3 relative z-20"
            />
            <div 
                ref={containerRef}
                className={`w-full h-full overflow-hidden  rounded-xl relative ${needsPanning ? 'cursor-grab active:cursor-grabbing ring-1 ring-white' : ' flex justify-center items-center'}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {loading&&!clearSessionLoading ? (
                    <div className=" md:text-md h-auto items-center justify-center  font-['Unbounded'] text-base font-black text-white mx-2">
                        • • •
                    </div>
                ) : (
                    <div 
                        ref={contentRef}
                        className={`flex flex-row rounded-sm gap-2 z-10 min-w-max ${needsPanning ? ' p-8' : ''}`}
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px)`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                    >
                        {/* Row letters column */}
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
                        {/* Seats grid */}
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

                                            // Check for couple seat: both VIP and both have isCouple true
                                            if (
                                                current.category === 'VIP' &&
                                                next &&
                                                next.category === 'VIP'
                                            ) {
                                                seatElements.push(
                                                    <CoupleSeat
                                                        key={current.seatNumber + '-' + next.seatNumber}
                                                        seatColor="bg-yellow-400 group-hover:bg-yellow-500"
                                                        isTaken={ (current.status === 'occupied' || current.status === 'holding')}
                                                        isSelected={selectedSeats.includes(current.seatNumber) || selectedSeats.includes(next.seatNumber)}
                                                        onClick={() => onClick?.([current.seatNumber, next.seatNumber])}
                                                        seatCol={seats.length}
                                                        seatRow={rowKeys.length}
                                                    />
                                                );
                                                i += 2;
                                            } else {
                                                seatElements.push(
                                                    <Seats
                                                        key={current.seatNumber}
                                                        seatColor={current.category === 'VIP' ? 'bg-yellow-400 group-hover:bg-yellow-500' : 'bg-blue-400 group-hover:bg-blue-500'}
                                                        isTaken={ (current.status === 'occupied' || current.status === 'holding')}
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

            {/* Mini-map - only show when panning is needed */}
            <MiniMap
                seatMap={seatMap}
                containerRef={containerRef}
                contentRef={contentRef}
                transform={transform}
                needsPanning={needsPanning}
                onClick={handleMiniMapNavigation}
                schedule={schedule}
            />
            
        </div>
    );
}

export default SeatLayout;