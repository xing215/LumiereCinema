import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@styles/datepicker.css';
import { CalendarIcon } from 'lucide-react';

const EditableCell = ({ 
    value, 
    isEditing, 
    onStartEdit, 
    onSave, 
    onCancel, 
    fieldType = 'text',
    className = '',
    disabled = false,
    isUpdating = false,
    tooltipText = null, // Add tooltipText prop for truncated content
    shouldTruncate = false // Add shouldTruncate prop
}) => {
    const [editValue, setEditValue] = useState(value || '');
    const [selectedDate, setSelectedDate] = useState(null);
    const inputRef = useRef(null);
    const datePickerRef = useRef(null);

    // Convert string date to Date object for date picker
    useEffect(() => {
        if (fieldType === 'date' && value) {
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
        } else if (fieldType === 'date') {
            setSelectedDate(null);
        }
    }, [value, fieldType]);

    // Function to auto-resize textarea based on content
    const autoResizeTextarea = (textarea) => {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(textarea.scrollHeight, 40) + 'px';
        }
    };

    // Update editValue when value prop changes - only when not editing
    useEffect(() => {
        if (!isEditing) {
            setEditValue(value || '');
        }
    }, [value, isEditing]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing) {
            if (fieldType === 'date') {
                // For date picker, focus and open calendar after a short delay
                setTimeout(() => {
                    if (datePickerRef.current) {
                        datePickerRef.current.setFocus();
                    }
                }, 100);
            } else if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
                autoResizeTextarea(inputRef.current);
            }
        }
    }, [isEditing, fieldType]);

    const handleDoubleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent row click events
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
                setEditValue(formattedDate);
                if (onSave) {
                    onSave(formattedDate);
                }
            } else {
                setEditValue('');
                if (onSave) {
                    onSave('');
                }
            }
        }, 100);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            // Ctrl+Enter to save
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        } else if (e.key === 'Tab') {
            // Save on Tab
            e.preventDefault();
            handleSave();
        }
        // Allow normal Enter for new lines in textarea
    };

    const handleBlur = (e) => {
        // Only save if we're not switching to another input within the same component
        // This prevents save when clicking escape or ctrl+enter
        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
            handleSave();
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(editValue);
        }
    };

    const handleCancel = () => {
        setEditValue(value || '');
        if (onCancel) {
            onCancel();
        }
    };

    const handleChange = (e) => {
        setEditValue(e.target.value);
        // Auto-resize textarea
        autoResizeTextarea(e.target);
    };

    // Format date for display
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
            }
        } catch (error) {
            return dateStr;
        }
        return dateStr;
    };

    if (isEditing) {
        if (fieldType === 'date') {
            return (
                <div className="relative w-full">
                    <DatePicker
                        ref={datePickerRef}
                        selected={selectedDate}
                        onChange={handleDateChange}
                        onKeyDown={handleKeyDown}
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
                        shouldCloseOnSelect={true}
                        onClickOutside={handleSave}
                        openToDate={selectedDate || new Date()}
                        autoFocus={true}
                        wrapperClassName="datepicker-wrapper"
                    />
                </div>
            );
        } else {
            return (
                <textarea
                    ref={inputRef}
                    value={editValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className={`w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden ${className}`}
                    style={{ 
                        minWidth: '60px',
                        minHeight: '40px',
                        lineHeight: '1.4'
                    }}
                    rows={1}
                />
            );
        }
    }

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`w-full h-full min-h-[2rem] flex items-center cursor-pointer hover:bg-gray-100 rounded px-1 py-1 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isUpdating ? 'bg-yellow-100 opacity-75' : ''} ${className}`}
            title={
                disabled ? '' : 
                isUpdating ? 'Updating...' : 
                tooltipText ? tooltipText : 
                'Double-click to edit (Ctrl+Enter to save, Esc to cancel)'
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
                        {fieldType === 'date' ? formatDisplayDate(value) : (value || '')}
                    </span>
                </span>
            ) : (
                fieldType === 'date' ? (
                    <div className="flex items-center gap-1 w-full">
                        <CalendarIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span 
                            className={shouldTruncate ? 'truncate block flex-1' : 'flex-1'}
                            style={shouldTruncate ? {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            } : {}}
                        >
                            {formatDisplayDate(value) || 'Select date...'}
                        </span>
                    </div>
                ) : (
                    <span 
                        className={shouldTruncate ? 'truncate block w-full' : 'w-full'}
                        style={shouldTruncate ? {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        } : {}}
                    >
                        {value || ''}
                    </span>
                )
            )}
        </div>
    );
};

export default EditableCell;
