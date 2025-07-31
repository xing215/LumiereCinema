import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

const QrScannerView = ({ onScanSuccess, onClose }) => {
    const readerId = "qr-code-reader-container";

    const latestCallbacks = useRef({ onScanSuccess, onClose });
    useEffect(() => {
        latestCallbacks.current.onScanSuccess = onScanSuccess;
        latestCallbacks.current.onClose = onClose;
    }, [onScanSuccess, onClose]);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(readerId, { verbose: false });
        let isScannerRunning = false;

        const startScanner = async () => {
            if (isScannerRunning) return;
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        // THAY ĐỔI QUAN TRỌNG: Tắt khung ngắm mặc định của thư viện
                        qrbox: null 
                    },
                    (decodedText, decodedResult) => {
                        latestCallbacks.current.onScanSuccess(decodedText);
                    },
                    (errorMessage) => { /* Bỏ qua lỗi */ }
                );
                isScannerRunning = true;
            } catch (err) {
                console.error("Không thể khởi động camera.", err);
            }
        };

        // Đợi 550ms để CSS transition của container hoàn thành rồi mới bật camera
        const startTimeout = setTimeout(() => {
            startScanner();
        }, 550);

        // Hàm dọn dẹp
        return () => {
            clearTimeout(startTimeout);
            const cleanup = async () => {
                if (isScannerRunning) {
                    isScannerRunning = false;
                    try {
                        await html5QrCode.stop();
                    } catch (err) {
                        console.warn("Cảnh báo khi dừng camera:", err);
                    }
                }
            };
            cleanup();
        };
    }, []);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
            <div id={readerId} className="h-full w-full"></div>
            
            <button
                onClick={() => latestCallbacks.current.onClose()}
                className="absolute top-2 right-2 z-20 rounded-full bg-red-500/80 p-1.5 text-white transition hover:bg-red-600"
            >
                <X size={24} />
            </button>

            {/* Lớp phủ viewfinder CSS CỦA BẠN */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 border-[40px] border-black/30 md:border-[50px]"></div>
                <div className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: '1 / 1' }}>
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