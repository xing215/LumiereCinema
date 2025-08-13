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
        <div className="fixed top-5 left-1/2 z-[99999] flex h-16 w-[calc(100vw-3rem)] max-w-full -translate-x-1/2 items-center overflow-hidden rounded-xl px-6 py-4">
            <div className={`absolute top-0 left-0 h-16 w-full rounded-xl backdrop-blur-[20px] ${isAuthError ? 'bg-red-300/70' : 'bg-zinc-300/70'}`} />
            <div className="relative z-10 flex h-12 items-center">
                <div className="relative flex h-12 w-12 items-center justify-center">
                    <img className="h-12 w-12" src={errorCircle} />
                    {isSessionExpired ? (
                        <LogOut className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-red-800" strokeWidth={3} />
                    ) : (
                        <X className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-red-800" strokeWidth={4} />
                    )}
                </div>
                <div className="ml-4 line-clamp-2 max-w-[60vw] cursor-pointer overflow-hidden font-['Unbounded'] text-base font-medium text-slate-900" style={{ display: 'block' }} title={fullMsg}>
                    {isSessionExpired && <span className="font-semibold text-red-700">Session Expired: </span>}
                    {isAuthError && !isSessionExpired && <span className="font-semibold text-red-700">Access Denied: </span>}
                    {errorMsg}
                </div>
            </div>
            <div className="flex w-44 items-center justify-end gap-3.5" style={{ position: 'absolute', right: '1.5rem', top: '1rem' }}>
                <div className="relative h-7 w-7 cursor-pointer" onClick={() => setVisible(false)}>
                    <div className={`absolute top-[-3px] left-[-3px] h-9 w-9 rounded-lg shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] ${isAuthError ? 'bg-red-500' : 'bg-sky-400'}`} />
                    <div className="absolute top-[7px] left-[19.08px] h-4 w-1 origin-top-left rotate-45 bg-white" />
                    <div className="absolute top-[10.27px] left-[6.99px] h-4 w-1 origin-top-left -rotate-45 bg-white" />
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default ErrorModal;
