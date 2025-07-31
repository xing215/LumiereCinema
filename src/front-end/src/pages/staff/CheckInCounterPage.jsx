import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Camera, User } from 'lucide-react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import { useGetTicketDetailsByCode } from '@hooks/useTicket';
import QrScannerView from '@components/display/QRScanView';

const TicketDetails = ({ ticket, loading, error, isScannerVisible }) => {
    if (loading) {
        return <p className="font-unbounded text-xl md:text-2xl font-bold text-white">SEARCHING...</p>;
    }
    if (error) {
        return <p className="font-unbounded text-xl md:text-2xl font-bold text-red-500">{error}</p>;
    }
    if (!ticket) {
        return <p className="font-unbounded text-xl md:text-2xl font-bold text-gray-400">ENTER TICKET CODE</p>;
    }

    if (ticket.ticketType === 'Movie') {
        return (
            <>
                <p className="font-unbounded flex-nowrap pb-2 text-xl font-black text-white md:pb-4 md:text-2xl">TICKET DETAILS</p>
                <p className={`font-unbounded py-1 text-base font-bold md:py-4 md:text-2xl ${ticket.status === 'Confirmed' ? 'text-green-400' : 'text-red-400'}`}>VALIDITY: {ticket.status.toUpperCase()}</p>
                <p className="font-unbounded py-1 text-base font-bold text-white md:py-4 md:text-xl mb-4">LAST SCAN: {ticket.lastScanAt ? dayjs(ticket.lastScanAt).format('HH:mm DD/MM/YYYY') : 'NONE'}</p>
                
                <div className={` flex w-[90%] flex-col overflow-y-auto py-1 md:gap-2 md:py-4 lg:w-[80%] ${isScannerVisible ? 'gap-y-2' : 'gap-y-6'}`}>
                    <p className="font-unbounded flex-shrink-0 text-start text-xs font-semibold text-white md:text-base">Ticket ID: {ticket.ticketCode}</p>
                    <p className="font-unbounded flex-shrink-0 text-start text-xs font-semibold text-white md:text-base">Movie: {ticket.schedule.movie.title}</p>
                    <p className="font-unbounded flex-shrink-0 text-start text-xs font-semibold text-white md:text-base">Date: {dayjs(ticket.schedule.startTime).format('DD/MM/YYYY')}</p>
                    
                    <div className={`grid w-full grid-cols-1 gap-x-4 pt-2 md:grid-cols-2 md:gap-2 ${isScannerVisible ? 'gap-y-2' : 'gap-y-6'}`}>
                        <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Time: {dayjs(ticket.schedule.startTime).format('HH:mm')} - {dayjs(ticket.schedule.endTime).format('HH:mm')}</p>
                        <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Cinema: {ticket.schedule.screen.screenName}</p>
                        <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Ticket: {ticket.adultTickets && ticket.discountedTickets ? (ticket.adultTickets > 0  ? `${ticket.adultTickets} Adult Ticket(s)` : '') + (ticket.adultTickets > 0 && ticket.discountedTickets > 0 ? `, ` : '' ) + (ticket.discountedTickets>0 ? `${ticket.discountedTickets} Student/Elder Ticket(s)` : '') : `${ticket.seats.length} ticket(s)`}</p>
                        <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Seat: {ticket.seats.join(', ')}</p>
                    </div>
                </div>
            </>
        );
    } else if (ticket.ticketType === 'Snack') {
        return (
            <>
                <p className="font-unbounded flex-nowrap pb-2 text-xl font-black text-white md:pb-4 md:text-2xl">SNACK TICKET DETAILS</p>
                <p className={`font-unbounded py-1 text-base font-bold md:py-4 md:text-2xl ${ticket.status === 'Confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>VALIDITY: {ticket.status.toUpperCase()}</p>
                <p className="font-unbounded py-1 text-base font-bold text-white md:py-4 md:text-xl">LAST SCAN: {ticket.lastScanAt ? dayjs(ticket.lastScanAt).format('HH:mm DD/MM/YYYY') : 'NONE'}</p>
                <div className={`flex w-[90%] flex-col overflow-y-auto py-1 md:gap-2 md:py-4 lg:w-[80%] ${isScannerVisible ? 'gap-y-2' : 'gap-y-6'}`}>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Ticket ID: {ticket.snackTicketCode}</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Branch: {ticket.branch.name}</p>
                    <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Date: {dayjs(ticket.createdAt).format('DD/MM/YYYY')}</p>
                    <div className="grid w-full grid-cols-1 gap-1 pt-2 md:gap-2">
                        <span className="font-unbounded text-start text-xs font-semibold text-white md:text-base">
                            Items: {ticket.snackList.map(item => `${item.quantity} ${item.snack?.name || 'Snack'}`).join(', ')}
                        </span>
                    </div>
                </div>
            </>
        );
    }
    return <p className="font-unbounded text-xl md:text-2xl font-bold text-red-500">UNKNOWN TICKET TYPE</p>;
};


const CheckInCounterPage = ({ initialScannerVisible = false }) => {
    const [now, setNow] = useState(new Date());
    const [ticketCode, setTicketCode] = useState('');
    const { getTicket, ticket, loading, error } = useGetTicketDetailsByCode();
    const [isScannerVisible, setIsScannerVisible] = useState(initialScannerVisible);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (code) => {
        if (code && code.trim()) {
            getTicket(code.trim().toUpperCase());
        }
    };
    
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch(ticketCode);
            inputRef.current.blur(); // Remove focus from input after search
        }
    };

    const handleScanSuccess = (decodedText) => {
        const cleanedCode = decodedText.replace(/"/g, "");
        setTicketCode(cleanedCode);
        handleSearch(cleanedCode);
    };

    const inputRef = useRef(null);

    return (
        <StaffLayout>
            <div className="flex flex-col transition-all duration-500 relative z-10 h-full w-full justify-start pt-[20%] md:pt-[5%] md:pb-[5%] items-center">
                <div className="absolute top-0 h-[10%] w-full md:-top-6 md:h-[20%] lg:h-[13%]">
                    <div className="relative h-full w-full">
                        <p className="font-unbounded text-md absolute top-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 transform font-bold text-nowrap text-white md:translate-y-1/2 md:text-2xl">
                            {dayjs(now).format('DD/MM/YYYY - HH:mm:ss')}
                        </p>
                    </div>
                </div>

                <div className="flex h-auto w-[90%] flex-col items-center justify-center gap-4 rounded-xl bg-blue-800/30 p-4 mix-blend-color-dodge md:h-full md:flex-row md:items-start md:gap-8">
                
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
                        ${isScannerVisible ? 'w-full h-[70%] md:h-full md:w-1/2' : 'h-full w-full md:h-full md:w-[70%] lg:w-[50%]'}
                    `}>
                        <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
                            {/* THAY ĐỔI 2: Truyền isScannerVisible xuống cho TicketDetails */}
                            <TicketDetails ticket={ticket} loading={loading} error={error} isScannerVisible={isScannerVisible} />
                            <div className="relative mt-auto flex w-full flex-shrink-0 items-center gap-2 pt-3 md:gap-4 md:pt-8 lg:w-[80%]">
                                <p className="font-unbounded text-start text-xs font-semibold text-white md:text-base">Ticket:</p>
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