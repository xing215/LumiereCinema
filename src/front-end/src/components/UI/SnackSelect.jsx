
import React, { useState } from 'react';
import Combo1 from '../../assets/img/combo1.png';

const SnackSelect = ({ snack_type }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className="relative flex h-auto w-[calc((90vw/2)-20px)] flex-col items-center justify-between rounded-xl md:w-[calc((90vw/4)-20px)] lg:w-[calc((70vw/4)-20px)]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Tooltip */}
            {hovered && snack_type && (
                <div className="absolute -top-8 left-1/2 z-50 w-max -translate-x-1/2 rounded bg-indigo-100 backdrop-blur-[10px] font-libre-franklin px-3 py-1 text-xs text-black shadow-lg">
                    {snack_type}
                </div>
            )}
            <img src={Combo1} alt="Snack Combo" className="absolute z-1 h-1/2 rounded-t-xl object-cover pt-1" />
            <div className=''></div>
            <div className="relative z-2 w-full justify-start px-3 pt-20 text-center font-['Unbounded'] text-[10px] line-clamp-1 font-semibold whitespace-normal text-white xl:text-[12px]">{snack_type}</div>
            <div className="relative flex h-full w-full flex-row items-center justify-center gap-8 px-3">
                <button className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 xl:text-4xl">–</button>
                <div className="relative justify-start text-center font-['Unbounded'] text-xl font-black text-zinc-300 xl:text-2xl">01</div>
                <button className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 xl:text-4xl">+</button>
            </div>
            <div className="relative justify-start pb-1 text-center font-['Unbounded'] text-[10px] font-semibold text-white xl:text-[12px]">80,000đ</div>
            <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        </div>
    );
};

export default SnackSelect;
