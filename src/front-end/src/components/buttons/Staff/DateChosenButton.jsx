import { useState, useRef, useEffect } from 'react';

const DateChosenButton = ({ selectedDate, onDateChange }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateChange = (event) => {
        const newDate = new Date(event.target.value);
        onDateChange(newDate);
        setShowDatePicker(false);
    };

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const decreaseDate = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(newDate);
    };

    const increaseDate = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate);
    };

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    return (
        <div ref={datePickerRef} className="relative z-20 flex items-center gap-1">
            {/* Decrease Date Button */}
            <button 
                className="font-unbounded h-9 w-9 rounded-xl bg-white text-lg text-slate-950 hover:cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={decreaseDate}
                title="Previous day"
            >
                &lt;
            </button>
            
            {/* Date Display Button */}
            <button 
                className="font-unbounded h-9 rounded-xl bg-white px-5 text-lg text-slate-950 hover:cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowDatePicker(!showDatePicker)}
            >
                {formatDate(selectedDate)}
            </button>
            
            {/* Increase Date Button */}
            <button 
                className="font-unbounded h-9 w-9 rounded-xl bg-white text-lg text-slate-950 hover:cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={increaseDate}
                title="Next day"
            >
                &gt;
            </button>
            
            {/* Date Picker Dropdown */}
            {showDatePicker && (
                <div className="absolute z-100 top-full mt-2 right-12 bg-white rounded-lg shadow-lg border p-2">
                    <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={handleDateChange}
                        className="border rounded px-2 py-1 text-sm"
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
};

export default DateChosenButton;