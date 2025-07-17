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
    isUpdating = false
}) => {
    const [editValue, setEditValue] = useState(value || '');
    const inputRef = useRef(null);

    // Update editValue when value prop changes
    useEffect(() => {
        setEditValue(value || '');
    }, [value]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent row click events
        if (!disabled && onStartEdit) {
            onStartEdit();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const handleBlur = () => {
        handleSave();
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
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={fieldType}
                value={editValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className={`w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                style={{ minWidth: '60px' }}
            />
        );
    }

    return (
        <div
            onDoubleClick={handleDoubleClick}
            className={`w-full h-full min-h-[2rem] flex items-center cursor-pointer hover:bg-gray-100 rounded px-1 py-1 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isUpdating ? 'bg-yellow-100 opacity-75' : ''} ${className}`}
            title={disabled ? '' : isUpdating ? 'Updating...' : 'Double-click to edit'}
        >
            {isUpdating ? (
                <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                    {value || ''}
                </span>
            ) : (
                <span className="w-full">{value || ''}</span>
            )}
        </div>
    );
};

export default EditableCell;
