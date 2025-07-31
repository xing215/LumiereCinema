

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import errorCircle from '@assets/img/backAndForwardButton.png';
import { X } from 'lucide-react';



import { useEffect } from 'react';

const ErrorModal = ({ errorCode = null, errorMsg = "An error occurs", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible && onClose) {
      onClose();
    }
  }, [visible, onClose]);
  if (!visible) return null;

  const fullMsg = errorCode ? `${errorCode}: ${errorMsg}` : errorMsg;
  return createPortal(
    <div className="max-w-full w-[calc(100vw-3rem)] px-6 py-4 h-16 fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex items-center rounded-xl overflow-hidden">
      <div className="w-full h-16 absolute left-0 top-0 bg-zinc-300/70 rounded-xl backdrop-blur-[20px]" />
      <div className="flex items-center h-12 relative z-10">
        <div className="w-12 h-12 relative flex items-center justify-center">
          <img className="w-12 h-12" src={errorCircle} />
          <X className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-800 pointer-events-none" strokeWidth={4} />
        </div>
        <div
          className="max-w-[60vw] ml-4 text-slate-900 text-base font-medium font-['Unbounded'] cursor-pointer overflow-hidden line-clamp-2"
          style={{display: 'block'}}
          title={fullMsg}
        >
          {fullMsg}
        </div>
      </div>
      <div className="w-44 flex justify-end items-center gap-3.5" style={{position: 'absolute', right: '1.5rem', top: '1rem'}}>
      <div className="w-7 h-7 relative cursor-pointer" onClick={() => setVisible(false)}>
          <div className="w-9 h-9 left-[-3px] top-[-3px] absolute bg-sky-400 rounded-lg shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]" />
          <div className="w-1 h-4 left-[19.08px] top-[7px] absolute origin-top-left rotate-45 bg-white" />
          <div className="w-1 h-4 left-[6.99px] top-[10.27px] absolute origin-top-left -rotate-45 bg-white" />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ErrorModal;