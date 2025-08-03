import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@contexts/UserContext';
import { 
  useGetScreens, 
  useCreateScreen,
  useUpdateScreen, 
  useRemoveScreen,
  useGetScreenSeats,
  useBulkCreateSeats
} from '@hooks/useBranch';
import { showError, showSuccess } from '@/utils/sweetalert';

/**
 * Comprehensive hook for managing screen operations in the branch manager panel
 * Handles CRUD operations for screens and their associated seats
 */
export const useScreenManagement = () => {
  const { user } = useUser();
  const branchId = user?.branch?._id || user?.branch;

  console.log('🏗️ [useScreenManagement] Hook initialized');
  console.log('👤 [useScreenManagement] user:', user);
  console.log('🏢 [useScreenManagement] branchId:', branchId);

  // API hooks for screens
  const { getScreens, screens, setScreens, loading } = useGetScreens();
  const { createScreen, loading: createLoading } = useCreateScreen();
  const { updateScreen, loading: updateLoading } = useUpdateScreen();
  const { removeScreen, loading: removeLoading } = useRemoveScreen();
  const { getScreenSeats } = useGetScreenSeats();
  const { bulkCreateSeats } = useBulkCreateSeats();

  // Debug API hooks
  console.log('🔌 [useScreenManagement] API hooks loaded');
  console.log('📊 [useScreenManagement] Current screens state:', screens);
  console.log('⏳ [useScreenManagement] Loading state:', loading);

  // UI state
  const [tickedScreens, setTickedScreens] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingScreen, setIsAddingScreen] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingScreenId, setUpdatingScreenId] = useState(null); // Track which specific screen is being updated

  // New screen state
  const [newScreenData, setNewScreenData] = useState({
    screenName: '',
    screenType: '2D',
    rows: '',
    columns: '',
    isActive: true
  });

  // Column configuration
  const editableColumns = [1, 2, 3, 4]; // screenName, screenType, rows, columns
  const columnFieldMapping = {
    1: 'screenName',
    2: 'screenType', 
    3: 'size.rows',
    4: 'size.columns'
  };

  const header = ['', 'Screen Name', 'Type', 'Rows', 'Columns', 'Active', 'Edit Seats'];

  // Field types configuration
  const fieldTypes = {
    0: 'text',   // TickButton (not editable)
    1: 'text',   // Screen Name - text
    2: 'select', // Screen Type - select
    3: 'number', // Rows - number
    4: 'number', // Columns - number
    5: 'text',   // Active (toggle button)
    6: 'text'    // Edit Seats (button)
  };

  const screenTypeOptions = ['2D', '3D', 'IMAX', '4DX'];

  const screenColumnConfig = [
    { width: 'w-12', truncate: false },    // TickButton
    { width: 'w-48', truncate: true },     // Screen Name
    { width: 'w-24', truncate: false },    // Type
    { width: 'w-20', truncate: false },    // Rows
    { width: 'w-20', truncate: false },    // Columns
    { width: 'w-20', truncate: false },    // Active
    { width: 'w-28', truncate: false }     // Edit Seats
  ];

  // Initialize screens on mount
  useEffect(() => {
    console.log('🔍 [useScreenManagement] useEffect triggered');
    console.log('🔍 [useScreenManagement] user:', user);
    console.log('🔍 [useScreenManagement] branchId:', branchId);
    
    if (branchId) {
      console.log('✅ [useScreenManagement] branchId found, calling fetchScreens');
      fetchScreens();
    } else {
      console.log('❌ [useScreenManagement] No branchId found');
    }
  }, [branchId]);

  // Monitor screens state changes
  useEffect(() => {
    console.log('📊 [useScreenManagement] Screens state changed:', screens);
    console.log('📈 [useScreenManagement] Screens count:', screens?.length || 0);
    if (screens && screens.length > 0) {
      console.log('🎯 [useScreenManagement] First screen sample:', screens[0]);
    }
  }, [screens]);

  const fetchScreens = useCallback(async () => {
    console.log('📥 [fetchScreens] Starting fetch for branchId:', branchId);
    
    if (!branchId) {
      console.log('❌ [fetchScreens] No branchId provided');
      return;
    }
    
    try {
      const result = await getScreens(branchId);
      console.log('✅ [fetchScreens] Success - result:', result);
      console.log('📊 [fetchScreens] Screens data:', screens);
    } catch (error) {
      console.error('❌ [fetchScreens] Error fetching screens:', error);
    }
  }, [branchId, getScreens, screens]);

  // Search functionality
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const filterScreens = useCallback((screensList) => {
    console.log('🔍 [filterScreens] Input screensList:', screensList);
    
    // Convert object to array if needed
    let screensArray = [];
    if (Array.isArray(screensList)) {
      screensArray = screensList;
    } else if (screensList && typeof screensList === 'object') {
      // Convert object like {0: {...}, 1: {...}, fromCache: true} to array
      screensArray = Object.keys(screensList)
        .filter(key => !isNaN(key)) // Only numeric keys
        .map(key => screensList[key]);
      console.log('🔄 [filterScreens] Converted object to array:', screensArray);
    }
    
    if (!searchTerm.trim()) {
      return screensArray;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return screensArray.filter(screen => {
      const nameMatch = screen.screenName?.toLowerCase().includes(searchLower);
      const typeMatch = screen.screenType?.toLowerCase().includes(searchLower);
      return nameMatch || typeMatch;
    });
  }, [searchTerm]);

  // Auto-generate seats for a screen
  const generateSeatsForScreen = useCallback((rows, columns) => {
    const seats = [];
    
    for (let row = 1; row <= rows; row++) {
      // Convert row number to letter (1 = A, 2 = B, etc.)
      const rowLetter = String.fromCharCode(64 + row); // 65 is 'A', so 64 + 1 = 65
      
      for (let col = 1; col <= columns; col++) {
        seats.push({
          seatNumber: `${rowLetter}${col}`,
          location: {
            row: rowLetter,
            column: col
          },
          category: 'STANDARD',
          isHidden: false
        });
      }
    }
    
    console.log('🪑 [generateSeatsForScreen] Generated seats:', seats);
    return seats;
  }, []);

  // New screen field change handler
  const handleNewScreenFieldChange = useCallback((columnIndex, value) => {
    const fieldName = columnFieldMapping[columnIndex];
    if (fieldName) {
      setNewScreenData(prev => {
        if (fieldName === 'size.rows') {
          return { ...prev, rows: value };
        } else if (fieldName === 'size.columns') {
          return { ...prev, columns: value };
        } else {
          return { ...prev, [fieldName]: value };
        }
      });
    }
  }, [columnFieldMapping]);

  // Screen name validation
  const validateScreenName = useCallback((screenName) => {
    if (!screenName || !screenName.trim()) {
      return { isValid: false, message: 'Screen name is required.' };
    }

    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    
    const existingScreen = screensArray.find(screen => 
      screen.screenName?.toLowerCase().trim() === screenName.toLowerCase().trim()
    );

    if (existingScreen) {
      return { isValid: false, message: 'A screen with this name already exists in this branch.' };
    }

    return { isValid: true, message: '' };
  }, [screens, filterScreens]);

  // Inline editing handlers
  const handleStartEdit = useCallback((rowIndex, columnIndex, currentValue) => {
    if (editableColumns.includes(columnIndex) && !isUpdating) {
      if (isAddingScreen && rowIndex === 0) {
        setEditingCell({ rowIndex, columnIndex, value: currentValue });
        return;
      }
      setEditingCell({ rowIndex, columnIndex, value: currentValue });
    }
  }, [editableColumns, isUpdating, isAddingScreen]);

  const handleSaveEdit = useCallback(async (rowIndex, columnIndex, newValue) => {
    // Handle new screen field changes
    if (isAddingScreen && rowIndex === 0) {
      handleNewScreenFieldChange(columnIndex, newValue);
      setEditingCell(null);
      return;
    }
    
    // Adjust index for existing screens when adding screen
    const adjustedRowIndex = isAddingScreen ? rowIndex - 1 : rowIndex;
    
    // Handle existing screen changes
    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const screen = screensArray[adjustedRowIndex];
    const fieldName = columnFieldMapping[columnIndex];
    
    if (screen && fieldName && branchId) {
      const screenId = screen.id || screen._id;
      const screenName = screen.screenName || screen.name || `Screen ${screenId}`;
      
      // Validate the input based on field type
      let validationError = null;
      
      if (fieldName === 'screenName') {
        if (!newValue || !newValue.trim()) {
          validationError = 'Screen name cannot be empty.';
        } else {
          // Check for duplicate screen name (excluding current screen)
          const nameValidation = validateScreenName(newValue);
          if (!nameValidation.isValid) {
            // Allow if it's the same screen (no actual change)
            if (newValue.trim().toLowerCase() !== screen.screenName?.toLowerCase().trim()) {
              validationError = nameValidation.message;
            }
          }
        }
      } else if (fieldName === 'size.rows') {
        const rows = parseInt(newValue);
        if (isNaN(rows) || rows < 1 || rows > 26) {
          validationError = 'Rows must be between 1-26 (A-Z).';
        }
      } else if (fieldName === 'size.columns') {
        const columns = parseInt(newValue);
        if (isNaN(columns) || columns < 1 || columns > 50) {
          validationError = 'Columns must be between 1-50.';
        }
      }
      
      if (validationError) {
        showError('Validation Error', validationError);
        setEditingCell(null);
        return;
      }
      
      try {
        setIsUpdating(true);
        
        let updateData = {};
        if (fieldName === 'size.rows') {
          updateData.size = { ...screen.size, rows: parseInt(newValue) };
        } else if (fieldName === 'size.columns') {
          updateData.size = { ...screen.size, columns: parseInt(newValue) };
        } else {
          updateData[fieldName] = newValue;
        }
        
        const result = await updateScreen(branchId, screenId, updateData);
        
        if (result.success) {
          await fetchScreens(); // Refresh data
          
          // Show success notification
          showSuccess(
            'Screen Updated',
            `Screen "${screenName}" has been updated successfully.`
          );
        } else {
          console.error('Failed to update screen:', result.error);
          
          // Parse error message for user-friendly display
          let errorMessage = 'Failed to update screen. Please check your input and try again.';
          
          if (result.error) {
            if (typeof result.error === 'string') {
              errorMessage = result.error;
            } else if (result.error.message) {
              errorMessage = result.error.message;
            }
          }
          
          // Show error notification
          showError('Cannot Update Screen', errorMessage);
        }
      } catch (error) {
        console.error('Failed to save edit:', error);
        
        // Show generic error notification for unexpected errors
        showError(
          'Error Occurred',
          'An unexpected error occurred while updating the screen. Please try again.'
        );
      } finally {
        setIsUpdating(false);
        setEditingCell(null);
      }
    }
  }, [isAddingScreen, screens, columnFieldMapping, filterScreens, updateScreen, branchId, fetchScreens, validateScreenName]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  // New screen management
  const handleStartAddScreen = useCallback(() => {
    console.log('🆕 [handleStartAddScreen] Starting to add new screen');
    console.log('🆕 [handleStartAddScreen] Current state:', { isAddingScreen, editingCell });
    
    setEditingCell(null);
    setIsAddingScreen(true);
    setNewScreenData({
      screenName: '',
      screenType: '2D',
      rows: '',
      columns: '',
      isActive: true
    });
    
    console.log('🆕 [handleStartAddScreen] New screen data initialized:', {
      screenName: '',
      screenType: '2D',
      rows: '',
      columns: '',
      isActive: true
    });
    console.log('🆕 [handleStartAddScreen] isAddingScreen set to true');
  }, [isAddingScreen, editingCell]);

  const handleCancelAddScreen = useCallback(() => {
    setEditingCell(null);
    setIsAddingScreen(false);
    setNewScreenData({
      screenName: '',
      screenType: '2D',
      rows: '',
      columns: '',
      isActive: true
    });
  }, []);

  const handleConfirmAddScreen = useCallback(async () => {
    if (!branchId) return;

    try {
      setIsUpdating(true);

      // Validate required fields
      if (!newScreenData.screenName.trim()) {
        showError('Validation Error', 'Screen name is required.');
        return;
      }

      if (!newScreenData.rows || !newScreenData.columns) {
        showError('Validation Error', 'Both rows and columns are required.');
        return;
      }

      const rows = parseInt(newScreenData.rows);
      const columns = parseInt(newScreenData.columns);

      if (rows < 1 || rows > 26 || columns < 1 || columns > 50) {
        showError('Validation Error', 'Rows must be between 1-26 (A-Z) and columns must be between 1-50.');
        return;
      }

      // Validate screen name uniqueness
      const nameValidation = validateScreenName(newScreenData.screenName);
      if (!nameValidation.isValid) {
        showError('Screen Name Error', nameValidation.message);
        return;
      }

      const screenToAdd = {
        screenName: newScreenData.screenName.trim(),
        screenType: newScreenData.screenType,
        size: {
          rows: rows,
          columns: columns
        },
        isActive: newScreenData.isActive
      };

      console.log('📝 [handleConfirmAddScreen] Creating screen:', screenToAdd);

      // Create the screen first
      const result = await createScreen(branchId, screenToAdd);
      
      if (result.success) {
        const newScreenId = result.screen?._id || result.screen?.id;
        console.log('✅ [handleConfirmAddScreen] Screen created successfully with ID:', newScreenId);

        if (newScreenId) {
          // Generate and create seats for the new screen
          const seatsData = generateSeatsForScreen(rows, columns);
          
          console.log('🪑 [handleConfirmAddScreen] Creating seats for screen:', { 
            screenId: newScreenId, 
            seatsCount: seatsData.length 
          });

          try {
            const seatsResult = await bulkCreateSeats(branchId, newScreenId, { seats: seatsData });
            
            if (seatsResult.success || seatsResult.seats) {
              console.log('✅ [handleConfirmAddScreen] Seats created successfully:', seatsResult);
              
              showSuccess(
                'Screen Created',
                `Screen "${screenToAdd.screenName}" has been created successfully with ${seatsData.length} seats.`
              );
            } else {
              console.warn('⚠️ [handleConfirmAddScreen] Seats creation may have failed:', seatsResult);
              
              showSuccess(
                'Screen Created',
                `Screen "${screenToAdd.screenName}" has been created successfully, but there was an issue creating seats. You can add seats manually later.`
              );
            }
          } catch (seatError) {
            console.error('❌ [handleConfirmAddScreen] Error creating seats:', seatError);
            
            showSuccess(
              'Screen Created',
              `Screen "${screenToAdd.screenName}" has been created successfully, but there was an issue creating seats. You can add seats manually later.`
            );
          }
        } else {
          console.warn('⚠️ [handleConfirmAddScreen] No screen ID returned, cannot create seats');
          
          showSuccess(
            'Screen Created',
            `Screen "${screenToAdd.screenName}" has been created successfully, but there was an issue creating seats. You can add seats manually later.`
          );
        }

        // Refresh screen data and reset form
        await fetchScreens();
        setIsAddingScreen(false);
        setNewScreenData({
          screenName: '',
          screenType: '2D',
          rows: '',
          columns: '',
          isActive: true
        });
      } else {
        console.error('Failed to add screen:', result.error);
        
        // Parse error message for user-friendly display
        let errorMessage = 'Failed to create screen. Please check your input and try again.';
        
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
        }
        
        // Show error notification
        showError('Cannot Create Screen', errorMessage);
      }

    } catch (error) {
      console.error('Failed to add screen:', error);
      
      // Show generic error notification for unexpected errors
      showError(
        'Error Occurred',
        'An unexpected error occurred while creating the screen. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  }, [branchId, newScreenData, fetchScreens, validateScreenName, generateSeatsForScreen, createScreen, bulkCreateSeats]);

  // Status change handler
  const onStatusChange = useCallback(async (rowIndex, newIsHidden) => {
    console.log('🔄 [onStatusChange] Called with:', { rowIndex, newIsHidden });
    
    if (!branchId) {
      console.log('❌ [onStatusChange] No branchId found');
      return;
    }

    // Convert isHidden to isActive (isActive = !isHidden)
    const newIsActive = !newIsHidden;
    console.log('🔄 [onStatusChange] Converted to isActive:', newIsActive);

    // Adjust index for existing screens when adding screen
    const adjustedRowIndex = isAddingScreen ? rowIndex - 1 : rowIndex;
    console.log('🔄 [onStatusChange] Adjusted row index:', { original: rowIndex, adjusted: adjustedRowIndex, isAddingScreen });

    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const targetScreen = screensArray[adjustedRowIndex];
    
    console.log('🎯 [onStatusChange] Target screen:', targetScreen);
    
    if (!targetScreen) {
      console.log('❌ [onStatusChange] No target screen found at index:', adjustedRowIndex);
      return;
    }
    
    try {
      const screenId = targetScreen.id || targetScreen._id;
      console.log('📝 [onStatusChange] Updating screen:', { screenId, newIsActive });
      
      // Set the specific screen being updated
      setUpdatingScreenId(screenId);
      setIsUpdating(true);
      
      const result = await updateScreen(branchId, screenId, { isActive: newIsActive });
      
      if (result.success) {
        console.log('✅ [onStatusChange] Successfully updated screen status');
        
        // Only refresh data on successful update
        await fetchScreens();
        
        // Show success notification
        const statusText = newIsActive ? 'activated' : 'deactivated';
        showSuccess(
          'Screen Status Updated',
          `Screen "${targetScreen.screenName || targetScreen.name}" has been ${statusText} successfully.`
        );
      } else {
        console.error('❌ [onStatusChange] Failed to update screen status:', result.error);
        
        // Parse error message for user-friendly display
        let errorMessage = 'Failed to update screen status. Please try again.';
        
        if (result.error) {
          // Handle specific backend constraint errors
          if (typeof result.error === 'string' && result.error.includes('Cannot deactivate screen')) {
            errorMessage = result.error; // Use the backend message directly
          } else if (result.error.message && result.error.message.includes('Cannot deactivate screen')) {
            errorMessage = result.error.message;
          } else if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
        }
        
        // Show error notification - DO NOT refresh data on failure
        showError('Cannot Update Screen Status', errorMessage);
      }
    } catch (error) {
      console.error('❌ [onStatusChange] Error updating screen status:', error);
      
      // Show generic error notification for unexpected errors - DO NOT refresh data on failure
      showError(
        'Error Occurred',
        'An unexpected error occurred while updating the screen status. Please try again.'
      );
    } finally {
      setUpdatingScreenId(null);
      setIsUpdating(false);
    }
  }, [branchId, screens, filterScreens, updateScreen, fetchScreens, isAddingScreen]);

  // Delete operations
  const handleDeleteConfirm = useCallback(async () => {
    if (!branchId) return;

    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const selectedIndices = Array.from(tickedScreens);
    
    try {
      const deletedScreenNames = [];
      let failedDeletes = 0;
      
      for (const index of selectedIndices) {
        // Adjust index for existing screens when adding screen
        const adjustedIndex = isAddingScreen ? index - 1 : index;
        
        // Skip if this is the "add new screen" row (index 0 when adding)
        if (isAddingScreen && index === 0) {
          continue;
        }
        
        const screen = screensArray[adjustedIndex];
        if (screen) {
          const screenId = screen.id || screen._id;
          const screenName = screen.screenName || screen.name || `Screen ${screenId}`;
          
          const result = await removeScreen(branchId, screenId);
          
          if (result.success) {
            deletedScreenNames.push(screenName);
          } else {
            failedDeletes++;
            console.error('Failed to delete screen:', screenName, result.error);
          }
        }
      }
      
      await fetchScreens();
      setTickedScreens(new Set());
      
      // Show appropriate notification based on results
      if (deletedScreenNames.length > 0 && failedDeletes === 0) {
        // All deletions successful
        const message = deletedScreenNames.length === 1
          ? `Screen "${deletedScreenNames[0]}" has been deleted successfully.`
          : `${deletedScreenNames.length} screens have been deleted successfully.`;
        
        showSuccess('Screens Deleted', message);
      } else if (deletedScreenNames.length > 0 && failedDeletes > 0) {
        // Partial success
        const message = `${deletedScreenNames.length} screen(s) deleted successfully, but ${failedDeletes} failed. Please try again for the remaining screens.`;
        showError('Partial Delete Success', message);
      } else if (failedDeletes > 0) {
        // All deletions failed
        showError('Delete Failed', 'Failed to delete the selected screens. Please try again.');
      }
      
    } catch (error) {
      console.error('Failed to delete screens:', error);
      
      // Show generic error notification for unexpected errors
      showError(
        'Error Occurred',
        'An unexpected error occurred while deleting screens. Please try again.'
      );
    }
  }, [tickedScreens, branchId, screens, filterScreens, removeScreen, fetchScreens, isAddingScreen]);

  // Data processing
  const getProcessedScreenData = useCallback(() => {
    console.log('🔄 [getProcessedScreenData] Processing screen data');
    console.log('📊 [getProcessedScreenData] Raw screens:', screens);
    console.log('🔍 [getProcessedScreenData] Search term:', searchTerm);
    
    const filteredScreens = filterScreens(screens || []);
    console.log('✂️ [getProcessedScreenData] Filtered screens:', filteredScreens);
    console.log('📈 [getProcessedScreenData] Filtered screens count:', filteredScreens?.length || 0);
    
    // Ensure filteredScreens is an array
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    
    // Create rows for existing screens
    const existingScreenRows = screensArray.map((screen, index) => {
      const row = [
        'TickButton',
        screen.screenName || '',
        screen.screenType || '',
        screen.size?.rows || 0,
        screen.size?.columns || 0,
        { 
          type: 'ActiveButton', 
          isHidden: !(screen.isActive !== false), // Convert isActive to isHidden (isHidden = !isActive)
          rowIndex: index + (isAddingScreen ? 1 : 0),
          isUpdating: updatingScreenId === (screen._id || screen.id)
        }, 
        'EditSeatButton'
      ];
      
      console.log(`📋 [getProcessedScreenData] Screen ${index}:`, {
        id: screen._id || screen.id,
        name: screen.screenName,
        type: screen.screenType,
        size: screen.size,
        isActive: screen.isActive,
        row: row
      });
      
      return row;
    });

    let allScreenRows = [...existingScreenRows];
    
    // Add new screen row if adding
    if (isAddingScreen) {
      console.log('➕ [getProcessedScreenData] Adding new screen row:', newScreenData);
      console.log('➕ [getProcessedScreenData] isAddingScreen is true, creating new row');
      const newScreenRow = [
        { type: 'AddIndicator' },
        newScreenData.screenName,
        newScreenData.screenType,
        newScreenData.rows,
        newScreenData.columns,
        { 
          type: 'ActiveButton', 
          isHidden: !newScreenData.isActive, // Convert isActive to isHidden (isHidden = !isActive)
          rowIndex: 0,
          isUpdating: false,
          disabled: true
        }, 
        'NEW' // Simple text instead of AddLabel with buttons
      ];
      console.log('➕ [getProcessedScreenData] New screen row created:', newScreenRow);
      allScreenRows = [newScreenRow, ...allScreenRows];
      console.log('➕ [getProcessedScreenData] Added new screen row to beginning of array');
    } else {
      console.log('❌ [getProcessedScreenData] Not adding screen - isAddingScreen is false');
    }

    console.log('🎯 [getProcessedScreenData] Final processed data:', allScreenRows);
    console.log('📊 [getProcessedScreenData] Total rows:', allScreenRows.length);
    
    return allScreenRows;
  }, [screens, isAddingScreen, newScreenData, isUpdating, filterScreens, updatingScreenId]);

  // Debug hook return data
  const screenData = getProcessedScreenData();
  console.log('🚀 [useScreenManagement] Hook returning data:');
  console.log('📊 [useScreenManagement] screenData:', screenData);
  console.log('📈 [useScreenManagement] screenData length:', screenData.length);
  console.log('⏳ [useScreenManagement] loading:', loading);
  console.log('🎯 [useScreenManagement] isAddingScreen:', isAddingScreen);
  console.log('🔧 [useScreenManagement] newScreenData:', newScreenData);
  console.log('📝 [useScreenManagement] editingCell:', editingCell);

  return {
    // Data
    screenData,
    header,
    screenColumnConfig,
    editableColumns,
    fieldTypes,
    screenTypeOptions,
    
    // State
    loading,
    tickedScreens,
    setTickedScreens,
    isAddingScreen,
    updateLoading,
    removeLoading,
    
    // Inline editing
    editingCell,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    isUpdating,
    
    // Screen operations
    handleStartAddScreen,
    handleCancelAddScreen,
    handleConfirmAddScreen,
    handleDeleteConfirm,
    onStatusChange,
    
    // Search
    handleSearch,
    
    // Branch info
    branchId,
    
    // Seat management
    getScreenSeats
  };
};
