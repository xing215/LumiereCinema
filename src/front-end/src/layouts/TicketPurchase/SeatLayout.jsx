// ================================ IMPORTS ================================
import screen from '@assets/img/Screen.svg';
import { useEffect, useRef, useState } from 'react';

// ================================ SEAT COMPONENTS ================================

// Fallback prices based on seat category
const FALLBACK_PRICES = {
    normal: { regular: 80000, discounted: 60000 },
    vip: { regular: 180000, discounted: 135000 },
    couple: { regular: 80000, discounted: 60000 },
};

const getSeatPrice = (seat, isDiscounted = false, getBoth = false) => {
    // Return the seat's price if it exists, otherwise use fallback based on category
    const category = seat.category?.toLowerCase() || 'normal';
    const priceStructure = FALLBACK_PRICES[category] || FALLBACK_PRICES['normal'];

    if (seat.price && seat.price > 0) {
        // If seat has custom price, apply discount percentage if needed
        return isDiscounted ? seat.price.discounted : seat.price.regular;
    }

    if (getBoth) {
        return {
            regular: priceStructure.regular,
            discounted: priceStructure.discounted,
        };
    }

    return isDiscounted ? priceStructure.discounted : priceStructure.regular;
};

export const Seats = ({ seatColor, isTaken = false, isSelected, onClick, seatCol, seatRow, canCursor = true, isHidden = false, price, seatNumber }) => {
    const seatSize = 'w-[' + Math.round(100 / (seatCol > seatRow ? seatCol : seatRow)).toString() + '%]';

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            className={`${seatSize} min-w-[30px] ${isHidden ? 'opacity-0' : 'opacity-100'} group relative flex aspect-square flex-col gap-[10%] ${isTaken || !canCursor || isHidden ? 'pointer-events-none' : 'cursor-pointer'}`}
            onClick={isHidden ? undefined : handleClick}
            title={`Seat ${seatNumber}`}
        >
            <div
                className={`relative z-1 h-full w-full cursor-pointer transition-colors duration-200 md:h-[70%] ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor} rounded-sm`}
            />
            <div
                className={`relative z-1 hidden h-[20%] w-full cursor-pointer transition-colors duration-200 md:block ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor} rounded-sm`}
            />
            {/* Price tooltip */}
            {price && !isHidden && (
                <div className="absolute -top-6 left-1/2 z-50 hidden w-[300%] -translate-x-1/2 transform rounded bg-black px-2 py-1 text-center text-xs text-white shadow-lg group-hover:block">
                    {price.discounted / 1000}k - {price.regular / 1000}k
                    <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-2 border-l-2 border-t-black border-r-transparent border-l-transparent"></div>
                </div>
            )}
        </div>
    );
};

export const CoupleSeat = ({ seatColor, isSelected, onClick, seatRow, seatCol, isTaken, canCursor = true, isHidden = false, price, seatNumber }) => {
    const seatSize = 'w-[' + Math.round((100 / (seatCol > seatRow ? seatCol : seatRow)) * 2).toString() + '%]';

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            className={`${seatSize} min-w-[68px] ${isHidden ? 'opacity-0' : 'opacity-100'} group relative flex flex-row gap-2 ${isTaken || !canCursor || isHidden ? 'pointer-events-none' : 'cursor-pointer'}`}
            onClick={isHidden ? undefined : handleClick}
            title={`Couple Seat ${seatNumber}`}
        >
            <Seats seatColor={seatColor} isSelected={isSelected} seatRow={seatRow} seatCol={seatCol} isTaken={isTaken} canCursor={canCursor} seatNumber={seatNumber} />
            <Seats seatColor={seatColor} isSelected={isSelected} seatRow={seatRow} seatCol={seatCol} isTaken={isTaken} canCursor={canCursor} seatNumber={seatNumber} />
            <div
                className={`r-[50%] absolute inset-0 top-1 z-0 mx-auto flex h-[75%] w-5 items-center justify-center transition-colors md:h-[55%] ${isTaken ? 'bg-gray-400' : isSelected ? 'bg-purple-500 ring-2 ring-white' : seatColor}`}
            />
            {/* Price tooltip */}
            {price && !isHidden && (
                <div className="absolute -top-6 left-1/2 z-50 hidden w-[150%] -translate-x-1/2 transform rounded bg-black px-2 py-1 text-center text-xs text-white shadow-lg group-hover:block">
                    {(price.discounted * 2) / 1000}k - {(price.regular * 2) / 1000}k
                    <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-2 border-l-2 border-t-black border-r-transparent border-l-transparent"></div>
                </div>
            )}
        </div>
    );
};

