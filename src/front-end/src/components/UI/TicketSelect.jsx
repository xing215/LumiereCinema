
import { useState, useEffect } from 'react';


const TicketSelect = ({ ticket_type, onChange , price, amount = 0, hover_message = '', max = 10 }) => {
    const [hovered, setHovered] = useState(false);
    const handleDecrease = () => {
        onChange(prev => {
            const newAmount = prev > 0 ? prev - 1 : 0;
            return newAmount;
        });
    };
    const handleIncrease = () => {
        onChange(prev => {
            if (prev >= max) {
                alert(`You cannot select more than ${max} tickets.`);
                return prev;
            }
            const newAmount = prev + 1;
            return newAmount;
        });
    };

    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(amount);

    useEffect(() => {
        setInputValue(amount);
    }, [amount]);

    const handleAmountClick = () => {
        setEditing(true);
    };
    const handleInputChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setInputValue(val);
    };
    const handleInputBlur = () => {
        let val = parseInt(inputValue, 10);
        if (isNaN(val)) val = 0;
        let clamped = val;
        if (val > max) {
            clamped = max;
        }
        if (val < 0) clamped = 0;
        onChange(() => clamped);
        setInputValue(clamped);
        setEditing(false);
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-between gap-1 rounded-xl"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => setHovered(true)}>
            {/* Tooltip */}
            <div
                className={`
                    absolute -bottom-8 left-1/2 z-50 w-max -translate-x-1/2 rounded
                    bg-indigo-100 backdrop-blur-[10px] font-['Libre_Franklin'] px-3 py-1
                    text-xs text-black shadow-lg
                    transition-all duration-200
                    ${hovered && hover_message !== '' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                `}
            >
                {hover_message}
            </div>
            <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
            <div className="relative w-2/3 justify-start px-3 pt-3 text-center font-['Unbounded'] text-base font-semibold whitespace-normal text-white">{ticket_type}</div>
            <div className="relative flex h-full w-full flex-row items-center justify-center gap-8 px-3">
                <button
                    className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 cursor-pointer"
                    onClick={handleDecrease}
                    aria-label="Decrease"
                >–</button>
                {editing ? (
                    <input
                        type="text"
                        className="relative w-12 text-center font-['Unbounded'] text-xl font-black text-zinc-300 bg-zinc-800/70 rounded focus:outline-none"
                        value={inputValue}
                        autoFocus
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                    />
                ) : (
                    <div
                        className="relative cursor-text justify-start text-center font-['Unbounded'] text-xl font-black text-zinc-300"
                        onClick={handleAmountClick}
                        tabIndex={0}
                        role="button"
                        aria-label="Edit amount"
                    >
                        {amount.toString().padStart(2, '0')}
                    </div>
                )}
                <button
                    className="relative justify-start text-center font-['Unbounded'] text-3xl font-black text-zinc-300 cursor-pointer"
                    onClick={handleIncrease}
                    aria-label="Increase"
                >+</button>
            </div>
            <div className="relative justify-start pb-1 text-center font-['Unbounded'] text-[10px] font-semibold text-white">{price} VND</div>
        </div>
    );
};

export default TicketSelect;
