import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@contexts/UserContext';
import { adminService } from '@services';
import { branchService } from '@services/branch.service';
import { showError, showSuccess, showLoading, closeSwal } from '@utils/sweetalert';

/**
 * Comprehensive hook for managing branch operations in the admin panel
 * Handles CRUD operations for branches
 */
export const useBranchManagement = () => {
    const { user, token } = useUser();

    // State management
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);

    // UI state
    const [tickedBranches, setTickedBranches] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingBranch, setIsAddingBranch] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updatingBranchId, setUpdatingBranchId] = useState(null);

    // New branch state
    const [newBranchData, setNewBranchData] = useState({
        name: '',
        address: '',
        city: '',
        imageURL: '',
        location: '',
        isActive: true,
    });

    // Column configuration
    const editableColumns = isAddingBranch ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5]; // Name, Address, City, Image URL, Location
    const columnFieldMapping = {
        1: 'name',
        2: 'address',
        3: 'city',
        4: 'imageURL',
        5: 'location',
    };

    const header = ['', 'Name', 'Address', 'City', 'Image URL', 'Location', 'Active'];

    // Field types configuration
    const fieldTypes = {
        0: 'text', // TickButton (not editable)
        1: 'text', // Name
        2: 'text', // Address
        3: 'text', // City
        4: 'text', // Image URL
        5: 'text', // Location (now editable)
        6: 'text', // Active (toggle button)
    };

    const branchColumnConfig = [
        { width: 'w-12', truncate: false }, // TickButton
        { width: 'w-40', truncate: true }, // Name
        { width: 'w-60', truncate: true }, // Address
        { width: 'w-32', truncate: true }, // City
        { width: 'w-48', truncate: true }, // Image URL
        { width: 'w-40', truncate: true }, // Location (lat, lng)
        { width: 'w-20', truncate: false }, // Active
    ];

    // Initialize branches on mount
    useEffect(() => {
        if (user && user.roles?.includes('administrator')) {
            fetchBranches();
        }
    }, [user]);

    const fetchBranches = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const data = await adminService.getAllBranches(token);
            setBranches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Search functionality
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const filterBranches = useCallback(
        (branchesList) => {
            let branchesArray = Array.isArray(branchesList) ? branchesList : [];

            if (!searchTerm.trim()) {
                return branchesArray;
            }

            const searchLower = searchTerm.toLowerCase();
            return branchesArray.filter((branch) => {
                return branch.name?.toLowerCase().includes(searchLower) || branch.address?.toLowerCase().includes(searchLower) || branch.city?.toLowerCase().includes(searchLower);
            });
        },
        [searchTerm],
    );

    // New branch field change handler
    const handleNewBranchFieldChange = useCallback(
        (columnIndex, value) => {
            const fieldName = columnFieldMapping[columnIndex];

            if (fieldName) {
                setNewBranchData((prev) => ({
                    ...prev,
                    [fieldName]: value,
                }));
            }
        },
        [columnFieldMapping],
    );

    // Location parsing helper function
    const parseLocationInput = useCallback((locationStr) => {
        if (!locationStr || !locationStr.trim()) return null;

        try {
            // Try to parse as "lat, lng" format
            const trimmed = locationStr.trim();
            const parts = trimmed.split(',').map((part) => part.trim());

            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lng = parseFloat(parts[1]);

                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    return {
                        type: 'Point',
                        coordinates: [lng, lat], // MongoDB format: [longitude, latitude]
                    };
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }, []);

    // Location formatting helper function
    const formatLocationDisplay = useCallback((location) => {
        if (!location || !location.coordinates || !Array.isArray(location.coordinates)) {
            return 'Not set';
        }
        const [lng, lat] = location.coordinates;
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }, []);

    // Helper function to check if branch has active schedules
    const checkBranchSchedules = useCallback(
        async (branchId) => {
            try {
                console.log('🔍 [checkBranchSchedules] Checking schedules for branch:', branchId);

                // Call the branch schedules API to check if there are any active schedules
                const response = await branchService.getBranchSchedules(branchId, {}, token);
                console.log('📋 [checkBranchSchedules] Raw API response:', response);

                // FIX: Extract schedules array from response object
                const schedules = response.schedules || [];
                console.log('📋 [checkBranchSchedules] Extracted schedules array:', schedules);
                console.log('📋 [checkBranchSchedules] Schedules count:', schedules.length);

                // Check if there are any schedules (active or upcoming)
                if (schedules && Array.isArray(schedules) && schedules.length > 0) {
                    const now = new Date();
                    console.log('⏰ [checkBranchSchedules] Current time:', now);

                    // Filter for schedules that are still active or upcoming
                    const activeSchedules = schedules.filter((schedule) => {
                        const scheduleStartTime = new Date(schedule.startTime);
                        const scheduleEndTime = new Date(schedule.endTime);

                        console.log(`📅 [checkBranchSchedules] Schedule ${schedule._id}:`, {
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                            parsedStartTime: scheduleStartTime,
                            parsedEndTime: scheduleEndTime,
                            isInFuture: scheduleStartTime > now,
                            isCurrentlyRunning: scheduleStartTime <= now && scheduleEndTime > now,
                        });

                        // Schedule active nếu: chưa bắt đầu HOẶC đang chiếu
                        return scheduleStartTime > now || (scheduleStartTime <= now && scheduleEndTime > now);
                    });

                    console.log('✅ [checkBranchSchedules] Active schedules found:', activeSchedules.length);
                    console.log(
                        '📋 [checkBranchSchedules] Active schedules details:',
                        activeSchedules.map((s) => ({
                            _id: s._id,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            movie: s.movie?.title,
                        })),
                    );

                    return {
                        hasSchedules: activeSchedules.length > 0,
                        scheduleCount: activeSchedules.length,
                        totalSchedules: schedules.length,
                    };
                }

                console.log('❌ [checkBranchSchedules] No schedules found or schedules is not an array');
                return {
                    hasSchedules: false,
                    scheduleCount: 0,
                    totalSchedules: 0,
                };
            } catch (error) {
                console.error('❌ [checkBranchSchedules] Error checking branch schedules:', error);
                // If we can't check schedules, assume there might be schedules for safety
                return {
                    hasSchedules: true,
                    scheduleCount: 'unknown',
                    totalSchedules: 'unknown',
                    error: true,
                };
            }
        },
        [token],
    );

    // Branch name validation
    const validateBranchName = useCallback(
        (branchName) => {
            if (!branchName || !branchName.trim()) {
                return { isValid: false, message: 'Branch name is required' };
            }

            const filteredBranches = filterBranches(branches || []);
            const existingBranch = filteredBranches.find((branch) => branch.name?.toLowerCase().trim() === branchName.toLowerCase().trim());

            if (existingBranch) {
                return { isValid: false, message: 'Branch name already exists' };
            }

            return { isValid: true, message: '' };
        },
        [branches, filterBranches],
    );

    // Inline editing handlers
    const handleStartEdit = useCallback(
        (rowIndex, columnIndex, currentValue) => {
            console.log('[handleStartEdit] called with:', { rowIndex, columnIndex, currentValue, editableColumns, isUpdating });
            if (editableColumns.includes(columnIndex) && !isUpdating) {
                console.log('[handleStartEdit] Setting editing cell');
                setEditingCell({ rowIndex: rowIndex, columnIndex: columnIndex, value: currentValue });
            } else {
                console.log('[handleStartEdit] Not setting editing cell', {
                    columnEditable: editableColumns.includes(columnIndex),
                    notUpdating: !isUpdating,
                });
            }
        },
        [editableColumns, isUpdating],
    );

    const handleSaveEdit = useCallback(
        async (rowIndex, columnIndex, newValue) => {
            // Handle new branch field changes
            if (isAddingBranch && rowIndex === 0) {
                handleNewBranchFieldChange(columnIndex, newValue);
                setEditingCell(null);
                return;
            }

            // Adjust index for existing branches when adding branch
            const adjustedRowIndex = isAddingBranch ? rowIndex - 1 : rowIndex;

            // Handle existing branch changes
            const filteredBranches = filterBranches(branches || []);
            const branch = filteredBranches[adjustedRowIndex];
            const fieldName = columnFieldMapping[columnIndex];

            if (!branch || !fieldName) {
                setEditingCell(null);
                return;
            }

            // Validate branch name if editing name field
            if (fieldName === 'name') {
                const validation = validateBranchName(newValue);
                if (!validation.isValid) {
                    showError('Validation Error', validation.message);
                    setEditingCell(null);
                    return;
                }
            }

            // Parse and validate location if editing location field
            let updateData = { [fieldName]: newValue };
            if (fieldName === 'location') {
                const parsedLocation = parseLocationInput(newValue);
                if (newValue.trim() && !parsedLocation) {
                    showError('Invalid Location Format', 'Please use "latitude, longitude" format (e.g., "10.7769, 106.7009")');
                    setEditingCell(null);
                    return;
                }
                updateData = { [fieldName]: parsedLocation };
            }

            setIsUpdating(true);
            setUpdatingBranchId(branch._id);

            try {
                console.log('📤 [updateBranch] Sending update to backend:', updateData);

                await adminService.updateBranch(branch._id, updateData, token);
                await fetchBranches();

                // Show success notification
                showSuccess('Branch Updated', `Branch "${branch.name}" has been updated successfully.`);
            } catch (error) {
                console.error('Error updating branch:', error);

                // Parse error message for user-friendly display
                let errorMessage = 'Failed to update branch. Please check your input and try again.';

                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Show error notification
                showError('Cannot Update Branch', errorMessage);
            } finally {
                setIsUpdating(false);
                setUpdatingBranchId(null);
                setEditingCell(null);
            }
        },
        [isAddingBranch, branches, columnFieldMapping, filterBranches, token, validateBranchName, fetchBranches, handleNewBranchFieldChange],
    );

    const handleCancelEdit = useCallback(() => {
        setEditingCell(null);
    }, []);

    // New branch management
    const handleStartAddBranch = useCallback(() => {
        setIsAddingBranch(true);
        setNewBranchData({
            name: '',
            address: '',
            city: '',
            imageURL: '',
            isActive: true,
        });
    }, []);

    const handleCancelAddBranch = useCallback(() => {
        setIsAddingBranch(false);
        setNewBranchData({
            name: '',
            address: '',
            city: '',
            imageURL: '',
            isActive: true,
        });
        setEditingCell(null);
    }, []);

    const handleConfirmAddBranch = useCallback(async () => {
        // Validate required fields
        if (!newBranchData.name.trim()) {
            showError('Validation Error', 'Branch name is required');
            return;
        }

        if (!newBranchData.address.trim()) {
            showError('Validation Error', 'Branch address is required');
            return;
        }

        if (!newBranchData.city.trim()) {
            showError('Validation Error', 'Branch city is required');
            return;
        }

        // Validate branch name uniqueness
        const validation = validateBranchName(newBranchData.name);
        if (!validation.isValid) {
            showError('Branch Name Error', validation.message);
            return;
        }

        // Validate location if provided
        let locationData = null;
        if (newBranchData.location && newBranchData.location.trim()) {
            locationData = parseLocationInput(newBranchData.location);
            if (!locationData) {
                showError('Invalid Location Format', 'Please use "latitude, longitude" format (e.g., "10.7769, 106.7009")');
                return;
            }
        }

        try {
            setIsUpdating(true);

            // Show loading notification
            showLoading('Creating Branch...', 'Setting up your new branch in the system');

            const branchData = {
                name: newBranchData.name.trim(),
                address: newBranchData.address.trim(),
                city: newBranchData.city.trim(),
                imageURL: newBranchData.imageURL.trim() || '',
            };

            // Add location if provided
            if (locationData) {
                branchData.location = locationData;
            }

            console.log('📤 [createBranch] Sending data to backend:', branchData);
            const result = await adminService.createBranch(branchData, token);
            console.log('✅ [createBranch] Backend response:', result);

            await fetchBranches();

            // Close loading alert before showing success
            closeSwal();

            // Show success notification
            showSuccess('Branch Created Successfully!', `Branch "${branchData.name}" has been created successfully.`);

            // Reset state
            setIsAddingBranch(false);
            setNewBranchData({
                name: '',
                address: '',
                city: '',
                imageURL: '',
                location: '',
                isActive: true,
            });
        } catch (error) {
            console.error('❌ [createBranch] Error creating branch:', error);

            // Close loading alert before showing error
            closeSwal();

            // Parse error message for user-friendly display
            let errorMessage = 'Failed to create branch. Please check your input and try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Show error notification
            showError('Cannot Create Branch', errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [newBranchData, token, validateBranchName, parseLocationInput, fetchBranches]);

    // Status change handler
    const onStatusChange = useCallback(
        async (rowIndex, newIsHiddenOrIsActive) => {
            console.log('🔄 [onStatusChange] Called with rowIndex:', rowIndex, 'newIsHiddenOrIsActive:', newIsHiddenOrIsActive);
            console.log('🔄 [onStatusChange] isAddingBranch:', isAddingBranch);

            // Convert newIsHidden to newIsActive if needed
            // RowTemplate passes newIsHidden, but our API expects isActive
            const newIsActive = typeof newIsHiddenOrIsActive === 'boolean' ? !newIsHiddenOrIsActive : newIsHiddenOrIsActive;

            // For filtered branches, rowIndex is the index in the filtered array
            // No need to adjust here as the index is already correct
            const filteredBranches = filterBranches(branches || []);
            const branch = filteredBranches[rowIndex];

            console.log('🔄 [onStatusChange] branch found:', branch);
            console.log('🔄 [onStatusChange] newIsActive (converted):', newIsActive);

            if (!branch) {
                console.error('❌ [onStatusChange] No branch found at index:', rowIndex);
                return;
            }

            // If trying to deactivate branch (newIsActive = false), check for schedules first
            if (!newIsActive && branch.isActive) {
                try {
                    // Show loading while checking schedules
                    showLoading('Checking Branch...', 'Verifying branch can be deactivated');

                    const scheduleCheck = await checkBranchSchedules(branch._id);

                    // Close loading before showing result
                    closeSwal();

                    if (scheduleCheck.hasSchedules) {
                        const message = scheduleCheck.error
                            ? 'Cannot verify branch schedules. For safety, branch deactivation is blocked.'
                            : `Cannot deactivate branch "${branch.name}" because it has ${scheduleCheck.scheduleCount} active schedule(s). Please remove all schedules first.`;

                        showError('Cannot Deactivate Branch', message);
                        return;
                    }
                } catch (error) {
                    // Close loading before showing error
                    closeSwal();

                    console.error('❌ [onStatusChange] Error checking schedules:', error);
                    showError('Cannot Verify Branch Status', 'Unable to check branch schedules. Please try again or contact administrator.');
                    return;
                }
            }

            setIsUpdating(true);
            setUpdatingBranchId(branch._id);

            try {
                console.log('📤 [onStatusChange] Updating branch status:', branch._id, { isActive: newIsActive });
                await adminService.updateBranchStatus(branch._id, { isActive: newIsActive }, token);
                await fetchBranches();
                console.log('✅ [onStatusChange] Branch status updated successfully');

                // Show success notification
                const statusText = newIsActive ? 'activated' : 'deactivated';
                showSuccess('Branch Status Updated', `Branch "${branch.name}" has been ${statusText} successfully.`);
            } catch (error) {
                console.error('❌ [onStatusChange] Error updating branch status:', error);

                // Parse error message for user-friendly display
                let errorMessage = 'Failed to update branch status. Please try again.';

                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Show error notification
                showError('Cannot Update Branch Status', errorMessage);
            } finally {
                setIsUpdating(false);
                setUpdatingBranchId(null);
            }
        },
        [branches, filterBranches, token, fetchBranches, checkBranchSchedules],
    );

    // Delete operations
    const handleDeleteConfirm = useCallback(async () => {
        if (tickedBranches.size === 0) return;

        try {
            const filteredBranches = filterBranches(branches || []);
            const branchesToDelete = Array.from(tickedBranches)
                .map((index) => {
                    const adjustedIndex = isAddingBranch ? index - 1 : index;
                    return filteredBranches[adjustedIndex];
                })
                .filter(Boolean);

            // First, check all branches for schedules
            showLoading('Checking Branches...', 'Verifying branches can be deleted');

            const branchesWithSchedules = [];
            const safeBranchesToDelete = [];

            for (const branch of branchesToDelete) {
                try {
                    const scheduleCheck = await checkBranchSchedules(branch._id);

                    if (scheduleCheck.hasSchedules) {
                        branchesWithSchedules.push({
                            name: branch.name,
                            scheduleCount: scheduleCheck.scheduleCount,
                            error: scheduleCheck.error,
                        });
                    } else {
                        safeBranchesToDelete.push(branch);
                    }
                } catch (error) {
                    // If we can't check, assume it has schedules for safety
                    branchesWithSchedules.push({
                        name: branch.name,
                        scheduleCount: 'unknown',
                        error: true,
                    });
                }
            }

            // Close loading before showing results
            closeSwal();

            // If any branch has schedules, show error and stop
            if (branchesWithSchedules.length > 0) {
                const branchNames = branchesWithSchedules.map((b) => `"${b.name}"`).join(', ');
                const hasErrorChecks = branchesWithSchedules.some((b) => b.error);

                const message = hasErrorChecks
                    ? `Cannot verify schedules for ${branchNames}. For safety, deletion is blocked.`
                    : branchesWithSchedules.length === 1
                      ? `Cannot delete branch ${branchNames} because it has ${branchesWithSchedules[0].scheduleCount} active schedule(s). Please remove all schedules first.`
                      : `Cannot delete branches ${branchNames} because they have active schedules. Please remove all schedules first.`;

                showError('Cannot Delete Branches', message);
                return;
            }

            // If no branches have schedules, proceed with deletion
            if (safeBranchesToDelete.length === 0) {
                showError('No Branches to Delete', 'All selected branches have active schedules.');
                return;
            }

            // Show loading for delete operation
            const branchNames = safeBranchesToDelete.map((branch) => branch.name || 'Unknown').join(', ');
            showLoading('Deleting Branches...', `Removing ${safeBranchesToDelete.length} branch(es) from the system`);

            const deletedBranchNames = [];
            let failedDeletes = 0;

            // Delete branches one by one
            for (const branch of safeBranchesToDelete) {
                try {
                    await adminService.deleteBranch(branch._id, token);
                    deletedBranchNames.push(branch.name || 'Unknown');
                } catch (error) {
                    console.error('Failed to delete branch:', branch.name, error);
                    failedDeletes++;
                }
            }

            await fetchBranches();
            setTickedBranches(new Set());

            // Close loading alert before showing result
            closeSwal();

            // Show appropriate notification based on results
            if (deletedBranchNames.length > 0 && failedDeletes === 0) {
                // All deletions successful
                const message =
                    deletedBranchNames.length === 1 ? `Branch "${deletedBranchNames[0]}" has been deleted successfully.` : `${deletedBranchNames.length} branches have been deleted successfully.`;

                showSuccess('Branches Deleted', message);
            } else if (deletedBranchNames.length > 0 && failedDeletes > 0) {
                // Partial success
                const message = `${deletedBranchNames.length} branch(es) deleted successfully, but ${failedDeletes} failed. Please try again for the remaining branches.`;
                showError('Partial Delete Success', message);
            } else if (failedDeletes > 0) {
                // All deletions failed
                showError('Delete Failed', 'Failed to delete the selected branches. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting branches:', error);

            // Close loading alert before showing error
            closeSwal();

            // Show generic error notification for unexpected errors
            showError('Error Occurred', 'An unexpected error occurred while deleting branches. Please try again.');
        }
    }, [tickedBranches, branches, filterBranches, token, fetchBranches, isAddingBranch, checkBranchSchedules]);

    // Data processing
    const getProcessedBranchData = useCallback(() => {
        console.log('🔄 [getProcessedBranchData] editableColumns:', editableColumns);
        let processedData = [];

        // Helper function to format location display
        const formatLocation = (location) => {
            if (!location || !location.coordinates || !Array.isArray(location.coordinates)) {
                return 'Not set';
            }
            const [lng, lat] = location.coordinates;
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        };

        // Add new branch row if adding
        if (isAddingBranch) {
            const loadingIndicator = isUpdating ? '...' : '';
            processedData.push([
                { type: 'AddIndicator' },
                newBranchData.name + loadingIndicator,
                newBranchData.address + loadingIndicator,
                newBranchData.city + loadingIndicator,
                newBranchData.imageURL + loadingIndicator,
                newBranchData.location || 'Not set',
                {
                    type: 'ActiveButton',
                    isHidden: !newBranchData.isActive,
                    disabled: true,
                },
            ]);
        }

        // Add existing branches
        const filteredBranches = filterBranches(branches || []);
        filteredBranches.forEach((branch, index) => {
            const isCurrentlyUpdating = isUpdating && updatingBranchId === branch._id;
            const loadingIndicator = isCurrentlyUpdating ? '...' : '';

            processedData.push([
                'TickButton',
                (branch.name || '') + loadingIndicator,
                (branch.address || '') + loadingIndicator,
                (branch.city || '') + loadingIndicator,
                (branch.imageURL || '') + loadingIndicator,
                formatLocation(branch.location),
                {
                    type: 'ActiveButton',
                    isHidden: !branch.isActive,
                    disabled: isCurrentlyUpdating,
                    rowIndex: index,
                    onToggle: (newIsHidden) => {
                        // Pass the original filtered branches index, onStatusChange will handle adjustment
                        onStatusChange(index, !newIsHidden);
                    },
                },
            ]);
        });

        console.log('🔄 [getProcessedBranchData] processedData:', processedData);
        return processedData;
    }, [branches, isAddingBranch, newBranchData, isUpdating, filterBranches, updatingBranchId, onStatusChange, editableColumns]);

    // Get processed branch data
    const branchData = getProcessedBranchData();

    // Function to get actual branch object by row index
    const getBranchByIndex = useCallback(
        (rowIndex) => {
            const adjustedRowIndex = isAddingBranch ? rowIndex - 1 : rowIndex;
            const filteredBranches = filterBranches(branches || []);
            return filteredBranches[adjustedRowIndex] || null;
        },
        [branches, isAddingBranch, filterBranches],
    );

    return {
        branchData,
        header,
        branchColumnConfig,
        editableColumns,
        fieldTypes,
        loading,
        createLoading,
        updateLoading,
        removeLoading,
        tickedBranches,
        setTickedBranches,
        isAddingBranch,
        editingCell,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit,
        isUpdating,
        handleStartAddBranch,
        handleCancelAddBranch,
        handleConfirmAddBranch,
        handleDeleteConfirm,
        onStatusChange,
        handleSearch,
        fetchBranches,
        getBranchByIndex,
    };
};
