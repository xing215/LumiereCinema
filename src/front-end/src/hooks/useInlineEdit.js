import { useState, useCallback } from 'react';

/**
 * Custom hook for managing inline editing functionality
 * Handles edit state, value changes, and API updates
 */
export const useInlineEdit = (updateFunction, refreshFunction) => {
    const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnIndex, originalValue }
    const [editValue, setEditValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Start editing a cell
    const startEdit = useCallback((rowIndex, columnIndex, currentValue) => {
        setEditingCell({ rowIndex, columnIndex, originalValue: currentValue });
        setEditValue(currentValue || '');
    }, []);

    // Cancel editing
    const cancelEdit = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    // Save the edited value
    const saveEdit = useCallback(async (itemId, fieldName, newValue) => {
        if (!editingCell || isUpdating) return;

        // Don't save if value hasn't changed
        if (newValue === editingCell.originalValue) {
            cancelEdit();
            return;
        }

        setIsUpdating(true);
        
        try {
            // Create update object with the specific field
            const updateData = { [fieldName]: newValue };
            
            // Call the update function (e.g., updateMovie)
            const result = await updateFunction(itemId, updateData);
            
            if (result.success) {
                // Refresh the data to reflect changes
                if (refreshFunction) {
                    await refreshFunction();
                }
                cancelEdit();
            } else {
                console.error('Failed to update:', result.error);
                // Could add error handling here (e.g., show toast notification)
            }
        } catch (error) {
            console.error('Error updating field:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [editingCell, updateFunction, refreshFunction, isUpdating, cancelEdit]);

    return {
        editingCell,
        editValue,
        isUpdating,
        startEdit,
        cancelEdit,
        saveEdit,
        setEditValue
    };
};
