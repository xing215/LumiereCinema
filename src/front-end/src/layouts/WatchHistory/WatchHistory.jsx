import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomDropdown from '@/components/UI/CustomDropdown';
import { ROUTES } from '@routes/routeConfig';
import { useGetWatchHistory } from '@hooks/useUser';

import TicketDetail from '@/components/UI/TicketDetail';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';

const WatchHistory = ({ showTicketDetail, setShowTicketDetail, selectedTicket, setSelectedTicket }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const { getWatchHistory, watchHistory, loading: watchHistoryLoading, error: watchHistoryError } = useGetWatchHistory();

    // Thêm state cho pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Refs cho ticket detail
    const qrParentRef = useRef(null);
    const ticketDetailRef = useRef(null);
    const captureRef = useRef(null);
    const [qrSize, setQrSize] = useState(90);
    const [maxHeight, setMaxHeight] = useState(undefined);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAccountPage(value);
        if (value === 'Information') {
            navigate(ROUTES.PROFILE);
        } else if (value === 'Wishlist') {
            navigate(ROUTES.WISHLIST);
        } else if (value === 'Watch history') {
            navigate(ROUTES.WATCH_HISTORY);
        } else if (value === 'Lunar points') {
            navigate(ROUTES.LUNAR_POINT);
        }
    };

    // Handle View Ticket
    const handleViewTicket = (ticketId) => {
        const ticket = userWatchHistoryData.find((item) => item.id === ticketId);
        if (ticket) {
            setSelectedTicket(ticket);
            setShowTicketDetail(true);
        }
        console.log('View ticket:', ticketId, ticket);
    };

    // Handle Back to List
    const handleBackToList = () => {
        setShowTicketDetail(false);
        setSelectedTicket(null);
    };

    // QR Code sizing effect (từ MenuTicketDisplay)
    useEffect(() => {
        if (!showTicketDetail) return;

        function updateSize() {
            if (qrParentRef.current) {
                const height = qrParentRef.current.offsetHeight;
                if (window.innerWidth < 768) {
                    setQrSize(Math.max(70, Math.min(150, Math.floor(height * 0.7))));
                } else {
                    setQrSize(Math.max(70, Math.min(150, Math.floor(height * 0.3))));
                }
            }

            if (ticketDetailRef.current && qrParentRef.current) {
                ticketDetailRef.current.style.height = 'auto';
                qrParentRef.current.style.height = 'auto';
                const qrH = qrParentRef.current.offsetHeight;
                const ticketH = ticketDetailRef.current.offsetHeight;

                setMaxHeight(Math.max(qrH, ticketH));
                ticketDetailRef.current.style.height = `${maxHeight}px`;
                qrParentRef.current.style.height = `${maxHeight}px`;
            }
        }

        updateSize();
        const handleResize = () => updateSize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [maxHeight, showTicketDetail]);

    // Download function (từ MenuTicketDisplay)
    const handleDownload = async () => {
        if (!captureRef.current) {
            console.error('Capture element not found');
            return;
        }

        try {
            const buttonContainers = captureRef.current.querySelectorAll('button');
            const buttonOriginalDisplays = [];
            buttonContainers.forEach((container, index) => {
                buttonOriginalDisplays[index] = container.style.display;
                container.style.display = 'none';
            });

            const bgElements = captureRef.current.querySelectorAll('[class*="bg-zinc-300"]');
            const originalStyles = [];

            bgElements.forEach((el, index) => {
                originalStyles[index] = {
                    element: el,
                    className: el.className,
                    style: el.getAttribute('style') || '',
                };

                el.style.backgroundColor = '#070A32';
                el.style.opacity = '1';
                el.style.mixBlendMode = 'normal';
                el.style.pointerEvents = 'auto';
                el.style.background = '#070A32';
            });

            const rect = captureRef.current.getBoundingClientRect();
            const dataUrl = await toPng(captureRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                width: rect.width,
                height: rect.height,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                },
            });

            // Restore styles
            buttonContainers.forEach((container, index) => {
                if (buttonOriginalDisplays[index]) {
                    container.style.display = buttonOriginalDisplays[index];
                } else {
                    container.style.removeProperty('display');
                }
            });

            originalStyles.forEach(({ element, className, style }) => {
                element.className = className;
                if (style) {
                    element.setAttribute('style', style);
                } else {
                    element.removeAttribute('style');
                }
            });

            const link = document.createElement('a');
            link.download = `ticket-${selectedTicket?.id || 'download'}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const [accountPage, setAccountPage] = useState('');
    const [lastSegment, setLastSegment] = useState('/' + pathSegments[pathSegments.length - 1]);

    useEffect(() => {
        const getLastSegment = '/' + pathSegments[pathSegments.length - 1];
        setLastSegment(getLastSegment);
    }, [pathSegments]);

    useEffect(() => {
        // Set the default account page based on the URL
        if (lastSegment === ROUTES.PROFILE) {
            setAccountPage('Information');
        } else if (lastSegment === ROUTES.WISHLIST) {
            setAccountPage('Wishlist');
        } else if (lastSegment === ROUTES.WATCH_HISTORY) {
            setAccountPage('Watch history');
        } else if (lastSegment === ROUTES.LUNAR_POINT) {
            setAccountPage('Lunar points');
        }
    }, [lastSegment]);

    useEffect(() => {
        getWatchHistory();
    }, []);

    // Thêm useEffect để log khi watchHistory thay đổi
    // useEffect(() => {
    //     console.log('Watch history updated:', watchHistory);
    //     console.log('Loading state:', watchHistoryLoading);
    //     console.log('Error state:', watchHistoryError);
    // }, [watchHistory, watchHistoryLoading, watchHistoryError]);

    // Hàm format dữ liệu watch history
    const formatWatchHistoryData = (tickets) => {
        if (!tickets || !Array.isArray(tickets)) {
            return [];
        }

        return tickets.map((ticket) => {
            // Backend đã populate, dùng trực tiếp
            const schedule = ticket.schedule;
            const branch = ticket.branch;
            const movie = schedule?.movie;
            const screen = schedule?.screen;

            // Format time và date
            const startTime = schedule?.startTime ? new Date(schedule.startTime) : null;
            const endTime = schedule?.endTime ? new Date(schedule.endTime) : null;
            const createAt = ticket.createdAt ? new Date(ticket.createdAt) : null;

            const formatTime = (date) => {
                return date
                    ? date.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                      })
                    : 'N/A';
            };

            const formatDate = (date) => {
                return date ? date.toLocaleDateString('vi-VN') : 'N/A';
            };

            return {
                // Ticket Code
                id: ticket.ticketCode,

                // Movie title từ populated movie
                movie: movie?.title || 'Unknown Movie',

                // Start time formatted
                time: formatTime(createAt),

                // End time formatted
                endTime: formatTime(endTime),

                // Date từ startTime
                date: formatDate(createAt),

                // Branch name
                location: branch?.name || 'Unknown Location',

                // Screen name từ populated screen
                screenName: screen?.screenName || 'Unknown Screen',

                total: ticket.total || 0,

                // Seats từ ticket
                seats: ticket.seats || [],
                seatsText: ticket.seats && ticket.seats.length > 0 ? ticket.seats.join(', ') : 'N/A',

                // Raw data để debug
                rawTicket: ticket,
                scheduleId: schedule?._id,
                branchId: branch?._id,
                movieId: movie?._id,
            };
        });
    };

    // Cập nhật loading state
    const isLoading = watchHistoryLoading;

    const userWatchHistoryData = formatWatchHistoryData(watchHistory || []);
    console.log('Formatted watch history:', userWatchHistoryData);

    // Tính toán pagination
    const totalItems = userWatchHistoryData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = userWatchHistoryData.slice(startIndex, endIndex);

    // Hàm điều hướng trang
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Reset về trang 1 khi data thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [watchHistory]);

    // Ticket Detail View
    if (showTicketDetail && selectedTicket) {
        // Transform rawTicket để match với TicketDetail expectation
        const transformedTicketData = {
            ...selectedTicket.rawTicket,
            schedule: {
                ...selectedTicket.rawTicket.schedule,
                screen: {
                    ...selectedTicket.rawTicket.schedule?.screen,
                    // Map screenName -> name để TicketDetail có thể đọc được
                    name: selectedTicket.rawTicket.schedule?.screen?.screenName || selectedTicket.rawTicket.schedule?.screen?.name || 'N/A',
                },
            },
        };

        return (
            <div className="relative flex w-full items-center justify-center">
                <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:w-screen lg:h-auto lg:w-[calc(75vw)]" ref={captureRef}>
                    {/* Main content */}
                    <div className="relative flex flex-1 flex-col items-center justify-center">
                        {/* Mobile Action Buttons */}
                        <div className="inline-flex w-auto items-start justify-start gap-3.5 py-5 md:hidden">
                            <button
                                className="group relative flex aspect-auto h-9 w-40 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleBackToList}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="absolute h-full w-full rounded-xl bg-zinc-300/30 mix-blend-screen transition-all duration-300 group-hover:bg-zinc-400/30" />
                                <span className="relative z-10 w-36 text-center font-['Unbounded'] text-sm font-bold text-white">BACK TO LIST</span>
                            </button>
                            <button
                                className="group relative flex aspect-auto h-9 w-40 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleDownload}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 group-hover:bg-purple-600" />
                                <span className="relative z-10 w-36 text-center font-['Unbounded'] text-sm font-bold text-white">DOWNLOAD</span>
                            </button>
                        </div>

                        {/* Ticket Content */}
                        <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-5">
                            {/* QR Code Section - Chỉ hiển thị TICKET, không có SNACK */}
                            <div
                                className="flex h-auto min-h-[100px] w-[90vw] flex-row items-center justify-center rounded-xl bg-zinc-300/30 py-3 mix-blend-color-dodge md:w-[21vw] md:flex-col md:py-0 lg:[transform:translate3d(0,0,0)]"
                                ref={qrParentRef}
                                style={maxHeight ? { height: maxHeight + 'px' } : { height: 'auto' }}
                            >
                                <div className="flex w-[90%] flex-col items-center justify-center py-2">
                                    <div className="h-auto justify-start text-center font-['Unbounded'] text-base font-black text-white">TICKET</div>
                                    <div className="flex items-center justify-center rounded-lg border-4 border-white bg-white p-1">
                                        <QRCode value={JSON.stringify(selectedTicket.id)} size={qrSize} />
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Detail Section */}
                            <div className="h-full w-[90vw] pb-5 md:w-[48vw] md:pb-0" ref={ticketDetailRef} style={maxHeight ? { height: maxHeight + 'px' } : { height: 'auto' }}>
                                <TicketDetail movieTicketData={transformedTicketData} snackTicketData={null} />
                            </div>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden w-auto items-start justify-start gap-3.5 py-5 md:inline-flex">
                            <button
                                className="group relative flex aspect-auto h-9 w-40 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleBackToList}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="absolute h-full w-full rounded-xl bg-zinc-300/30 mix-blend-screen transition-all duration-300 group-hover:bg-zinc-400/30" />
                                <span className="relative z-10 w-36 text-center font-['Unbounded'] text-sm font-bold text-white">BACK TO LIST</span>
                            </button>
                            <button
                                className="group relative flex aspect-auto h-9 w-72 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleDownload}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 group-hover:bg-purple-600" />
                                <span className="relative z-10 w-60 text-center font-['Unbounded'] text-base font-bold text-white">DOWNLOAD</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex w-full items-center justify-center overflow-hidden">
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl md:w-screen md:flex-row md:items-start md:justify-start md:gap-3 lg:h-auto lg:w-[calc(75vw)]">
                {/* Main Content */}
                <div className="relative h-auto w-full">
                    <div className="mx-auto w-full">
                        {/* Header */}
                        <div className="mb-6 flex items-start justify-start">
                            <h1 className="font-['Libre_Franklin'] text-2xl font-bold text-white md:text-3xl">Watch History</h1>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="w-full py-8 text-center">
                                <p className="font-['Unbounded'] text-sm text-white opacity-60">Loading watch history...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {watchHistoryError && (
                            <div className="w-full py-8 text-center">
                                <p className="font-['Unbounded'] text-sm text-red-400">Error: {watchHistoryError}</p>
                            </div>
                        )}

                        {/* Watch History Content */}
                        <div className="flex w-full flex-col items-start justify-start gap-1">
                            {/* Table Header - Desktop Grid */}
                            <div className="hidden w-full grid-cols-[0px_100px_1fr_70px_1fr_80px] items-center gap-2 md:grid">
                                <div /> {/* Spacer */}
                                <div className="font-['Unbounded'] text-[10px] font-medium text-white">Ticket ID</div>
                                <div className="font-['Unbounded'] text-[10px] font-medium text-white">Movie</div>
                                <div className="text-center font-['Unbounded'] text-[10px] font-medium text-white">Time</div>
                                <div className="text-center font-['Unbounded'] text-[10px] font-medium text-white">Location</div>
                                <div /> {/* Button spacer */}
                            </div>

                            {/* Header Divider - Ẩn trên mobile */}
                            <div className="hidden h-0.5 self-stretch bg-zinc-300/30 mix-blend-color-dodge md:block" />

                            {/* Table Rows - Desktop Grid */}
                            <div className="hidden w-full md:block">
                                {currentPageData.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <div className="grid min-h-[32px] w-full grid-cols-[0px_100px_1fr_70px_1fr_80px] items-start gap-2 py-2">
                                            <div /> {/* Spacer */}
                                            {/* Ticket ID */}
                                            <div className="font-['Unbounded'] text-[10px] font-medium text-white">{item.id}</div>
                                            {/* Movie Title */}
                                            <div className="pr-2 font-['Unbounded'] text-[10px] leading-tight break-words text-white">
                                                <span>{item.movie}</span>
                                            </div>
                                            {/* Time & Date */}
                                            <div className="text-center font-['Unbounded'] text-[10px] leading-tight font-medium whitespace-nowrap text-white">
                                                {item.time}
                                                <br />
                                                {item.date}
                                            </div>
                                            {/* Location */}
                                            <div className="px-1 text-center font-['Unbounded'] text-[10px] leading-tight font-medium break-words text-white">{item.location}</div>
                                            {/* View Button */}
                                            <div className="flex items-start justify-center pt-0">
                                                <button
                                                    onClick={() => handleViewTicket(item.id)}
                                                    className="h-5 w-16 cursor-pointer rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-colors duration-200 hover:bg-pink-300"
                                                >
                                                    <div className="text-center font-['Unbounded'] text-[10px] font-bold text-white">VIEW</div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row Divider */}
                                        <div className="h-0.5 w-full bg-zinc-300/30 mix-blend-color-dodge" />
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Mobile Layout - Card Style*/}
                            {currentPageData.map((item, index) => (
                                <div key={`mobile-${item.id}`} className="mb-3 block w-full rounded-lg bg-zinc-800/30 p-4 md:hidden">
                                    <div className="flex flex-col gap-3">
                                        {/* Movie Title & Ticket ID */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 pr-2">
                                                <div className="mb-1 font-['Unbounded'] text-sm leading-tight font-bold text-white">
                                                    <span className="font-bold">{item.movie}</span>
                                                </div>
                                                <div className="font-['Unbounded'] text-xs font-light text-white/70">Ticket ID: {item.id}</div>
                                            </div>
                                            <button
                                                onClick={() => handleViewTicket(item.id)}
                                                className="h-6 w-16 flex-shrink-0 cursor-pointer rounded-lg bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-colors duration-200 hover:bg-pink-300"
                                            >
                                                <div className="text-center font-['Unbounded'] text-[10px] font-bold text-white">VIEW</div>
                                            </button>
                                        </div>

                                        {/* Time & Location */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="mb-1 font-['Unbounded'] text-xs font-light text-white/70">Time & Date</div>
                                                <div className="font-['Unbounded'] text-xs font-medium text-white">
                                                    {item.time} • {item.date}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 font-['Unbounded'] text-xs font-light text-white/70">Location</div>
                                                <div className="font-['Unbounded'] text-xs font-medium text-white">{item.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {currentPageData.length === 0 && (
                                <div className="w-full py-8 text-center">
                                    <p className="font-['Unbounded'] text-sm text-white opacity-60">No watch history found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-500'}`}
                            >
                                Previous
                            </button>
                            <span className="text-sm font-medium text-white">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-500'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchHistory;
