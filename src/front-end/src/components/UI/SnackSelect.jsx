import { useState, useEffect } from 'react';

const SnackSelect = ({ snack_type, img, onChange, price, description, quantity, stock = 0 }) => {
    const [hovered, setHovered] = useState(false);
    const [inputValue, setInputValue] = useState(quantity);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setInputValue(quantity);
    }, [quantity]);

    const handleDecrease = () => {
        onChange((prev) => {
            const newAmount = prev > 0 ? prev - 1 : 0;
            return newAmount;
        });
    };

    const handleIncrease = () => {
        onChange((prev) => {
            if (prev >= stock) {
                alert(`You cannot select more than ${stock} snacks.`);
                return prev;
            }
            const newAmount = prev + 1;
            return newAmount;
        });
    };

    const handleAmountClick = () => setEditing(true);
    const handleInputChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setInputValue(val);
    };
    const handleInputBlur = () => {
        let val = parseInt(inputValue, 10);
        if (isNaN(val)) val = 0;
        let clamped = val;
        if (val > stock) clamped = stock;
        if (val < 0) clamped = 0;
        onChange(() => clamped);
        setInputValue(clamped);
        setEditing(false);
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') handleInputBlur();
    };

    return (
        <div
            className="relative flex h-auto w-[calc((90vw/2)-20px)] flex-col items-center justify-between rounded-xl md:w-[calc((90vw/4)-20px)] lg:w-[calc((70vw/4)-20px)]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => setHovered(true)}
        >
            {/* Tooltip */}
            {snack_type && (
                <div
                    className={`absolute -top-8 left-1/2 z-50 w-max -translate-x-1/2 rounded bg-indigo-100 px-3 py-1 text-center font-['Libre_Franklin'] text-xs text-black shadow-lg backdrop-blur-[10px] transition-all duration-200 ${hovered ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'} `}
                >
                    {snack_type}
                    {description ? (
                        <>
                            <br />
                            {description}
                        </>
                    ) : (
                        ''
                    )}
                </div>
            )}
            {img && <img src={img} alt="Snack Combo" className="absolute z-1 h-1/2 rounded-t-xl object-cover pt-1" />}
            <div className=""></div>
            <div
                className={`relative z-2 w-full justify-start px-3 pt-20 text-center font-['Unbounded'] text-[10px] ${img ? 'line-clamp-1' : 'line-clamp-3'} font-semibold whitespace-normal text-white xl:text-[12px]`}
            >
                {snack_type}
            </div>
            <div className="relative flex h-full w-full flex-row items-center justify-center gap-8 px-3">
                <button className="relative cursor-pointer justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 xl:text-4xl" onClick={handleDecrease} aria-label="Decrease">
                    –
                </button>
                {editing ? (
                    <input
                        type="text"
                        className="relative w-12 rounded bg-zinc-800/70 text-center font-['Unbounded'] text-xl font-black text-zinc-300 focus:outline-none xl:text-2xl"
                        value={inputValue}
                        autoFocus
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                    />
                ) : (
                    <div
                        className="relative cursor-pointer justify-start text-center font-['Unbounded'] text-xl font-black text-zinc-300 xl:text-2xl"
                        onClick={handleAmountClick}
                        tabIndex={0}
                        role="button"
                        aria-label="Edit quantity"
                    >
                        {quantity?.toString().padStart(2, '0')}
                    </div>
                )}
                <button className="relative cursor-pointer justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 xl:text-4xl" onClick={handleIncrease} aria-label="Increase">
                    +
                </button>
            </div>
            <div className="relative justify-start pb-1 text-center font-['Unbounded'] text-[10px] font-semibold text-white xl:text-[12px]">
                {price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
            </div>
            <div className="pointer-events-none absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        </div>
    );
};

export default SnackSelect;