// ================================ MINI MAP COMPONENT ================================

const MiniMap = ({ seatMap, containerRef, contentRef, needsScrolling, onNavigate, schedule }) => {
    const miniMapRef = useRef();
    const [miniMapDimensions, setMiniMapDimensions] = useState({ width: 0, height: 0 });
    const [viewportRect, setViewportRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [hideMiniMap, setHideMiniMap] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isInTopRightCorner, setIsInTopRightCorner] = useState(false);
    const [hideTimeout, setHideTimeout] = useState(null);
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
                height: viewportHeight,
            });

            // Hide minimap if viewport covers most of the content
            const coverageX = viewportWidth / miniWidth;
            const coverageY = viewportHeight / miniHeight;
            setHideMiniMap(coverageX > 0.9 && coverageY > 0.9);

            // Check if viewport is in top-right corner (within 10% margin)
            const marginX = miniWidth * 0.1;
            const marginY = miniHeight * 0.1;
            const isTopRight = viewportX + viewportWidth >= miniWidth - marginX && viewportY <= marginY;

            setIsInTopRightCorner(isTopRight);
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

    // Handle auto-hide logic with timeout
    useEffect(() => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            setHideTimeout(null);
        }

        if (isInTopRightCorner && !isDragging) {
            // Set a timeout to hide the minimap after 2 seconds
            const timeout = setTimeout(() => {
                setHideMiniMap(true);
            }, 2000);
            setHideTimeout(timeout);
        } else if (!isInTopRightCorner) {
            // Show minimap immediately when not in corner
            setHideMiniMap(false);
        }

        return () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        };
    }, [isInTopRightCorner, isDragging]);

    // Clear timeout and show minimap when dragging starts
    useEffect(() => {
        if (isDragging) {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                setHideTimeout(null);
            }
            setHideMiniMap(false);
        }
    }, [isDragging]);

    const handleMiniMapClick = (e) => {
        if (!containerRef.current || !miniMapRef.current) return;

        const miniMapRect = miniMapRef.current.getBoundingClientRect();
        const clickX = e.clientX - miniMapRect.left;
        const clickY = e.clientY - miniMapRect.top;

        navigateToPosition(clickX, clickY);
    };

    const handleMiniMapMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        handleMiniMapClick(e);
    };

    const handleMiniMapMouseMove = (e) => {
        if (!isDragging || !containerRef.current || !miniMapRef.current) return;

        const miniMapRect = miniMapRef.current.getBoundingClientRect();
        const moveX = e.clientX - miniMapRect.left;
        const moveY = e.clientY - miniMapRect.top;

        navigateToPosition(moveX, moveY);
    };

    const handleMiniMapMouseUp = () => {
        setIsDragging(false);
    };

    const handleMiniMapTouchStart = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const touch = e.touches[0];
        const miniMapRect = miniMapRef.current.getBoundingClientRect();
        const touchX = touch.clientX - miniMapRect.left;
        const touchY = touch.clientY - miniMapRect.top;
        navigateToPosition(touchX, touchY);
    };

    const handleMiniMapTouchMove = (e) => {
        if (!isDragging || !containerRef.current || !miniMapRef.current) return;
        e.preventDefault();

        const touch = e.touches[0];
        const miniMapRect = miniMapRef.current.getBoundingClientRect();
        const touchX = touch.clientX - miniMapRect.left;
        const touchY = touch.clientY - miniMapRect.top;

        navigateToPosition(touchX, touchY);
    };

    const handleMiniMapTouchEnd = () => {
        setIsDragging(false);
    };

    const navigateToPosition = (x, y) => {
        if (!containerRef.current || !miniMapRef.current) return;

        // Clamp coordinates to minimap bounds
        const clampedX = Math.max(0, Math.min(x, miniMapDimensions.width));
        const clampedY = Math.max(0, Math.min(y, miniMapDimensions.height));

        // Convert minimap coordinates to scroll position
        const scaleX = containerRef.current.scrollWidth / miniMapDimensions.width;
        const scaleY = containerRef.current.scrollHeight / miniMapDimensions.height;

        const newScrollLeft = clampedX * scaleX - containerRef.current.clientWidth / 2;
        const newScrollTop = clampedY * scaleY - containerRef.current.clientHeight / 2;

        containerRef.current.scrollTo({
            left: Math.max(0, Math.min(newScrollLeft, containerRef.current.scrollWidth - containerRef.current.clientWidth)),
            top: Math.max(0, Math.min(newScrollTop, containerRef.current.scrollHeight - containerRef.current.clientHeight)),
            behavior: 'auto', // Changed from 'smooth' for better dragging experience
        });
    };

    // Add global event listeners for mouse events when dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMiniMapMouseMove);
            document.addEventListener('mouseup', handleMiniMapMouseUp);
            document.addEventListener('touchmove', handleMiniMapTouchMove, { passive: false });
            document.addEventListener('touchend', handleMiniMapTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleMiniMapMouseMove);
                document.removeEventListener('mouseup', handleMiniMapMouseUp);
                document.removeEventListener('touchmove', handleMiniMapTouchMove);
                document.removeEventListener('touchend', handleMiniMapTouchEnd);
            };
        }
    }, [isDragging, miniMapDimensions]);

    if (!needsScrolling || hideMiniMap) return null;

    return (
        <div
            className={`absolute top-[10%] right-0 z-40 rounded-lg border border-gray-600 bg-black/80 p-2 backdrop-blur-lg transition-opacity duration-300 ${isInTopRightCorner && !isDragging ? 'hidden' : 'opacity-100'}`}
        >
            <div
                ref={miniMapRef}
                className={`relative overflow-hidden rounded bg-gray-800 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                    width: miniMapDimensions.width,
                    height: miniMapDimensions.height,
                }}
                onMouseDown={handleMiniMapMouseDown}
                onTouchStart={handleMiniMapTouchStart}
            >
                {/* Mini seat layout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Mini seats */}
                    <div className="flex flex-row gap-0.5 text-[6px]">
                        {/* Row letters */}
                        <div className="flex flex-col gap-0.5">
                            {rowKeys.map((rowKey) => (
                                <div key={rowKey} className="flex h-1.5 w-2 items-center justify-center text-[4px] text-white">
                                    {rowKey}
                                </div>
                            ))}
                        </div>
                        {/* Seats grid */}
                        <div className="flex flex-col gap-0.5">
                            {rowKeys.map((rowKey) => (
                                <div key={rowKey} className="flex h-1.5 flex-row gap-0.5">
                                    {(() => {
                                        const seats = seatMap[rowKey];
                                        const seatElements = [];
                                        let i = 0;
                                        while (i < seats.length) {
                                            const current = seats[i];
                                            const next = seats[i + 1];
                                            const isTaken = current.status === 'occupied' || current.status === 'holding';
                                            const isHidden = current.isHidden;
                                            const nextIsHidden = next && next.isHidden;
                                            const nextIsTaken = next && (next.status === 'occupied' || next.status === 'holding');
                                            if (current.category.toLowerCase() === 'couple' && next && next.category.toLowerCase() === 'couple') {
                                                seatElements.push(
                                                    <div
                                                        key={current.seatNumber + '-' + next.seatNumber}
                                                        className={`h-1.5 w-[14px] rounded-[1px] ${isHidden && nextIsHidden ? 'opacity-0' : 'opacity-100'} ${isTaken || nextIsTaken ? 'bg-gray-400' : 'bg-indigo-400'}`}
                                                    />,
                                                );
                                                i += 2;
                                            } else {
                                                seatElements.push(
                                                    <div
                                                        key={current.seatNumber}
                                                        className={`h-1.5 w-1.5 rounded-[1px] ${isHidden ? 'opacity-0' : 'opacity-100'} ${
                                                            isTaken
                                                                ? 'bg-gray-400'
                                                                : current.category.toLowerCase() === 'couple'
                                                                  ? 'bg-indigo-400'
                                                                  : current.category.toLowerCase() === 'vip'
                                                                    ? 'bg-red-400'
                                                                    : 'bg-blue-400'
                                                        }`}
                                                    />,
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
                    className="pointer-events-none absolute border-2 border-pink-400 bg-pink-400/20"
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
    onClick = () => {
        console.log('Seat clicked');
    },
    loading,
    clearSessionLoading,
}) => {
    console.log('SeatLayout rendered with schedule:', seatMap);
    const containerRef = useRef();
    const contentRef = useRef();
    const [needsScrolling, setNeedsScrolling] = useState(false);
    const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);

    const rowKeys = Object.keys(seatMap).sort();

    // Reset original size when seatMap changes
    useEffect(() => {
        setOriginalSize({ width: 0, height: 0 });
    }, [JSON.stringify(seatMap)]);

    // Check if scrolling is needed and calculate scaling
    useEffect(() => {
        const checkSize = () => {
            if (containerRef.current && contentRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();

                // Get original content dimensions (before any transform)
                let effectiveContentWidth;
                let effectiveContentHeight;

                if (originalSize.width === 0 || originalSize.height === 0) {
                    // First time - store original dimensions
                    const contentRect = contentRef.current.getBoundingClientRect();
                    const contentStyle = window.getComputedStyle(contentRef.current);

                    const paddingLeft = parseFloat(contentStyle.paddingLeft) || 0;
                    const paddingRight = parseFloat(contentStyle.paddingRight) || 0;
                    const paddingTop = parseFloat(contentStyle.paddingTop) || 0;
                    const paddingBottom = parseFloat(contentStyle.paddingBottom) || 0;

                    effectiveContentWidth = contentRect.width - (paddingLeft + paddingRight);
                    effectiveContentHeight = contentRect.height - (paddingTop + paddingBottom);

                    // Store original dimensions
                    setOriginalSize({
                        width: effectiveContentWidth,
                        height: effectiveContentHeight,
                    });
                } else {
                    // Use stored original dimensions
                    effectiveContentWidth = originalSize.width;
                    effectiveContentHeight = originalSize.height;
                }

                const exceedsWidth = effectiveContentWidth > containerRect.width;
                const exceedsHeight = effectiveContentHeight > containerRect.height;

                setNeedsScrolling(exceedsWidth || exceedsHeight);

                // Calculate scale for non-scrolling mode
                if (!exceedsWidth && !exceedsHeight) {
                    const widthScale = containerRect.width / (effectiveContentWidth + containerRect.width * 0.1);
                    const heightScale = containerRect.height / (effectiveContentHeight + containerRect.height * 0.1);
                    const calculatedScale = Math.max(Math.min(widthScale, heightScale), 1);
                    setScale(calculatedScale);
                } else {
                    setScale(1);
                }
            }
        };

        const timeout = setTimeout(checkSize, 1);
        window.addEventListener('resize', checkSize);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', checkSize);
        };
    }, [JSON.stringify(seatMap), loading, clearSessionLoading, originalSize]);

    // Reset scrolling and scaling when seatMap changes
    useEffect(() => {
        setNeedsScrolling(false);
        setScale(1);
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, [JSON.stringify(seatMap)]);

    return (
        <div className="relative flex h-full w-full flex-col items-center">
            {/* Screen Image */}
            <img src={screen} alt="Seat Layout" className="relative z-20 h-auto w-[80%] object-contain py-3" />

            {/* Seat Layout Container */}
            <div ref={containerRef} className={`relative h-full w-full rounded-xl ${needsScrolling ? 'overflow-auto ring-1 ring-white' : 'flex items-center justify-center overflow-hidden'}`}>
                {loading && !clearSessionLoading ? (
                    <div className="md:text-md mx-2 h-auto items-center justify-center font-['Unbounded'] text-base font-black text-white">• • •</div>
                ) : (
                    <div
                        ref={contentRef}
                        className={`z-10 flex min-w-max flex-row gap-2 rounded-sm ${needsScrolling ? 'p-8' : ''}`}
                        style={{
                            transform: needsScrolling ? 'none' : `scale(${scale})`,
                            transformOrigin: 'center center',
                        }}
                    >
                        {/* Row Labels Column */}
                        <div className="flex h-full min-w-[40px] flex-col gap-2">
                            {rowKeys.map((rowKey) => (
                                <span
                                    key={rowKey}
                                    className={`font-['Unbounded'] h-[${seatMap[rowKey].length > rowKeys.length ? 100 / seatMap[rowKey].length : 100 / rowKeys.length}%] flex min-h-[30px] w-full items-center justify-center text-xl font-bold text-white`}
                                >
                                    {rowKey}
                                </span>
                            ))}
                        </div>

                        {/* Seats Grid */}
                        <div className="flex h-full flex-col gap-2">
                            {rowKeys.map((rowKey, rowIndex) => (
                                <div key={rowKey} className="flex flex-row items-center gap-2">
                                    {(() => {
                                        const seats = seatMap[rowKey];
                                        const seatElements = [];
                                        let i = 0;

                                        while (i < seats.length) {
                                            const current = seats[i];
                                            const next = seats[i + 1];

                                            // Check for couple seat: both couple category
                                            if (current.category.toLowerCase() === 'couple' && next && next.category.toLowerCase() === 'couple') {
                                                const couplePrice = getSeatPrice(current, false, true) || getSeatPrice(next, false, true);
                                                seatElements.push(
                                                    <CoupleSeat
                                                        key={current.seatNumber + '-' + next.seatNumber}
                                                        seatColor="bg-indigo-400 group-hover:bg-indigo-500"
                                                        isTaken={current.status === 'occupied' || current.status === 'holding'}
                                                        isSelected={selectedSeats.includes(current.seatNumber) || selectedSeats.includes(next.seatNumber)}
                                                        onClick={() => onClick?.([current.seatNumber, next.seatNumber])}
                                                        seatCol={seats.length}
                                                        seatRow={rowKeys.length}
                                                        isHidden={current.isHidden || next.isHidden}
                                                        price={couplePrice}
                                                        seatNumber={`${current.seatNumber}-${next.seatNumber}`}
                                                    />,
                                                );
                                                i += 2;
                                            } else {
                                                const getSeatColor = (category) => {
                                                    switch (category.toLowerCase()) {
                                                        case 'couple':
                                                            return 'bg-indigo-400 group-hover:bg-yellow-500';
                                                        case 'vip':
                                                            return 'bg-red-400 group-hover:bg-red-500';
                                                        default:
                                                            return 'bg-blue-400 group-hover:bg-blue-500';
                                                    }
                                                };

                                                seatElements.push(
                                                    <Seats
                                                        key={current.seatNumber}
                                                        seatColor={getSeatColor(current.category)}
                                                        isTaken={current.status === 'occupied' || current.status === 'holding'}
                                                        isHidden={current.isHidden}
                                                        isSelected={selectedSeats.includes(current.seatNumber)}
                                                        onClick={() => onClick?.(current.seatNumber)}
                                                        seatCol={seats.length}
                                                        seatRow={rowKeys.length}
                                                        price={getSeatPrice(current, false, true)}
                                                        seatNumber={current.seatNumber}
                                                    />,
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
            <MiniMap seatMap={seatMap} containerRef={containerRef} contentRef={contentRef} needsScrolling={needsScrolling} schedule={schedule} />
        </div>
    );
};

export default SeatLayout;
export { getSeatPrice, FALLBACK_PRICES };
