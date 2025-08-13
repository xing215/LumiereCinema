import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@contexts/UserContext';
import { useGetBranchById, useGetSnacks, useSetCurrentBranch, useUpdateSnack, useRemoveSnack } from '@hooks/useBranch';
import { useInlineEdit } from '@hooks/useInlineEdit';
import Swal from 'sweetalert2';
import {
    showLoading,
    showSuccess,
    showError,
    showAddingItems,
    showItemsAdded,
    showDeleteItemsConfirmation,
    showDeletingItems,
    showItemsDeleted,
    showProcessingItemStatus,
    showItemStatusChanged,
    showOperationError,
    closeSwal,
} from '@utils/sweetalert';

/**
 * Comprehensive hook for managing snack operations in the staff panel
 * Handles CRUD operations, validation, and UI state management
 */
export const useSnackManagement = () => {
    // User and branch context
    const { user } = useUser();
    // const { currentBranch, setCurrentBranch } = useSetCurrentBranch();
    console.log('🔄 useSnackManagement initialized', user);
    const { getBranchById, branch: userBranch, loading: branchLoading } = useGetBranchById();

    // Snacks data from database
    const { getSnacks, snacks, setSnacks, loading: snacksLoading, error: snacksError } = useGetSnacks();
    const { updateSnack, loading: updateLoading } = useUpdateSnack();
    const { removeSnack, loading: deleteLoading } = useRemoveSnack();

    // Branch and snacks initialization state
    const [branchInitialized, setBranchInitialized] = useState(false);
    const [snacksFetched, setSnacksFetched] = useState(false);

    // UI state
    const [tickedSnacks, setTickedSnacks] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        console.log('🔄 useSnackManagement initialized');
        // Initialize branch if user is branch manager
        // This will only run once when the hook is first used
        console.log(snacks);
    }, [snacks]);

    // Add snack state
    const [isAddingSnack, setIsAddingSnack] = useState(false);
    const [newSnackData, setNewSnackData] = useState({
        shortname: '',
        name: '',
        price: '',
        discountedPrice: '',
        description: '',
        imageURL: '',
        stock: '',
        isAvailable: true,
    });

    // Refresh snacks data
    const refreshSnacks = useCallback(async () => {
        const branchId = user?.branch?._id;
        if (branchId) {
            setSnacksFetched(false);
            await getSnacks(branchId);
            setSnacksFetched(true);
        }
    }, [user, getSnacks]);

    // Inline editing hook - create wrapper function for updateSnack
    const updateSnackWrapper = useCallback(
        async (snackId, updateData) => {
            const branchId = user?.branch?._id;
            if (!branchId) {
                throw new Error('No branch selected');
            }
            return await updateSnack(branchId, snackId, updateData);
        },
        [updateSnack, user?.branch?._id],
    );

    const { editingCell, startEdit, saveEdit, cancelEdit, isUpdating } = useInlineEdit(updateSnackWrapper, refreshSnacks, snacks, setSnacks);

    // Column configuration
    const editableColumns = [1, 2, 3, 4, 5, 6, 7]; // Shortname, Name, Price, DPrice, Description, Image, Stock
    const columnFieldMapping = {
        1: 'shortname', // Shortname column
        2: 'name', // Name column
        3: 'price', // Price column
        4: 'discountedPrice', // DPrice column
        5: 'description', // Description column
        6: 'imageURL', // Image column
        7: 'stock', // Stock column
    };

    const header = ['TickButton', 'ID', 'Name', 'Price', 'DPrice', 'Description', 'Image', 'Stock', 'ActiveButton'];

    const snackColumnConfig = [
        { width: 'w-15', truncate: false }, // TickButton
        { width: 'w-20', truncate: true }, // ID (shortname)
        { width: 'w-40', truncate: true }, // Name
        { width: 'w-40', truncate: false }, // Price (text input, not date picker)
        { width: 'w-40', truncate: false }, // DPrice (text input, not date picker)
        { width: 'w-60', truncate: true }, // Description
        { width: 'w-50', truncate: true }, // Image
        { width: 'w-15', truncate: false }, // Stock
        { width: 'w-15', truncate: false }, // ActiveButton
    ];

    // Field types configuration for EditableCell
    const fieldTypes = {
        0: 'text', // TickButton (not editable)
        1: 'text', // ID (shortname) - text
        2: 'text', // Name - text
        3: 'number', // Price - number input (NOT date)
        4: 'number', // DPrice - number input (NOT date)
        5: 'text', // Description - text
        6: 'text', // Image - text
        7: 'number', // Stock - number input
        8: 'text', // ActiveButton (not editable)
    };

    // SweetAlert functions (using generic utilities)
    const showProcessing = (message) => {
        return showLoading('Processing...', message);
    };

    const showConfirmation = (title, text) => {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: text,
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete!',
            cancelButtonText: 'Cancel',
        });
    };

    const closeSwalLocal = () => {
        closeSwal();
    };

    // Validation functions
    const validateSnack = useCallback((snackData, existingSnacks = []) => {
        const errors = [];

        // Required fields validation
        if (!snackData.shortname?.trim()) {
            errors.push('Shortname is required');
        } else {
            // Check for duplicate shortname in existing database
            const duplicateSnack = existingSnacks.find((snack) => snack.shortname?.toLowerCase().trim() === snackData.shortname.toLowerCase().trim());

            if (duplicateSnack) {
                errors.push(`Snack with shortname "${snackData.shortname}" already exists`);
            }
        }

        if (!snackData.name?.trim()) {
            errors.push('Snack name is required');
        }

        // Price validation
        if (!snackData.price || parseInt(snackData.price) <= 0) {
            errors.push('Valid price is required');
        }

        // Discounted price validation
        if (snackData.discountedPrice && parseInt(snackData.discountedPrice) > parseInt(snackData.price)) {
            errors.push('Discounted price cannot be higher than regular price');
        }

        // Stock validation
        if (snackData.stock && parseInt(snackData.stock) < 0) {
            errors.push('Stock cannot be negative');
        }

        return errors;
    }, []);

    // Initialize user branch
    useEffect(() => {
        if (user && user.roles?.includes('branchmanager') && user.branch?._id && !branchInitialized) {
            getBranchById(user.branch._id);
            setBranchInitialized(true);
        }
    }, [user, getBranchById, branchInitialized]);

    // Set current branch when user branch is available
    // useEffect(() => {
    //     if (user?.branch?._id?._id && !currentBranch) {
    //         setCurrentBranch(user.branch._id);
    //     }
    // }, [user, currentBranch, setCurrentBranch]);

    // Fetch snacks when branch is available (only once)
    useEffect(() => {
        const branchId = user?.branch?._id;
        if (branchId && !snacksFetched) {
            console.log('Fetching snacks for branch:', branchId);
            getSnacks(branchId);
            setSnacksFetched(true);
        }
    }, [user?.branch?._id, snacksFetched]);

    // Search functionality
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const filterSnacks = useCallback(
        (snacksList) => {
            if (!searchTerm.trim()) {
                return snacksList;
            }

            const searchLower = searchTerm.toLowerCase();
            return snacksList.filter(
                (snack) => snack.name?.toLowerCase().includes(searchLower) || snack.shortname?.toLowerCase().includes(searchLower) || snack.description?.toLowerCase().includes(searchLower),
            );
        },
        [searchTerm],
    );

    // Inline editing handlers
    const handleStartEdit = useCallback(
        (rowIndex, columnIndex, currentValue) => {
            if (editableColumns.includes(columnIndex) && !isUpdating) {
                let editValue = currentValue;

                // For price fields (columns 3 and 4), get the raw numeric value instead of formatted display value
                if ((columnIndex === 3 || columnIndex === 4) && !isAddingSnack) {
                    const filteredSnacks = filterSnacks(snacks || []);
                    const snack = filteredSnacks[rowIndex];
                    if (snack) {
                        if (columnIndex === 3) {
                            // Price column - get raw price value
                            editValue = snack.price ? snack.price.toString() : '';
                        } else if (columnIndex === 4) {
                            // DPrice column - get raw discountedPrice value
                            editValue = snack.discountedPrice ? snack.discountedPrice.toString() : '';
                        }
                    }
                }

                // Allow editing for new snack row (row 0) when adding
                if (isAddingSnack && rowIndex === 0) {
                    startEdit(rowIndex, columnIndex, editValue);
                    return;
                }

                // Allow editing for existing snacks (double-click to edit)
                if (!isAddingSnack) {
                    startEdit(rowIndex, columnIndex, editValue);
                    return;
                }
            }
        },
        [editableColumns, isUpdating, isAddingSnack, startEdit, filterSnacks, snacks],
    );

    const handleNewSnackFieldChange = useCallback(
        (columnIndex, value) => {
            const fieldName = columnFieldMapping[columnIndex];
            if (fieldName) {
                setNewSnackData((prev) => ({
                    ...prev,
                    [fieldName]: value,
                }));
            }
        },
        [columnFieldMapping],
    );

    const handleSaveEdit = useCallback(
        async (rowIndex, columnIndex, newValue) => {
            // Handle new snack field changes when adding
            if (isAddingSnack && rowIndex === 0) {
                handleNewSnackFieldChange(columnIndex, newValue);
                cancelEdit();
                return;
            }

            // Handle existing snack editing
            if (!isAddingSnack) {
                const filteredSnacks = filterSnacks(snacks || []);
                const snack = filteredSnacks[rowIndex];
                const fieldName = columnFieldMapping[columnIndex];

                if (snack && fieldName) {
                    const snackId = snack._id || snack.id;

                    let processedValue = newValue;

                    // Process value based on field type
                    if (fieldName === 'price' || fieldName === 'discountedPrice') {
                        // Strip dollar sign and any whitespace from price inputs
                        const cleanedValue = newValue ? newValue.toString().replace(/[$\s]/g, '') : '';

                        if (fieldName === 'discountedPrice') {
                            // Handle discounted price specially - allow empty/null values
                            if (!cleanedValue || cleanedValue.trim() === '' || cleanedValue === '0') {
                                // User wants to remove discounted price (empty, or set to 0)
                                processedValue = null;
                            } else {
                                processedValue = parseInt(cleanedValue);
                                if (isNaN(processedValue) || processedValue < 0) {
                                    showError('Invalid Price', 'Discounted price must be a valid positive number');
                                    cancelEdit();
                                    return;
                                }
                                // Validate discounted price against regular price
                                if (processedValue > snack.price) {
                                    showError('Invalid Price', 'Discounted price cannot be higher than regular price');
                                    cancelEdit();
                                    return;
                                }
                            }
                        } else {
                            // Regular price processing
                            processedValue = parseInt(cleanedValue) || 0;
                            if (processedValue <= 0) {
                                showError('Invalid Price', 'Price must be a positive number');
                                cancelEdit();
                                return;
                            }
                        }
                    } else if (fieldName === 'stock') {
                        processedValue = parseInt(newValue) || 0;
                        if (processedValue < 0) {
                            showError('Invalid Stock', 'Stock cannot be negative');
                            cancelEdit();
                            return;
                        }
                    } else if (fieldName === 'shortname') {
                        processedValue = newValue.trim().toUpperCase();
                        if (!processedValue) {
                            showError('Required Field', 'Shortname is required');
                            cancelEdit();
                            return;
                        }
                    } else {
                        processedValue = newValue.trim();
                        if (fieldName === 'name' && !processedValue) {
                            showError('Required Field', 'Name is required');
                            cancelEdit();
                            return;
                        }
                    }
                    // Use the saveEdit from useInlineEdit hook
                    try {
                        await saveEdit(snackId, fieldName, processedValue);
                        // Note: saveEdit handles optimistic UI updates automatically
                    } catch (error) {
                        console.error('Failed to save edit:', error);
                        showError('Failed to save changes');
                    }
                }
            }
        },
        [isAddingSnack, handleNewSnackFieldChange, cancelEdit, filterSnacks, snacks, columnFieldMapping, saveEdit],
    );

    const handleCancelEdit = useCallback(() => {
        cancelEdit();
    }, [cancelEdit]);

    // Add snack handlers
    const handleStartAddSnack = useCallback(() => {
        cancelEdit();
        setIsAddingSnack(true);
        setNewSnackData({
            shortname: '',
            name: '',
            price: '',
            discountedPrice: '',
            description: '',
            imageURL: '',
            stock: '',
            isAvailable: true,
        });
    }, [cancelEdit]);

    const handleCancelAddSnack = useCallback(() => {
        cancelEdit();
        setIsAddingSnack(false);
        setNewSnackData({
            shortname: '',
            name: '',
            price: '',
            discountedPrice: '',
            description: '',
            imageURL: '',
            stock: '',
            isAvailable: true,
        });
    }, [cancelEdit]);

    const handleConfirmAddSnack = useCallback(async () => {
        const branchId = user?.branch?._id;
        if (!branchId) {
            showError('No branch selected. Please make sure you are assigned to a branch.');
            return;
        }

        // Validate snack data
        const validationErrors = validateSnack(newSnackData, snacks || []);
        if (validationErrors.length > 0) {
            showError(validationErrors[0]);
            return;
        }

        try {
            showProcessing('Adding snack...');

            const snackToAdd = {
                shortname: newSnackData.shortname.trim().toUpperCase(),
                name: newSnackData.name.trim(),
                price: parseInt(newSnackData.price),
                description: newSnackData.description.trim(),
                imageURL: newSnackData.imageURL.trim(),
                stock: parseInt(newSnackData.stock) || 0,
                isHidden: !newSnackData.isAvailable,
            };

            // Add discounted price if provided
            if (newSnackData.discountedPrice && parseInt(newSnackData.discountedPrice) > 0) {
                snackToAdd.discountedPrice = parseInt(newSnackData.discountedPrice);
            }

            const result = await updateSnack(branchId, null, snackToAdd); // null for new snack

            if (result.success) {
                // Always refresh data for add operation to avoid timing issues
                handleCancelAddSnack();
                await refreshSnacks();
                showSuccess('Snack Added Successfully!', 'The snack has been added to the database successfully');
            } else {
                closeSwal();
                showError('Add Snack Failed', result.error || 'Failed to add snack');
            }
        } catch (error) {
            console.error('Failed to add snack:', error);
            closeSwal();
            showError('Add Snack Failed', 'Failed to add snack: ' + (error.message || 'Unknown error'));
        }
    }, [user?.branch?._id, validateSnack, newSnackData, snacks, updateSnack, refreshSnacks, handleCancelAddSnack]);

    // Delete operations
    const handleDeleteConfirm = useCallback(async () => {
        const branchId = user?.branch?._id;
        if (!branchId) {
            showError('No branch selected');
            return;
        }

        const snacksToDelete = Array.from(tickedSnacks);
        if (snacksToDelete.length === 0) {
            showError('No snacks selected for deletion');
            return;
        }

        try {
            showDeletingItems('snacks', snacksToDelete.length);

            let successCount = 0;
            let errorCount = 0;

            for (const snackIndex of snacksToDelete) {
                const filteredSnacks = filterSnacks(snacks || []);
                const snack = filteredSnacks[snackIndex];
                if (snack) {
                    const snackId = snack._id || snack.id;
                    const result = await removeSnack(branchId, snackId);
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error('Failed to delete snack:', snackId, result.error);
                    }
                }
            }

            if (successCount > 0) {
                // Update local state by removing deleted snacks instead of refreshing
                if (snacks && setSnacks) {
                    const deletedSnackIds = [];
                    snacksToDelete.forEach((snackIndex) => {
                        const filteredSnacks = filterSnacks(snacks);
                        const snack = filteredSnacks[snackIndex];
                        if (snack) {
                            deletedSnackIds.push(snack._id || snack.id);
                        }
                    });

                    setSnacks((prevSnacks) => prevSnacks.filter((snack) => !deletedSnackIds.includes(snack._id || snack.id)));
                } else {
                    // Fallback to refresh
                    await refreshSnacks();
                }
                setTickedSnacks(new Set());

                if (errorCount === 0) {
                    showItemsDeleted('snacks', successCount);
                } else {
                    showError('Partial Delete Success', `Deleted ${successCount} snack(s), failed to delete ${errorCount} snack(s)`);
                }
            } else {
                closeSwal();
                showError('Delete Failed', 'Failed to delete any snacks');
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            closeSwal();
            showError('Delete Error', 'An error occurred while deleting snacks');
        }
    }, [, user?.branch?._id, tickedSnacks, filterSnacks, snacks, removeSnack, refreshSnacks]);

    const handleDeleteClick = useCallback(async () => {
        const confirmResult = await showDeleteItemsConfirmation('snacks', tickedSnacks.size);

        if (confirmResult.isConfirmed) {
            await handleDeleteConfirm();
        }
    }, [tickedSnacks, handleDeleteConfirm]);

    // Status change handler (activate/deactivate)
    const onStatusChange = useCallback(
        async (rowIndex, newIsHidden) => {
            const branchId = user?.branch?._id;
            if (!branchId) {
                showError('No Branch Selected', 'No branch selected');
                return;
            }

            // Adjust index for new snack row if adding
            const adjustedIndex = isAddingSnack ? rowIndex - 1 : rowIndex;

            const filteredSnacks = filterSnacks(snacks || []);
            const snack = filteredSnacks[adjustedIndex];
            if (!snack) return;

            try {
                showProcessingItemStatus(`${newIsHidden ? 'deactivating' : 'activating'}`, 'snacks');

                const snackToUpdate = {
                    isHidden: newIsHidden,
                };

                const snackId = snack._id || snack.id;
                const result = await updateSnack(branchId, snackId, snackToUpdate);

                if (result.success) {
                    // Update local state optimistically instead of refreshing
                    if (snacks && setSnacks) {
                        setSnacks((prevSnacks) => {
                            return prevSnacks.map((s) => {
                                const currentSnackId = s._id || s.id;
                                if (currentSnackId === snackId) {
                                    return { ...s, isHidden: newIsHidden };
                                }
                                return s;
                            });
                        });
                    }
                    showItemStatusChanged('snacks', snack.name, newIsHidden ? 'hidden from customers' : 'visible to customers');
                } else {
                    closeSwal();
                    showError('Status Update Failed', result.error || 'Failed to update snack status');
                }
            } catch (error) {
                console.error('Failed to toggle snack activation:', error);
                closeSwal();
                showError('Status Update Error', 'Failed to update snack status');
            }
        },
        [user?.branch?._id, filterSnacks, snacks, updateSnack, refreshSnacks, isAddingSnack],
    );

    // Data processing
    const getProcessedSnackData = useCallback(() => {
        const filteredSnacks = filterSnacks(snacks || []);

        // Create rows for existing snacks
        const existingSnackRows = filteredSnacks.map((snack, index) => [
            'TickButton',
            snack.shortname || 'N/A', // ID (shortname)
            snack.name || '', // Name
            snack.price ? `$${snack.price}` : '$0', // Price
            snack.discountedPrice ? `$${snack.discountedPrice}` : '', // DPrice
            snack.description || '', // Description
            snack.imageURL || '', // Image
            snack.stock !== undefined ? snack.stock.toString() : '0', // Stock
            {
                type: 'ActiveButton',
                isHidden: snack.isHidden || false,
                rowIndex: index + (isAddingSnack ? 1 : 0),
                isUpdating: false,
            },
        ]);

        let allSnackRows = [...existingSnackRows];

        // Add new snack row at the top if adding
        if (isAddingSnack) {
            const newSnackRow = [
                { type: 'AddIndicator' },
                newSnackData.shortname || 'NEW', // ID (shortname)
                newSnackData.name,
                newSnackData.price ? `$${parseInt(newSnackData.price)}` : '$0',
                newSnackData.discountedPrice ? `$${parseInt(newSnackData.discountedPrice)}` : '',
                newSnackData.description,
                newSnackData.imageURL,
                newSnackData.stock || '0',
                {
                    type: 'ActiveButton',
                    isHidden: !newSnackData.isAvailable,
                    rowIndex: 0,
                    isUpdating: false,
                    disabled: true, // Disable for new snack until saved
                },
            ];

            allSnackRows = [newSnackRow, ...existingSnackRows];
        }

        return allSnackRows;
    }, [filterSnacks, snacks, isAddingSnack, newSnackData]);

    return {
        // Data
        snackData: getProcessedSnackData(),
        header,
        snackColumnConfig,
        editableColumns,
        fieldTypes,

        // State
        loading: snacksLoading,
        error: snacksError,
        tickedSnacks,
        setTickedSnacks,
        isAddingSnack,
        updateLoading,
        deleteLoading,

        // Branch info
        currentBranch: user?.branch?._id,
        userBranch,
        branchLoading,

        // Inline editing
        editingCell,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit,
        isUpdating,

        // Snack operations
        handleStartAddSnack,
        handleCancelAddSnack,
        handleConfirmAddSnack,
        handleDeleteClick,
        onStatusChange,

        // Search
        handleSearch,

        // Utilities
        refreshSnacks,
        validateSnack,
    };
};

export default useSnackManagement;
