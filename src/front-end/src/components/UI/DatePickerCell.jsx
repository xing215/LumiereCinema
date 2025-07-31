import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@styles/datepicker.css';
import { CalendarIcon } from 'lucide-react';

const DatePickerCell = ({ 
    value, 
    isEditing, 
    onStartEdit, 
    onSave, 
    onCancel, 
    className = '',
    disabled = false,
    isUpdating = false,
    tooltipText = null,
    shouldTruncate = false
}) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);

    // Convert string date to Date object
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    setSelectedDate(date);
                } else {
                    setSelectedDate(null);
                }
            } catch (error) {
                setSelectedDate(null);
            }
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    // Focus date picker when editing starts
    useEffect(() => {
        if (isEditing && datePickerRef.current) {
            // Small delay to ensure the component is rendered
            setTimeout(() => {
                if (datePickerRef.current) {
                    datePickerRef.current.setFocus();
                }
            }, 100);
        }
    }, [isEditing]);

    const handleDoubleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && onStartEdit) {
            onStartEdit();
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        // Auto save when date is selected
        setTimeout(() => {
            if (date) {
                // Convert to YYYY-MM-DD format
                const formattedDate = date.toISOString().split('T')[0];
                if (onSave) {
                    onSave(formattedDate);
                }
            } else {
                if (onSave) {
                    onSave('');
                }
            }
        }, 100); // Small delay to ensure state is updated
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleSave();
        }
    };

    const handleSave = () => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            if (onSave) {
                onSave(formattedDate);
            }
        } else {
            if (onSave) {
                onSave('');
            }
        }
    };

    const handleBlur = () => {
        // Auto save when clicking outside
        handleSave();
    };

    const handleCancel = () => {
        // Reset to original value
        if (value) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    setSelectedDate(date);
                } else {
                    setSelectedDate(null);
                }
            } catch (error) {
                setSelectedDate(null);
            }
        } else {
            setSelectedDate(null);
        }
        if (onCancel) {
            onCancel();
        }
    };

    // Format date for display
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            // Handle different date formats
            let date;
            if (dateStr.includes('T')) {
                // ISO format
                date = new Date(dateStr);
            } else if (dateStr.includes('/')) {
                // DD/MM/YYYY format
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    date = new Date(dateStr);
                }
            } else {
                // YYYY-MM-DD format
                date = new Date(dateStr);
            }
            
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            }
        } catch (error) {
            console.error('Date parsing error:', error);
            return dateStr;
        }
        return dateStr;
    };

    if (isEditing) {
        return (
            <div className="relative w-full">
                <DatePicker
                    ref={datePickerRef}
                    selected={selectedDate}
                    onChange={handleDateChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    dateFormat="dd/MM/yyyy"
                    className={`w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                    calendarClassName="react-datepicker-custom"
                    showPopperArrow={false}
                    autoComplete="off"
                    placeholderText="Select date..."
                    isClearable
                    todayButton="Today"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()} // Prevent future dates for movie releases
                    minDate={new Date('1900-01-01')} // Reasonable minimum date
                    autoFocus
                    shouldCloseOnSelect={true}
                    onClickOutside={handleBlur}
                />
            </div>
        );
    }

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`w-full h-full min-h-[2rem] flex items-center cursor-pointer hover:bg-blue-50 rounded px-1 py-1 transition-colors border-2 border-blue-400 bg-blue-50 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isUpdating ? 'bg-yellow-100 opacity-75' : ''} ${className}`}
            title={
                disabled ? '' : 
                isUpdating ? 'Updating...' : 
                tooltipText ? tooltipText : 
                'Double-click to select date (DATE PICKER ACTIVE)'
            }
        >
            {isUpdating ? (
                <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                    <span 
                        className={shouldTruncate ? 'truncate block w-full' : 'w-full'}
                        style={shouldTruncate ? {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        } : {}}
                    >
                        {formatDisplayDate(value)}
                    </span>
                </span>
            ) : (
                <div className="flex items-center gap-1 w-full">
                    <CalendarIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span 
                        className={`text-blue-700 font-semibold ${shouldTruncate ? 'truncate block flex-1' : 'flex-1'}`}
                        style={shouldTruncate ? {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        } : {}}
                    >
                        [DATE] {formatDisplayDate(value) || 'Select date...'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default DatePickerCell;
