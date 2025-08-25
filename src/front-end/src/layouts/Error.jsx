import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import errorCircle from '@assets/img/backAndForwardButton.png';
import { X, LogOut } from 'lucide-react';
import { useEffect } from 'react';

const ErrorModal = ({ errorCode = null, errorMsg = 'An error occurs', onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!visible && onClose) {
            onClose();
        }
    }, [visible, onClose]);

    if (!visible) return null;

    const fullMsg = errorCode ? `${errorCode}: ${errorMsg}` : errorMsg;
    const isAuthError = errorCode === 401 || errorCode === 403;
    const isSessionExpired = errorCode === 401;

    return createPortal(
        <div className="fixed top-2 left-1/2 z-[99999] flex h-auto min-h-12 w-[calc(100vw-1rem)] max-w-md -translate-x-1/2 items-center overflow-hidden rounded-lg px-3 py-2 sm:top-5 sm:w-[calc(100vw-2rem)] sm:max-w-lg sm:rounded-xl sm:px-4 sm:py-3 md:max-w-xl lg:max-w-2xl">
            <div className={`absolute top-0 left-0 h-full w-full rounded-lg backdrop-blur-[20px] sm:rounded-xl ${isAuthError ? 'bg-red-300/70' : 'bg-zinc-300/70'}`} />
            <div className="relative z-10 flex items-center">
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center sm:h-10 sm:w-10 md:h-12 md:w-12">
                    <img className="h-full w-full" src={errorCircle} />
                    {isSessionExpired ? (
                        <LogOut className="pointer-events-none absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-red-800 sm:h-6 sm:w-6 md:h-7 md:w-7" strokeWidth={3} />
                    ) : (
                        <X className="pointer-events-none absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-red-800 sm:h-6 sm:w-6 md:h-7 md:w-7" strokeWidth={4} />
                    )}
                </div>
                <div
                    className="ml-2 flex-1 cursor-pointer overflow-hidden font-['Unbounded'] text-xs font-medium text-slate-900 sm:ml-3 sm:text-sm md:ml-4 md:text-base"
                    style={{ display: 'block' }}
                    title={fullMsg}
                >
                    {isSessionExpired && <span className="font-semibold text-red-700">Session Expired: </span>}
                    {isAuthError && !isSessionExpired && <span className="font-semibold text-red-700">Access Denied: </span>}
                    <span className="break-words">{errorMsg}</span>
                </div>
            </div>
            <div className="relative ml-2 flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center sm:ml-3 sm:h-7 sm:w-7" onClick={() => setVisible(false)}>
                <div className={`absolute h-8 w-8 rounded-lg shadow-[inset_0px_0px_30px_2px_rgba(155,47,255,0.8)] sm:h-9 sm:w-9 ${isAuthError ? 'bg-red-500' : 'bg-sky-400'}`} />
                <X className="relative h-4 w-4 text-white sm:h-5 sm:w-5" strokeWidth={2} />
            </div>
        </div>,
        document.body,
    );
};

export default ErrorModal;
