import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Camera, User } from 'lucide-react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import { useGetTicketDetailsByCode } from '@hooks/useTicket';
import QrScannerView from '@components/display/QRScanView';

const TicketDetails = ({ ticket, loading, error, isScannerVisible }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                <p className="font-unbounded text-xl md:text-2xl font-bold text-white">SEARCHING...</p>
            </div>
        );
    }
    if (error) {
        return <p className="font-unbounded text-xl md:text-2xl font-bold text-red-500">{error}</p>;
    }
    if (!ticket) {
        return <p className="font-unbounded text-xl md:text-2xl pb-2 font-bold text-gray-400">ENTER TICKET CODE</p>;
    }    if (ticket.ticketType === 'Movie') {
        return (
            <div className="h-auto md:h-auto max-h-[350px] md:max-h-[500px] md:overflow-y-auto w-full flex flex-col items-center">
                <p className="font-unbounded flex-nowrap pb-1 text-xl font-black text-white md:pb-2 md:text-xl lg:text-2xl">TICKET DETAILS</p>
                <p className={`font-unbounded py-1 text-base font-bold md:text-xl lg:text-2xl ${ticket.status === 'Confirmed' ? 'text-green-400' : 'text-red-400'}`}>VALIDITY: {ticket.status.toUpperCase()}</p>
                <p className="font-unbounded py-1 text-base font-bold text-white md:text-lg w-[90%] md:w-auto lg:text-xl">
                    <span className="block md:inline">LAST SCAN:</span>
                    <span className="block md:inline">{ticket.lastScanAt ? dayjs(ticket.lastScanAt).format('DD/MM/YYYY - HH:mm') : 'NONE'}</span>
                </p>
                <div className={` flex w-[90%] flex-col h-auto py-1 md:gap-2 lg:w-[80%] ${isScannerVisible ? 'gap-y-1' : 'gap-y-2'}`}>
                    <p className="font-unbounded flex-shrink-0 text-start text-sm font-semibold text-white md:text-sm lg:text-base">Ticket ID: {ticket.ticketCode}</p>
                    <p className="font-unbounded flex-shrink-0 text-start text-sm font-semibold text-white md:text-sm lg:text-base">Movie: {ticket.schedule.movie.title}</p>
                    <p className="font-unbounded flex-shrink-0 text-start text-sm font-semibold text-white md:text-sm lg:text-base">Date: {dayjs(ticket.schedule.startTime).format('DD/MM/YYYY')}</p>
                    <div className={`grid w-full grid-cols-1 gap-x-4 pt-2 md:grid-cols-2 pb-3 md:gap-2 ${isScannerVisible ? 'gap-y-1' : 'gap-y-2'}`}>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Time: {dayjs(ticket.schedule.startTime).format('HH:mm')} - {dayjs(ticket.schedule.endTime).format('HH:mm')}</p>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Cinema: {ticket.schedule.screen.screenName}</p>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Ticket: {ticket.adultTickets !== undefined && ticket.discountedTickets !== undefined ? (ticket.adultTickets > 0  ? `${ticket.adultTickets} Adult Ticket(s)` : '') + (ticket.adultTickets > 0 && ticket.discountedTickets > 0 ? `, ` : '' ) + (ticket.discountedTickets>0 ? `${ticket.discountedTickets} Student/Elder Ticket(s)` : '') : `${ticket.seats.length} ticket(s)`}</p>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Seat: {ticket.seats.join(', ')}</p>
                    </div>
                </div>
            </div>
        );
    } else if (ticket.ticketType === 'Snack') {
        return (
            <div className="h-auto md:h-auto max-h-[350px] md:max-h-[500px] md:overflow-y-auto w-full flex flex-col items-center">
                <p className="font-unbounded flex-nowrap pb-1 text-xl font-black text-white md:pb-2 md:text-xl lg:text-2xl">SNACK TICKET DETAILS</p>
                <p className={`font-unbounded py-1 text-base font-bold md:text-xl lg:py-4 lg:text-2xl ${ticket.status === 'Confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>VALIDITY: {ticket.status.toUpperCase()}</p>
                <p className="font-unbounded py-1 text-base font-bold text-white md:text-lg w-[90%] md:w-auto lg:text-xl">
                    <span className="block md:inline">LAST SCAN:</span>
                    <span className="block md:inline">{ticket.lastScanAt ? dayjs(ticket.lastScanAt).format('DD/MM/YYYY - HH:mm') : 'NONE'}</span>
                </p>
                <div className={`flex w-[90%] flex-col py-1 md:gap-2 md:py-4 lg:w-[80%] ${isScannerVisible ? 'gap-y-1' : 'gap-y-2'}`}>
                    <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Ticket ID: {ticket.snackTicketCode}</p>
                    <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Branch: {ticket.branch.name}</p>
                    <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Date: {dayjs(ticket.createdAt).format('DD/MM/YYYY')}</p>
                    <div className="grid w-full grid-cols-1  pb-3 gap-1 pt-2 md:gap-2">
                        <span className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">
                            Items: {ticket.snackList.map(item => `${item.quantity} ${item.snack?.name || 'Snack'}`).join(', ')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return <p className="font-unbounded text-xl md:text-2xl font-bold text-red-500">UNKNOWN TICKET TYPE</p>;
};


const CheckInCounterPage = ({ initialScannerVisible = false }) => {
    const [now, setNow] = useState(new Date());
    const [ticketCode, setTicketCode] = useState('');
    const { getTicket, ticket, loading, error } = useGetTicketDetailsByCode();
    const [isScannerVisible, setIsScannerVisible] = useState(initialScannerVisible);
    
    // Debounce và cache cho search
    const searchTimeoutRef = useRef(null);
    const lastSearchCode = useRef('');

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (code) => {
        if (!code || !code.trim()) return;
        
        const cleanCode = code.trim().toUpperCase();
        
        // Tránh search trùng lặp
        if (cleanCode === lastSearchCode.current) return;
        lastSearchCode.current = cleanCode;
        
        // Clear timeout trước đó
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            getTicket(cleanCode);
        }, 300);
    };
    
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch(ticketCode);
            inputRef.current.blur(); // Remove focus from input after search
        }
    };    const handleScanSuccess = (decodedText) => {
        const cleanedCode = decodedText.replace(/"/g, "");
        setTicketCode(cleanedCode);
        handleSearch(cleanedCode);
    };

    // Cleanup timeout khi component unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const inputRef = useRef(null);

    return (
        <StaffLayout forCheckin={true}>
            <div className="flex flex-col transition-all duration-500 relative z-10 h-full w-full justify-start pt-[20%] md:pt-[7%] lg:pt-[5%] md:pb-[5%] items-center">
                <div className="absolute top-0 h-[10%] w-full md:-top-6 md:h-[20%] lg:h-[13%]">
                    <div className="relative h-full w-full">
                        <p className="font-unbounded text-md absolute top-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 transform font-bold text-nowrap text-white md:translate-y-1/2 md:text-2xl">
                            {dayjs(now).format('DD/MM/YYYY - HH:mm:ss')}
                        </p>
                    </div>
                </div>

                <div className="flex h-auto w-[90%] flex-col mb-10 md:mb-0 items-center justify-center gap-4 rounded-xl bg-blue-800/30 p-4 mix-blend-color-dodge md:h-full md:flex-row md:items-start md:gap-8">
                
                    <div className={`
                        flex-shrink-0 overflow-hidden transition-all duration-500 ease-in-out
                        ${isScannerVisible ? 'w-full aspect-square opacity-100 md:h-full md:w-1/2' : 'h-0 w-0 opacity-0'}
                    `}>
                        {isScannerVisible && (
                            <div className="relative h-full w-full">
                                <QrScannerView 
                                    onScanSuccess={handleScanSuccess} 
                                    onClose={() => setIsScannerVisible(false)}
                                />
                            </div>
                        )}
                    </div>

                    <div className={`
                        flex flex-col items-center justify-center transition-all duration-500 ease-in-out
                        h-auto md:h-full md:overflow-scroll no-scrollbar
                        ${isScannerVisible ? 'w-full md:w-1/2' : 'w-full md:w-[70%] lg:w-[50%]'}
                    `}>
                        <div className="flex h-full w-full flex-col items-center justify-center ">
                            {/* THAY ĐỔI 2: Truyền isScannerVisible xuống cho TicketDetails */}
                            <TicketDetails ticket={ticket} loading={loading} error={error} isScannerVisible={isScannerVisible} />
                            <div className="relative mt-auto pt-3 flex w-full flex-shrink-0 items-center gap-2 md:gap-4 md:pt-8 lg:w-[80%]">
                                <p className="font-unbounded text-start text-sm font-semibold text-white md:text-base">Ticket:</p>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={ticketCode}
                                    onChange={(e) => setTicketCode(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="relative isolate h-8 w-full rounded-xl bg-zinc-100 px-3 text-black md:h-8 lg:h-9"
                                />
                                <Camera 
                                    onClick={() => setIsScannerVisible(prev => !prev)}
                                    className="h-8 w-8 flex-shrink-0 text-white hover:cursor-pointer md:h-10 md:w-10" 
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <div className="absolute inset-0 z-0">
                <div className="tranform absolute top-0 left-1/5 h-52 w-52 -translate-y-1/2 rounded-full bg-sky-400/60 mix-blend-lighten blur-[100px]" />
                <div className="tranform absolute top-1/4 left-0 h-44 w-44 -translate-x-1/2 rounded-full bg-pink-400/60 mix-blend-lighten blur-[100px]" />
                <div className="absolute top-1/2 right-1/11 h-28 w-28 rounded-full bg-amber-300/60 mix-blend-lighten blur-[100px]" />
                <div className="tranform absolute right-0 bottom-0 h-56 w-56 translate-x-1/2 rounded-full bg-purple-600/60 mix-blend-lighten blur-[100px]" />
            </div>
        </StaffLayout>
    );
};

export default CheckInCounterPage;