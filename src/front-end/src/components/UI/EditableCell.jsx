import React, { useState, useEffect, useRef } from 'react';

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
    const inputRef = useRef(null);

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
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
            autoResizeTextarea(inputRef.current);
        }
    }, [isEditing]); // Remove editValue dependency

    const handleDoubleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent row click events
        if (!disabled && onStartEdit) {
            onStartEdit();
        }
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

    if (isEditing) {
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
                        {value || ''}
                    </span>
                </span>
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
            )}
        </div>
    );
};

export default EditableCell;
