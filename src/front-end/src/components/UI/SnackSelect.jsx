

import React, { useState } from 'react';


const SnackSelect = ({ snack_type, img, onAdd, onRemove, price, description, quantity }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className="relative flex h-auto w-[calc((90vw/2)-20px)] flex-col items-center justify-between rounded-xl md:w-[calc((90vw/4)-20px)] lg:w-[calc((70vw/4)-20px)]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Tooltip */}
            {snack_type && (
    <div
        className={`
            absolute -top-8 left-1/2 z-50 w-max -translate-x-1/2 rounded
            bg-indigo-100 backdrop-blur-[10px] font-['Libre_Franklin'] px-3 py-1
            text-xs text-black shadow-lg text-center
            transition-all duration-200
            ${hovered ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
    >
        {snack_type}{description ? <><br />{description}</> : ''} 
    </div>
)}
            <img src={img} alt="Snack Combo" className="absolute z-1 h-1/2 rounded-t-xl object-cover pt-1" />
            <div className=''></div>
            <div className="relative z-2 w-full justify-start px-3 pt-20 text-center font-['Unbounded'] text-[10px] line-clamp-1 font-semibold whitespace-normal text-white xl:text-[12px]">{snack_type}</div>
            <div className="relative flex h-full w-full flex-row items-center justify-center gap-8 px-3">
                <button
                    className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 xl:text-4xl cursor-pointer"
                    onClick={onRemove}
                    style={{ cursor: 'pointer' }}
                >–</button>
                <div className="relative justify-start text-center font-['Unbounded'] text-xl font-black text-zinc-300 xl:text-2xl">{quantity?.toString().padStart(2, '0')}</div>
                <button
                    className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 xl:text-4xl cursor-pointer"
                    onClick={onAdd}
                    style={{ cursor: 'pointer' }}
                >+</button>
            </div>
            <div className="relative justify-start pb-1 text-center font-['Unbounded'] text-[10px] font-semibold text-white xl:text-[12px]">{price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")},đ</div>
            <div className="absolute pointer-events-none top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        </div>
    );
};

export default SnackSelect;
