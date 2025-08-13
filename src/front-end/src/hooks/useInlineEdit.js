import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';

/**
 * Custom hook for managing inline editing functionality
 * Handles edit state, value changes, and API updates
 */
export const useInlineEdit = (updateFunction, refreshFunction, items, setItems) => {
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
    const saveEdit = useCallback(
        async (itemId, fieldName, newValue) => {
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

                console.log('Updating item:', { itemId, fieldName, newValue, updateData });

                // Call the update function (e.g., updateMovie)
                const result = await updateFunction(itemId, updateData);

                console.log('Update result:', result);

                if (result.success) {
                    // Update local state instead of refreshing
                    if (items && setItems) {
                        setItems((prevItems) => {
                            return prevItems.map((item) => {
                                const currentItemId = item.id || item._id;
                                if (currentItemId === itemId) {
                                    return { ...item, [fieldName]: newValue };
                                }
                                return item;
                            });
                        });
                    } else if (refreshFunction) {
                        // Fallback to refresh if items/setItems not provided
                        console.log('Refreshing data...');
                        await refreshFunction();
                    }
                    cancelEdit();
                } else {
                    console.error('Failed to update:', result.error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: `Failed to update: ${result.error || 'Unknown error'}`,
                        confirmButtonColor: '#EF4444',
                    });
                    // Reset value on failure
                    cancelEdit();
                }
            } catch (error) {
                console.error('Error updating field:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Update Error',
                    text: `Error updating field: ${error.message || 'Unknown error'}`,
                    confirmButtonColor: '#EF4444',
                });
                // Reset value on error
                cancelEdit();
            } finally {
                setIsUpdating(false);
            }
        },
        [editingCell, updateFunction, refreshFunction, items, setItems, isUpdating, cancelEdit],
    );

    return {
        editingCell,
        editValue,
        isUpdating,
        startEdit,
        cancelEdit,
        saveEdit,
        setEditValue,
    };
};

/**
 * Custom hook for managing status/field updates with optimistic UI
 * Handles single field updates like isHidden, isActive, status, etc.
 */
export const useStatusUpdate = (updateFunction) => {
    const [updatingRows, setUpdatingRows] = useState(new Set());

    const updateStatus = useCallback(
        async (items, setItems, rowIndex, fieldName, newValue) => {
            const item = items[rowIndex];
            if (!item) return { success: false, error: 'Item not found' };

            const itemId = item.id || item._id;

            // Update local state optimistically (immediate UI update)
            setItems((prevItems) => {
                const updatedItems = [...prevItems];
                updatedItems[rowIndex] = { ...item, [fieldName]: newValue };
                return updatedItems;
            });

            // Add this row to updating set
            setUpdatingRows((prev) => new Set([...prev, rowIndex]));

            try {
                // Use provided update function to update database
                const result = await updateFunction(itemId, { [fieldName]: newValue });

                if (result.success) {
                    // Optimistic update is already applied, no need to do anything
                    return { success: true };
                } else {
                    // Revert optimistic update on failure
                    setItems((prevItems) => {
                        const revertedItems = [...prevItems];
                        revertedItems[rowIndex] = { ...item, [fieldName]: !newValue };
                        return revertedItems;
                    });
                    return { success: false, error: result.error || 'Unknown error' };
                }
            } catch (error) {
                // Revert optimistic update on error
                setItems((prevItems) => {
                    const revertedItems = [...prevItems];
                    revertedItems[rowIndex] = { ...item, [fieldName]: !newValue };
                    return revertedItems;
                });
                return { success: false, error: error.message || 'Unknown error' };
            } finally {
                // Remove this row from updating set
                setUpdatingRows((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(rowIndex);
                    return newSet;
                });
            }
        },
        [updateFunction],
    );

    return { updateStatus, updatingRows };
};
