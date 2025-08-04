import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScannerView = ({ onScanSuccess, onClose }) => {
    const readerId = "qr-code-reader-container";

    const latestCallbacks = useRef({ onScanSuccess, onClose });
    useEffect(() => {
        latestCallbacks.current.onScanSuccess = onScanSuccess;
        latestCallbacks.current.onClose = onClose;
    }, [onScanSuccess, onClose]);

    const html5QrCodeRef = useRef(null);
    const isScannerRunningRef = useRef(false);
    
    // Cache và debounce cho scan results
    const lastScannedCode = useRef(null);
    const lastScanTime = useRef(0);
    const scanCooldown = 2000; // 2 giây cooldown giữa các lần scan

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(readerId, { verbose: false });
        html5QrCodeRef.current = html5QrCode;
        isScannerRunningRef.current = false;

        const startScanner = async () => {
            if (isScannerRunningRef.current) return;
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: null                    },
                    (decodedText, decodedResult) => {
                        const cleanedCode = decodedText.replace(/"/g, "");
                        const currentTime = Date.now();
                        
                        // Kiểm tra debounce - tránh scan trùng lặp
                        if (
                            lastScannedCode.current === cleanedCode && 
                            currentTime - lastScanTime.current < scanCooldown
                        ) {
                            return; // Bỏ qua scan trùng lặp
                        }
                        
                        // Cập nhật cache
                        lastScannedCode.current = cleanedCode;
                        lastScanTime.current = currentTime;
                        
                        latestCallbacks.current.onScanSuccess(cleanedCode);
                    },
                    (errorMessage) => { /* Bỏ qua lỗi */ }
                );
                isScannerRunningRef.current = true;
            } catch (err) {
                console.error("Không thể khởi động camera.", err);
            }
        };

        const startTimeout = setTimeout(() => {
            startScanner();
        }, 550);

        return () => {
            clearTimeout(startTimeout);
            const cleanup = async () => {
                if (isScannerRunningRef.current && html5QrCodeRef.current) {
                    isScannerRunningRef.current = false;
                    try {
                        await html5QrCodeRef.current.stop();
                    } catch (err) {
                        console.warn("Cảnh báo khi dừng camera:", err);
                    }
                }
            };
            cleanup();
        };
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg">
            <div id={readerId} className="h-full w-full"></div>
            
                <button
                    onClick={async () => {
                        // Stop scanning before closing
                        if (isScannerRunningRef.current && html5QrCodeRef.current) {
                            try {
                                await html5QrCodeRef.current.stop();
                            } catch (err) {
                                console.warn("Cảnh báo khi dừng camera:", err);
                            }
                            isScannerRunningRef.current = false;
                        }
                        latestCallbacks.current.onClose();
                    }}
                    className="absolute top-2 right-2 z-100 text-white font-['Unbounded'] text-4xl font-bold hover:bg-white/40 rounded-full h-auto px-3 aspect-square"
                >
                    ×
                </button>
            {/* Lớp phủ viewfinder CSS CỦA BẠN */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 border-[40px] border-black/30 md:border-[60px]"></div>
                <div className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 aspect-square">
                    <div className="absolute -top-1 -left-1 h-12 w-12 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute -top-1 -right-1 h-12 w-12 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 h-12 w-12 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute -bottom-1 -right-1 h-12 w-12 border-b-4 border-r-4 border-white"></div>
                </div>
            </div>
        </div>
    );
};

export default QrScannerView;