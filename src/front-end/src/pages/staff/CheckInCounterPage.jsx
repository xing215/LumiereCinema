import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Camera, User } from 'lucide-react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import { useGetTicketDetailsByCode, useUpdateTicketStatus } from '@hooks/useTicket';
import QrScannerView from '@components/display/QRScanView';
import CustomDropdown from '@components/UI/CustomDropdown';
import { showSuccess, showError } from '@utils/sweetalert.js';

const TicketDetails = ({ ticket, loading, error, isScannerVisible, onStatusChange }) => {
    const statusOptions = [
        { value: 'Confirmed', label: 'CONFIRMED' },
        { value: 'CheckedIn', label: 'CHECKED IN' },
        { value: 'Cancelled', label: 'CANCELLED' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'blue-400';
            case 'CheckedIn':
                return 'green-400';
            case 'Cancelled':
                return 'red-400';
            default:
                return 'white';
        }
    };

    const handleDropdownChange = (e) => {
        if (onStatusChange) {
            onStatusChange(e.target.value);
        }
    };

    // Show loading only when no ticket is available (initial search)
    if (loading && !ticket) {
        return (
            <div className="flex flex-col items-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                <p className="font-unbounded text-xl font-bold text-white md:text-2xl">SEARCHING...</p>
            </div>
        );
    }
    if (error) {
        return <p className="font-unbounded text-xl font-bold text-red-500 md:text-2xl">{error}</p>;
    }
    if (!ticket) {
        return <p className="font-unbounded pb-2 text-xl font-bold text-gray-400 md:text-2xl">ENTER TICKET CODE</p>;
    }
    if (ticket.ticketType === 'Movie') {
        return (
            <div className="flex h-auto max-h-[350px] w-full flex-col items-center md:h-auto md:max-h-[500px] md:overflow-y-auto">
                <p className="font-unbounded flex-nowrap pb-1 text-xl font-black text-white md:pb-2 md:text-xl lg:text-2xl">TICKET DETAILS</p>
                <div className="relative w-[200px] py-1">
                    {loading && ticket && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/20">
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        </div>
                    )}
                    <CustomDropdown
                        value={ticket.status}
                        onChange={handleDropdownChange}
                        name="ticketStatus"
                        placeholder="Select Status"
                        bgColor="white"
                        inputBgColor="transparent"
                        hoverColor="purple-600"
                        borderColor=""
                        textColor={getStatusColor(ticket.status)}
                        dropdownTextColor="black"
                        height="h-8"
                        inputTextSize="text-xl"
                        optionTextSize="text-md"
                        openDirection="down"
                        textAlign="center"
                        forceFillLabel={true}
                        options={statusOptions}
                        disabled={loading && ticket}
                    />
                </div>
                <p className="font-unbounded w-[90%] py-1 text-base font-bold text-white md:w-auto md:text-lg lg:text-xl">
                    <span className="block md:inline">LAST SCAN:</span>
                    <span className="block md:inline">{ticket.lastScanAt ? dayjs(ticket.lastScanAt).format('DD/MM/YYYY - HH:mm') : 'NONE'}</span>
                </p>
                <div className={`flex h-auto w-[90%] flex-col py-1 md:gap-2 lg:w-[80%] ${isScannerVisible ? 'gap-y-1' : 'gap-y-2'}`}>
                    <p className="font-unbounded flex-shrink-0 text-start text-sm font-semibold text-white md:text-sm lg:text-base">Ticket ID: {ticket.ticketCode}</p>
                    <p className="font-unbounded flex-shrink-0 text-start text-sm font-semibold text-white md:text-sm lg:text-base">Movie: {ticket.schedule.movie.title}</p>
                    <p className="font-unbounded flex-shrink-0 text-start text-sm font-semibold text-white md:text-sm lg:text-base">Date: {dayjs(ticket.schedule.startTime).format('DD/MM/YYYY')}</p>
                    <div className={`grid w-full grid-cols-1 gap-x-4 pt-2 pb-3 md:grid-cols-2 md:gap-2 ${isScannerVisible ? 'gap-y-1' : 'gap-y-2'}`}>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">
                            Time: {dayjs(ticket.schedule.startTime).format('HH:mm')} - {dayjs(ticket.schedule.endTime).format('HH:mm')}
                        </p>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Cinema: {ticket.schedule.screen.screenName}</p>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">
                            Ticket:{' '}
                            {ticket.adultTickets !== undefined && ticket.discountedTickets !== undefined
                                ? (ticket.adultTickets > 0 ? `${ticket.adultTickets} Adult Ticket(s)` : '') +
                                  (ticket.adultTickets > 0 && ticket.discountedTickets > 0 ? `, ` : '') +
                                  (ticket.discountedTickets > 0 ? `${ticket.discountedTickets} Student/Elder Ticket(s)` : '')
                                : `${ticket.seats.length} ticket(s)`}
                        </p>
                        <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Seat: {ticket.seats.join(', ')}</p>
                    </div>
                </div>
            </div>
        );
    } else if (ticket.ticketType === 'Snack') {
        return (
            <div className="flex h-auto max-h-[350px] w-full flex-col items-center md:h-auto md:max-h-[500px] md:overflow-y-auto">
                <p className="font-unbounded flex-nowrap pb-1 text-xl font-black text-white md:pb-2 md:text-xl lg:text-2xl">SNACK TICKET DETAILS</p>
                <div className="relative w-[200px] py-1">
                    {loading && ticket && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-black/20">
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        </div>
                    )}
                    <CustomDropdown
                        value={ticket.status}
                        onChange={handleDropdownChange}
                        name="ticketStatus"
                        placeholder="Select Status"
                        bgColor="white"
                        inputBgColor="transparent"
                        hoverColor="purple-600"
                        borderColor=""
                        textColor={getStatusColor(ticket.status)}
                        dropdownTextColor="black"
                        height="h-8"
                        inputTextSize="text-xl"
                        optionTextSize="text-md"
                        openDirection="down"
                        textAlign="center"
                        forceFillLabel={true}
                        options={statusOptions}
                        disabled={loading && ticket}
                    />
                </div>
                <p className="font-unbounded w-[90%] py-1 text-base font-bold text-white md:w-auto md:text-lg lg:text-xl">
                    <span className="block md:inline">LAST SCAN:</span>
                    <span className="block md:inline">{ticket.lastScanAt ? dayjs(ticket.lastScanAt).format('DD/MM/YYYY - HH:mm') : 'NONE'}</span>
                </p>
                <div className={`flex w-[90%] flex-col py-1 md:gap-2 md:py-4 lg:w-[80%] ${isScannerVisible ? 'gap-y-1' : 'gap-y-2'}`}>
                    <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Ticket ID: {ticket.snackTicketCode}</p>
                    <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Branch: {ticket.branch.name}</p>
                    <p className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">Date: {dayjs(ticket.createdAt).format('DD/MM/YYYY')}</p>
                    <div className="grid w-full grid-cols-1 gap-1 pt-2 pb-3 md:gap-2">
                        <span className="font-unbounded text-start text-sm font-semibold text-white md:text-sm lg:text-base">
                            Items: {ticket.snackList.map((item) => `${item.quantity} ${item.snack?.name || 'Snack'}`).join(', ')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return <p className="font-unbounded text-xl font-bold text-red-500 md:text-2xl">UNKNOWN TICKET TYPE</p>;
};

const CheckInCounterPage = ({ initialScannerVisible = false }) => {
    const [now, setNow] = useState(new Date());
    const [ticketCode, setTicketCode] = useState('');
    const { getTicket, ticket, loading, error } = useGetTicketDetailsByCode();
    const { updateTicketStatus, loading: updateLoading, error: updateError } = useUpdateTicketStatus();
    const [isScannerVisible, setIsScannerVisible] = useState(initialScannerVisible);
    const [localTicket, setLocalTicket] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Update local ticket when the fetched ticket changes
    useEffect(() => {
        setLocalTicket(ticket);
    }, [ticket]);

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

    const handleStatusChange = async (newStatus) => {
        if (!localTicket) return { success: false, error: 'No ticket selected' };

        const ticketCodeToUpdate = localTicket.ticketCode || localTicket.snackTicketCode;
        if (!ticketCodeToUpdate) return { success: false, error: 'No ticket code found' };

        try {
            // Set updating status to show loading state while keeping ticket visible
            setIsUpdatingStatus(true);

            const result = await updateTicketStatus(ticketCodeToUpdate, newStatus);

            if (result.success) {
                // Small delay to ensure backend has processed the update
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Force refresh by calling getTicket with forceRefresh=true to bypass cache
                const refreshResult = await getTicket(ticketCodeToUpdate, true);

                if (refreshResult.success) {
                    showSuccess('Status Updated', `Ticket status has been updated to ${newStatus}`);
                    return { success: true };
                } else {
                    // Backend update succeeded but re-fetch failed
                    showError('Update Warning', 'Status updated but failed to refresh ticket data. Please search again.');
                    return { success: true }; // Status was updated successfully
                }
            } else {
                showError('Update Failed', result.error || 'Failed to update ticket status');
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Failed to update ticket status';
            showError('Update Failed', errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            // Always clear the updating status
            setIsUpdatingStatus(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch(ticketCode);
            inputRef.current.blur(); // Remove focus from input after search
        }
    };
    const handleScanSuccess = (decodedText) => {
        const cleanedCode = decodedText.replace(/"/g, '');
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
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-start pt-[20%] transition-all duration-500 md:pt-[7%] md:pb-[5%] lg:pt-[5%]">
                <div className="absolute top-0 h-[10%] w-full md:-top-6 md:h-[20%] lg:h-[13%]">
                    <div className="relative h-full w-full">
                        <p className="font-unbounded text-md absolute top-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 transform font-bold text-nowrap text-white md:translate-y-1/2 md:text-2xl">
                            {dayjs(now).format('DD/MM/YYYY - HH:mm:ss')}
                        </p>
                    </div>
                </div>

                <div className="mb-10 flex h-auto w-[90%] flex-col items-center justify-center gap-4 rounded-xl bg-blue-800/30 p-4 mix-blend-color-dodge md:mb-0 md:h-full md:flex-row md:items-start md:gap-8">
                    <div
                        className={`flex-shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${isScannerVisible ? 'aspect-square w-full opacity-100 md:h-full md:w-1/2' : 'h-0 w-0 opacity-0'} `}
                    >
                        {isScannerVisible && (
                            <div className="relative h-full w-full">
                                <QrScannerView onScanSuccess={handleScanSuccess} onClose={() => setIsScannerVisible(false)} />
                            </div>
                        )}
                    </div>

                    <div
                        className={`no-scrollbar flex h-auto flex-col items-center justify-center transition-all duration-500 ease-in-out md:h-full md:overflow-scroll ${isScannerVisible ? 'w-full md:w-1/2' : 'w-full md:w-[70%] lg:w-[50%]'} `}
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center">
                            {/* THAY ĐỔI 2: Truyền isScannerVisible xuống cho TicketDetails */}
                            <TicketDetails
                                ticket={localTicket}
                                loading={(loading && !localTicket) || isUpdatingStatus}
                                error={error || updateError}
                                isScannerVisible={isScannerVisible}
                                onStatusChange={handleStatusChange}
                            />
                            <div className="relative mt-auto flex w-full flex-shrink-0 items-center gap-2 pt-3 md:gap-4 md:pt-8 lg:w-[80%]">
                                <p className="font-unbounded text-start text-sm font-semibold text-white md:text-base">Ticket:</p>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={ticketCode}
                                    onChange={(e) => setTicketCode(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="relative isolate h-8 w-full rounded-xl bg-zinc-100 px-3 text-black md:h-8 lg:h-9"
                                />
                                <Camera onClick={() => setIsScannerVisible((prev) => !prev)} className="h-8 w-8 flex-shrink-0 text-white hover:cursor-pointer md:h-10 md:w-10" />
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
