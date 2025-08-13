import { Square, SquareCheckBig } from 'lucide-react';

const ActiveButton = ({ isHidden = false, onToggle, disabled = false, activeLabel = 'Active', inactiveLabel = 'Hidden', size = 'h-5 w-5', isUpdating = false, isRowTicked = false }) => {
    // Đơn giản: isHidden = false → checked = true

    const checked = !isHidden;

    const handleClick = () => {
        if (disabled || isUpdating) return;

        // Toggle isHidden: false → true, true → false
        const newIsHidden = !isHidden;

        // Gọi callback để update database
        if (onToggle) {
            onToggle(newIsHidden);
        }
    };

    // Determine display labels
    const currentLabel = checked ? activeLabel : inactiveLabel;
    const nextLabel = checked ? inactiveLabel : activeLabel;

    return (
        <button
            onClick={handleClick}
            className={`${size} ${disabled || isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            disabled={disabled || isUpdating}
            title={isUpdating ? 'Updating...' : disabled ? 'Disabled' : `Current: ${currentLabel} (Click to ${nextLabel})`}
        >
            {isUpdating ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent"></span>
            ) : checked ? (
                <SquareCheckBig className="h-full w-full text-green-600" />
            ) : (
                <Square className={`h-full w-full ${isRowTicked ? 'text-white' : 'text-gray-400'}`} />
            )}
        </button>
    );
};

export default ActiveButton;
