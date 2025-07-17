import { useState, useEffect } from 'react';
import { Square, SquareCheckBig } from 'lucide-react';

const ActiveButton = ({ status = 'Upcoming', onStatusChange, disabled = false }) => {
    // Map status to checked state
    const getCheckedState = (status) => {
        return status === 'Now Showing';
    };

    const [checked, setChecked] = useState(getCheckedState(status));

    // Update checked state when status prop changes
    useEffect(() => {
        setChecked(getCheckedState(status));
    }, [status]);

    const handleClick = () => {
        if (disabled) return;
        
        const newChecked = !checked;
        setChecked(newChecked);
        
        // Determine new status based on checked state
        // Unchecked (Inactive) = Upcoming, Checked (Active) = Now Showing
        const newStatus = newChecked ? 'Now Showing' : 'Upcoming';
        
        // Call parent callback if provided
        if (onStatusChange) {
            onStatusChange(newStatus);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            className={`h-5 w-5 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            disabled={disabled}
            title={`Status: ${status} (Click to toggle)`}
        >
            {checked ? <SquareCheckBig className="h-full w-full" /> : <Square className="h-full w-full" />}
        </button>
    );
};

export default ActiveButton;
