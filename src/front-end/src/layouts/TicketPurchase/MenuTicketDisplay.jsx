import React, { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import TicketDetail from "@/components/UI/TicketDetail";
import QRCode from "react-qr-code";

const MenuTicketDisplay = ({ movieTicketData, snackTicketData, ticket, ticketLoading }) => {
    const qrParentRef = useRef(null);
    const ticketDetailRef = useRef(null);
    const captureRef = useRef(null);
    const [qrSize, setQrSize] = useState(90);
    const [maxHeight, setMaxHeight] = useState(undefined);
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        function updateSize() {
            // Always reset heights to auto before measuring

            if (qrParentRef.current) {
                const height = qrParentRef.current.offsetHeight;
                // Use different QR size for mobile vs desktop
                if (window.innerWidth < 768) {
                    setQrSize(Math.max(70, Math.min(150, Math.floor(height * 0.7))));
                } else {
                    setQrSize(Math.max(70, Math.min(150, Math.floor(height * 0.3))));
                }
            }

            
            if (ticketDetailRef.current && qrParentRef.current) {
                //change to h-auto
                ticketDetailRef.current.style.height = 'auto';
                qrParentRef.current.style.height = 'auto';
                const qrH = qrParentRef.current.offsetHeight;
                const ticketH = ticketDetailRef.current.offsetHeight;
                // Only set maxHeight for desktop
                console.log("QR Height:", qrH, "Ticket Height:", ticketH);
                
                    setMaxHeight(Math.max(qrH, ticketH));
                    // assign maxHeight to both refs
                ticketDetailRef.current.style.height = `${maxHeight}px`;
                qrParentRef.current.style.height = `${maxHeight}px`;
                console.log("Window Width:", maxHeight);

            }
        }
        updateSize();
        function handleResize() {
            updateSize();
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [maxHeight]);

const handleDownload = async () => {
    if (!captureRef.current || ticketLoading) {
        console.error("Capture element not found or loading");
        return;
    }

    console.log("Starting download...");
    setCapturing(true);

    try {

          // Hide ActionButtons during capture - use a more specific selector
            const buttonContainers = captureRef.current.querySelectorAll('button');
            const buttonOriginalDisplays = [];
            buttonContainers.forEach((container, index) => {
                buttonOriginalDisplays[index] = container.style.display;
                container.style.display = 'none';
            });
        // Ensure the capture element has proper dimensions
        const rect = captureRef.current.getBoundingClientRect();

        console.log("Capture dimensions:", rect);
        // Perform the capture with background layer
        const dataUrl = await toPng(captureRef.current, {
            quality: 1.0,
            pixelRatio: 2,
            width: rect.width,
            height: rect.height,
            overflow: 'hidden',
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left'
            }
        });

        // Restore button visibility
            buttonContainers.forEach((container, index) => {
                if (buttonOriginalDisplays[index]) {
                    container.style.display = buttonOriginalDisplays[index];
                } else {
                    container.style.removeProperty('display');
                }
            });

        // Create and trigger download
        const link = document.createElement("a");
        link.download = "ticket.png";
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Download completed");

    } catch (err) {
        console.error("Download failed:", err);
    } finally {
        setCapturing(false);
    }
};

    const LoadingIndicator = () => (
        <div className="flex items-center justify-center h-full">
            <div className="text-white text-2xl p-5 font-bold font-['Unbounded'] animate-pulse">
                • • •
            </div>
        </div>
    );

    const ActionButtons = () => (
        <>
            {!capturing&&<button
                className={`group relative flex aspect-auto w-40 h-9 flex-row items-center justify-center transition-all duration-300 ${
                    ticketLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                disabled={ticketLoading}
                // onClick={handleReturnHome}
                style={{ cursor: ticketLoading ? "not-allowed" : "pointer" }}
            >
                <div className={`absolute h-full w-full rounded-xl mix-blend-screen bg-zinc-300/30 transition-all duration-300 ${
                    !ticketLoading ? 'group-hover:bg-zinc-400/30' : ''
                }`} />
                <span className="relative z-10 w-36 text-center text-white text-sm font-bold font-['Unbounded']">
                    RETURN HOME
                </span>
            </button>
}{!capturing&&
            <button
                className={`group relative flex aspect-auto w-72 h-9 flex-row items-center justify-center transition-all duration-300 ${
                    ticketLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={handleDownload}
                disabled={ticketLoading}
                style={{ cursor: ticketLoading ? "not-allowed" : "pointer" }}
            >
                <div className={`absolute h-full w-full rounded-xl bg-pink-400 shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 ${
                    !ticketLoading ? 'group-hover:bg-purple-600' : ''
                }`} />
                <span className="relative z-10 w-60 text-center text-white text-base font-bold font-['Unbounded']">
                    DOWNLOAD
                </span>
            </button>
}
        </>
    );

    const {movieTicket, snackTicket} = ticket.data
    console.log("Movie Ticket:", movieTicket);
    console.log("Snack Ticket:", snackTicket);

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[calc(75vw)]"
            ref={captureRef}>
                {/* Background layer */}
                <div className={`pointer-events-none absolute inset-0 z-0 rounded-xl ${capturing ? 'bg-slate-950' : 'bg-zinc-300/30 mix-blend-color-dodge'}  lg:[transform:translate3d(0,0,0)]`} />
                {/* Main content */}
                <div className="relative flex flex-1 flex-col items-center justify-center px-2 sm:px-4 md:px-8">
                    <div className="w-auto inline-flex justify-start items-start gap-3.5 py-5 md:hidden">
                        <ActionButtons />
                    </div>
                    <div>
                        <div className="w-full text-center pb-5 md:pb-3 md:py-3 text-white text-xl sm:text-2xl md:text-3xl font-bold font-['Unbounded'] leading-tight break-words">
                            YOUR PURCHASE IS SUCCESSFUL!
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-5">
                            <div
                                className="flex flex-row md:flex-col h-auto w-[90vw] min-h-[100px] md:w-[21vw] items-center justify-center rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)] py-3 md:py-0"
                                ref={qrParentRef}
                                style={maxHeight ? { height: maxHeight + 'px' } : { height: 'auto' }}
                            >
                                {ticketLoading ? (
                                    <LoadingIndicator />
                                ) : (
                                    <>
                                        {movieTicket?.ticketCode ? (
                                            <div className="w-[90%] flex flex-col justify-center items-center py-2">
                                                <div className="h-auto text-center justify-start text-white text-base font-black font-['Unbounded']">
                                                    TICKET
                                                </div>
                                                <div className="bg-white p-1 rounded-lg border-4 border-white flex items-center justify-center">
                                                    <QRCode value={JSON.stringify(movieTicket?.ticketCode)} size={qrSize} />
                                                </div>
                                            </div>
                                        ) : null}
                                        {snackTicket?.snackTicketCode ? (
                                            <div className="w-[90%] flex flex-col justify-center items-center py-2">
                                                <div className="h-auto text-center justify-start text-white text-base font-black font-['Unbounded']">
                                                    SNACK
                                                </div>
                                                <div className="bg-white p-1 rounded-lg border-4 border-white flex items-center justify-center">
                                                    <QRCode value={JSON.stringify(snackTicket?.snackTicketCode)} size={qrSize} />
                                                </div>
                                            </div>
                                        ) : null}
                                    </>
                                )}
                            </div>
                            <div
                                className="h-full w-[90vw] md:w-[48vw] pb-5 md:pb-0"
                                ref={ticketDetailRef}
                                style={maxHeight ? { height: maxHeight + 'px' } : { height: 'auto' }}
                            >
                                {ticketLoading ? (
                                    <div className="flex items-center justify-center h-full min-h-[200px] rounded-xl bg-zinc-300/30 mix-blend-color-dodge">
                                        <LoadingIndicator />
                                    </div>
                                ) : (
                                    <TicketDetail
                                        movieTicketData={movieTicketData}
                                        snackTicketData={snackTicketData}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="w-auto hidden md:inline-flex justify-start items-start gap-3.5 py-5">
                        <ActionButtons />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuTicketDisplay;