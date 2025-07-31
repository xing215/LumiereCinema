import SideBar from "@/layouts/UserProfile/SideBar";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomDropdown from "@/components/UI/CustomDropdown";
import { ROUTES } from '@routes/routeConfig';
import { useGetWatchHistory } from "@hooks/useUser";

import TicketDetail from "@/components/UI/TicketDetail";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

const WatchHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { getWatchHistory, watchHistory, loading: watchHistoryLoading, error: watchHistoryError } = useGetWatchHistory();

    // Thêm state cho pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // State cho ticket detail view
    const [showTicketDetail, setShowTicketDetail] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

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
        }
        else if (value === 'Wishlist') {
            navigate(ROUTES.WISHLIST);
        } else if (value === 'Watch history') {
            navigate(ROUTES.WATCH_HISTORY);
        } else if (value === 'Lunar points') {
            navigate(ROUTES.LUNAR_POINT);
        }
    };

    // Handle View Ticket
    const handleViewTicket = (ticketId) => {
        const ticket = userWatchHistoryData.find(item => item.id === ticketId);
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
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [maxHeight, showTicketDetail]);

    // Download function (từ MenuTicketDisplay)
    const handleDownload = async () => {
        if (!captureRef.current) {
            console.error("Capture element not found");
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
                    style: el.getAttribute('style') || ''
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
                    transformOrigin: 'top left'
                }
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

            const link = document.createElement("a");
            link.download = `ticket-${selectedTicket?.id || 'download'}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Download failed:", err);
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

        return tickets.map(ticket => {
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
                return date ? date.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }) : 'N/A';
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
                seatsText: ticket.seats && ticket.seats.length > 0 
                    ? ticket.seats.join(', ') 
                    : 'N/A',
                
                // Raw data để debug
                rawTicket: ticket,
                scheduleId: schedule?._id,
                branchId: branch?._id,
                movieId: movie?._id
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
                    name: selectedTicket.rawTicket.schedule?.screen?.screenName || 
                        selectedTicket.rawTicket.schedule?.screen?.name || 
                        'N/A'
                }
            }
        };
        
        return (
            <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
                <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]"
                     ref={captureRef}>
                    
                    {/* Main content */}
                    <div className="relative flex flex-1 flex-col items-center justify-center px-2 sm:px-4 md:px-8">
                        
                        {/* Mobile Action Buttons */}
                        <div className="w-auto inline-flex justify-start items-start gap-3.5 py-5 md:hidden">
                            <button
                                className="group relative flex aspect-auto w-40 h-9 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleBackToList}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="absolute h-full w-full rounded-xl mix-blend-screen bg-zinc-300/30 transition-all duration-300 group-hover:bg-zinc-400/30" />
                                <span className="relative z-10 w-36 text-center text-white text-sm font-bold font-['Unbounded']">
                                    BACK TO LIST
                                </span>
                            </button>
                            <button
                                className="group relative flex aspect-auto w-40 h-9 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleDownload}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 group-hover:bg-purple-600" />
                                <span className="relative z-10 w-36 text-center text-white text-sm font-bold font-['Unbounded']">
                                    DOWNLOAD
                                </span>
                            </button>
                        </div>

                        {/* Ticket Content */}
                        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-5">
                            
                            {/* QR Code Section - Chỉ hiển thị TICKET, không có SNACK */}
                            <div
                                className="flex flex-row md:flex-col h-auto w-[90vw] min-h-[100px] md:w-[21vw] items-center justify-center rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)] py-3 md:py-0"
                                ref={qrParentRef}
                                style={maxHeight ? { height: maxHeight + 'px' } : { height: 'auto' }}
                            >
                                <div className="w-[90%] flex flex-col justify-center items-center py-2">
                                    <div className="h-auto text-center justify-start text-white text-base font-black font-['Unbounded']">
                                        TICKET
                                    </div>
                                    <div className="bg-white p-1 rounded-lg border-4 border-white flex items-center justify-center">
                                        <QRCode value={JSON.stringify(selectedTicket.id)} size={qrSize} />
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Detail Section */}
                            <div
                                className="h-full w-[90vw] md:w-[48vw] pb-5 md:pb-0"
                                ref={ticketDetailRef}
                                style={maxHeight ? { height: maxHeight + 'px' } : { height: 'auto' }}
                            >
                                <TicketDetail
                                    movieTicketData={transformedTicketData}
                                    snackTicketData={null}
                                />
                            </div>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="w-auto hidden md:inline-flex justify-start items-start gap-3.5 py-5">
                            <button
                                className="group relative flex aspect-auto w-40 h-9 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleBackToList}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="absolute h-full w-full rounded-xl mix-blend-screen bg-zinc-300/30 transition-all duration-300 group-hover:bg-zinc-400/30" />
                                <span className="relative z-10 w-36 text-center text-white text-sm font-bold font-['Unbounded']">
                                    BACK TO LIST
                                </span>
                            </button>
                            <button
                                className="group relative flex aspect-auto w-72 h-9 flex-row items-center justify-center transition-all duration-300"
                                onClick={handleDownload}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 group-hover:bg-purple-600" />
                                <span className="relative z-10 w-60 text-center text-white text-base font-bold font-['Unbounded']">
                                    DOWNLOAD
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
    <div className="overflow-hidden relative flex w-screen items-center justify-center pt-3 md:pt-7">
            
            <div className="relative flex h-full w-full md:gap-3 flex-col md:flex-row justify-center items-center md:items-start md:justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]">
                <div className="block md:hidden w-[95%] h-auto pb-3">
                <CustomDropdown name="discount"
                placeholder=""
                value={accountPage}
                onChange={handleInputChange}
                bgColor="indigo-700 backdrop-blur-[10px]"
                inputBgColor="zinc-300/30 mix-blend-color-dodge"
                hoverColor="white"
                borderColor="white"
                textColor="white"
                dropdownTextColor="white"
                height="h-10"
                inputTextSize="text-md"
                optionTextSize="text-sm"
                openDirection='down'
                textAlign="left"
                options={[
                    { value: 'Information', label: 'Information' },
                    { value: 'Wishlist', label: 'Wishlist' },
                    { value: 'Watch history', label: 'Watch history' },
                    { value: 'Lunar points', label: 'Lunar points' },
                ]}/>
                </div>
                {/* Sidebar - Ẩn trên mobile */}
                <div className="hidden md:block w-[25%] h-auto">
                    <SideBar />
                </div>
                {/* Main Content */}
                <div className="relative w-full h-auto md:w-[72%]">
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
                    <div className="p-6 md:p-8 w-full mx-auto">
                        {/* Header */}
                        <div className="flex justify-start items-start mb-6">
                            <h1 className="text-white text-2xl md:text-3xl font-bold font-['Libre_Franklin']">
                                Watch History
                            </h1>
                        </div>


                        {/* Loading State */}
                        {isLoading && (
                            <div className="w-full text-center py-8">
                                <p className="text-white text-sm font-['Unbounded'] opacity-60">
                                    Loading watch history...
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {watchHistoryError && (
                            <div className="w-full text-center py-8">
                                <p className="text-red-400 text-sm font-['Unbounded']">
                                    Error: {watchHistoryError}
                                </p>
                            </div>
                        )}

                        {/* Watch History Content */}
                        <div className="w-full flex flex-col justify-start items-start gap-1">
                            
                            {/* Table Header - Desktop Grid */}
                            <div className="hidden md:grid w-full grid-cols-[0px_100px_1fr_70px_1fr_80px] gap-2 items-center">
                                <div /> {/* Spacer */}
                                <div className="text-white text-[10px] font-medium font-['Unbounded']">
                                    Ticket ID
                                </div>
                                <div className="text-white text-[10px] font-medium font-['Unbounded']">
                                    Movie
                                </div>
                                <div className="text-white text-[10px] font-medium font-['Unbounded'] text-center">
                                    Time
                                </div>
                                <div className="text-white text-[10px] font-medium font-['Unbounded'] text-center">
                                    Location
                                </div>
                                <div /> {/* Button spacer */}
                            </div>

                            {/* Header Divider - Ẩn trên mobile */}
                            <div className="hidden md:block self-stretch h-0.5 mix-blend-color-dodge bg-zinc-300/30" />

                            {/* Table Rows - Desktop Grid */}
                            <div className="hidden md:block w-full">
                                {currentPageData.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <div className="w-full grid grid-cols-[0px_100px_1fr_70px_1fr_80px] gap-2 items-start py-2 min-h-[32px]">
                                            <div /> {/* Spacer */}
                                            
                                            {/* Ticket ID */}
                                            <div className="text-white text-[10px] font-medium font-['Unbounded']">
                                                {item.id}
                                            </div>
                                            
                                            {/* Movie Title */}
                                            <div className="text-white text-[10px] font-['Unbounded'] leading-tight break-words pr-2">
                                                <span >{item.movie}</span>
                                            </div>
                                            
                                            {/* Time & Date */}
                                            <div className="text-center text-white text-[10px] font-medium font-['Unbounded'] leading-tight whitespace-nowrap">
                                                {item.time}<br/>{item.date}
                                            </div>
                                            
                                            {/* Location */}
                                            <div className="text-center text-white text-[10px] font-medium font-['Unbounded'] leading-tight break-words px-1">
                                                {item.location}
                                            </div>
                                            
                                            {/* View Button */}
                                            <div className="flex justify-center items-start pt-0">
                                                <button
                                                    onClick={() => handleViewTicket(item.id)}
                                                    className="w-16 h-5 bg-pink-400 rounded-xl shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-pink-300 transition-colors duration-200"
                                                >
                                                    <div className="text-center text-white text-[10px] font-bold font-['Unbounded']">
                                                        VIEW
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Row Divider */}
                                        <div className="w-full h-0.5 mix-blend-color-dodge bg-zinc-300/30" />
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Mobile Layout - Card Style*/}
                            {currentPageData.map((item, index) => (
                                <div key={`mobile-${item.id}`} className="block md:hidden w-full bg-zinc-800/30 rounded-lg p-4 mb-3">
                                    <div className="flex flex-col gap-3">
                                        {/* Movie Title & Ticket ID */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <div className="text-white text-sm font-bold font-['Unbounded'] leading-tight mb-1">
                                                    <span className="font-bold">{item.movie}</span>
                                                </div>
                                                <div className="text-white/70 text-xs font-light font-['Unbounded']">
                                                    Ticket ID: {item.id}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewTicket(item.id)}
                                                className="w-16 h-6 bg-pink-400 rounded-lg shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:bg-pink-300 transition-colors duration-200 flex-shrink-0"
                                            >
                                                <div className="text-center text-white text-[10px] font-bold font-['Unbounded']">
                                                    VIEW
                                                </div>
                                            </button>
                                        </div>

                                        {/* Time & Location */}
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="text-white/70 text-xs font-light font-['Unbounded'] mb-1">
                                                    Time & Date
                                                </div>
                                                <div className="text-white text-xs font-medium font-['Unbounded']">
                                                    {item.time} • {item.date}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white/70 text-xs font-light font-['Unbounded'] mb-1">
                                                    Location
                                                </div>
                                                <div className="text-white text-xs font-medium font-['Unbounded'] ">
                                                    {item.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {currentPageData.length === 0 && (
                                <div className="w-full text-center py-8">
                                    <p className="text-white text-sm font-['Unbounded'] opacity-60">
                                        No watch history found
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
                            >
                                Previous
                            </button>
                            <span className="text-white text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
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
