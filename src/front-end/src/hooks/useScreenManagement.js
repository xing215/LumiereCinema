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
import { showError, showSuccess, showLoading, closeSwal } from '@utils/sweetalert';

/**
 * Comprehensive hook for managing screen operations in the branch manager panel
 * Handles CRUD operations for screens and their associated seats
 */
export const useScreenManagement = () => {
  const { user } = useUser();
  const branchId = user?.branch?._id || user?.branch;

  // API hooks for screens
  const { getScreens, screens, setScreens, loading } = useGetScreens();
  const { createScreen, loading: createLoading } = useCreateScreen();
  const { updateScreen, loading: updateLoading } = useUpdateScreen();
  const { removeScreen, loading: removeLoading } = useRemoveScreen();
  const { getScreenSeats } = useGetScreenSeats();
  const { bulkCreateSeats } = useBulkCreateSeats();

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
    if (branchId) {
      fetchScreens();
    }
  }, [branchId]);

  // Monitor screens state changes
  useEffect(() => {
    // Silent monitoring for development
  }, [screens]);

  const fetchScreens = useCallback(async () => {
    if (!branchId) return;
    
    try {
      await getScreens(branchId);
    } catch (error) {
      console.error('❌ [fetchScreens] Error fetching screens:', error);
    }
  }, [branchId, getScreens]);

  // Search functionality
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const filterScreens = useCallback((screensList) => {
    // Convert object to array if needed
    let screensArray = [];
    if (Array.isArray(screensList)) {
      screensArray = screensList;
    } else if (screensList && typeof screensList === 'object') {
      // Convert object like {0: {...}, 1: {...}, fromCache: true} to array
      screensArray = Object.keys(screensList)
        .filter(key => !isNaN(key)) // Only numeric keys
        .map(key => screensList[key]);
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
    setEditingCell(null);
    setIsAddingScreen(true);
    setNewScreenData({
      screenName: '',
      screenType: '2D',
      rows: '',
      columns: '',
      isActive: true
    });
  }, []);

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

      console.log('🎬 [ADD_SCREEN_START] ===========================================');
      console.log('🎬 [ADD_SCREEN_START] Screen data to create:', screenToAdd);
      console.log('🎬 [ADD_SCREEN_START] Expected seats count:', rows * columns);

      // Show initial loading for seats generation
      showLoading('Preparing Screen...', 'Generating seat layout for your screen');

      // Generate seats data first (validate seats before creating screen)
      console.log('🪑 [SEATS_GENERATION_START] ===========================================');
      console.log('🪑 [SEATS_GENERATION_START] Generating seats for:', { rows, columns });
      
      const seatsData = generateSeatsForScreen(rows, columns);
      
      // Validate seats generation
      if (!seatsData || seatsData.length === 0) {
        closeSwal();
        showError('Seat Generation Failed', 'Failed to generate seats layout. Please try again.');
        console.error('❌ [SEATS_GENERATION_FAILED] No seats generated');
        return;
      }
      
      const expectedSeatsCount = rows * columns;
      if (seatsData.length !== expectedSeatsCount) {
        closeSwal();
        showError('Seat Generation Error', `Expected ${expectedSeatsCount} seats but generated ${seatsData.length}. Please try again.`);
        console.error('❌ [SEATS_GENERATION_MISMATCH] Expected:', expectedSeatsCount, 'Generated:', seatsData.length);
        return;
      }
      
      console.log('🪑 [SEATS_GENERATION_SUCCESS] Generated seats data:');
      console.log('🪑 [SEATS_GENERATION_SUCCESS] - Total seats:', seatsData.length);
      console.log('🪑 [SEATS_GENERATION_SUCCESS] - First 3 seats:', seatsData.slice(0, 3));
      console.log('🪑 [SEATS_GENERATION_SUCCESS] - Last 3 seats:', seatsData.slice(-3));
      console.log('🪑 [SEATS_GENERATION_SUCCESS] - Validation passed, proceeding with screen creation');

      // Update loading message for screen creation
      showLoading('Creating Screen...', 'Setting up your new screen in database');

      // Create the screen first
      const result = await createScreen(branchId, screenToAdd);
      
      if (result.success) {
        // Fix: API returns {message, screen} in data, we need result.data.screen
        const newScreenId = result.data?.screen?._id || result.data?.screen?.id || result.data?._id || result.data?.id;
        console.log('✅ [ADD_SCREEN_SUCCESS] Screen created with ID:', newScreenId);
        console.log('✅ [ADD_SCREEN_SUCCESS] Full result:', result);
        console.log('✅ [ADD_SCREEN_SUCCESS] Screen data:', result.data?.screen || result.data);

        if (newScreenId) {
          console.log('🪑 [ADD_SEATS_START] ===========================================');
          console.log('🪑 [ADD_SEATS_START] Starting seat creation for screen:', newScreenId);
          
          // Update loading message for seats creation
          showLoading('Creating Seats...', `Adding ${seatsData.length} seats to the screen`);
          
          console.log('🪑 [ADD_SEATS_START] Calling bulkCreateSeats API...');

          try {
            const seatsResult = await bulkCreateSeats(branchId, newScreenId, { seats: seatsData });
            
            console.log('🪑 [ADD_SEATS_RESPONSE] Raw API response:', seatsResult);
            
            if (seatsResult.success || seatsResult.seats) {
              console.log('✅ [ADD_SEATS_SUCCESS] Seats created successfully!');
              console.log('✅ [ADD_SEATS_SUCCESS] Result:', seatsResult);
              
              // Close loading alert before showing success
              closeSwal();
              
              console.log('🎉 [CREATION_COMPLETE] ===========================================');
              console.log('🎉 [CREATION_COMPLETE] Screen and seats created successfully');
              console.log('🎉 [CREATION_COMPLETE] - Screen ID:', newScreenId);
              console.log('🎉 [CREATION_COMPLETE] - Screen name:', screenToAdd.screenName);
              console.log('🎉 [CREATION_COMPLETE] - Seats count:', seatsData.length);
              
              // Show success only after both screen and seats are created
              showSuccess(
                'Screen Created Successfully!',
                `Screen "${screenToAdd.screenName}" has been created with ${seatsData.length} seats.`
              );
            } else {
              console.error('❌ [ADD_SEATS_FAILED] Seats creation failed');
              console.error('❌ [ADD_SEATS_FAILED] Response:', seatsResult);
              console.warn('🔄 [ROLLBACK_START] Rolling back screen creation...');
              
              // Rollback: Delete the created screen since seats failed
              try {
                await removeScreen(branchId, newScreenId);
                console.log('✅ [ROLLBACK_SUCCESS] Screen deleted successfully');
              } catch (rollbackError) {
                console.error('❌ [ROLLBACK_FAILED] Failed to rollback screen:', rollbackError);
              }
              
              // Close loading alert before showing error
              closeSwal();
              
              showError(
                'Screen Creation Failed',
                `Failed to create seats for the screen. Screen creation has been cancelled.`
              );
              
              console.log('🚫 [CREATION_FAILED] ===========================================');
              // Exit early to prevent form reset
              return;
            }
          } catch (seatError) {
            console.error('❌ [ADD_SEATS_ERROR] Exception during seat creation:', seatError);
            console.error('❌ [ADD_SEATS_ERROR] Error stack:', seatError.stack);
            console.warn('🔄 [ROLLBACK_START] Rolling back screen creation due to exception...');
            
            // Rollback: Delete the created screen since seats failed
            try {
              await removeScreen(branchId, newScreenId);
              console.log('✅ [ROLLBACK_SUCCESS] Screen deleted successfully');
            } catch (rollbackError) {
              console.error('❌ [ROLLBACK_FAILED] Failed to rollback screen:', rollbackError);
            }
            
            // Close loading alert before showing error
            closeSwal();
            
            showError(
              'Screen Creation Failed',
              `Failed to create seats for the screen. Screen creation has been cancelled.`
            );
            
            console.log('🚫 [CREATION_FAILED] ===========================================');
            // Exit early to prevent form reset
            return;
          }
        } else {
          console.error('❌ [ADD_SCREEN_ERROR] No screen ID returned from API');
          console.error('❌ [ADD_SCREEN_ERROR] Result object:', result);
          
          // Since no screen ID, likely the screen wasn't created properly
          // Try to find and delete any created screen by name
          console.warn('🔄 [CLEANUP_START] Attempting to cleanup potentially created screen...');
          
          // Close loading alert before showing error
          closeSwal();
          
          showError(
            'Screen Creation Failed',
            `Screen creation failed - no valid screen ID returned. Please try again.`
          );
          
          console.log('🚫 [CREATION_FAILED] ===========================================');
          // Exit early to prevent form reset  
          return;
        }

        console.log('🔄 [REFRESH_DATA] Refreshing screen list...');
        // Refresh screen data and reset form only if everything succeeded
        await fetchScreens();
        setIsAddingScreen(false);
        setNewScreenData({
          screenName: '',
          screenType: '2D',
          rows: '',
          columns: '',
          isActive: true
        });
        console.log('✅ [REFRESH_COMPLETE] Form reset and data refreshed');
      } else {
        console.error('❌ [ADD_SCREEN_FAILED] Screen creation failed');
        console.error('❌ [ADD_SCREEN_FAILED] Error:', result.error);
        
        // Close loading alert before showing error
        closeSwal();
        
        // Parse error message for user-friendly display
        let errorMessage = 'Failed to create screen. Please check your input and try again.';
        
        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
        }
        
        console.log('🚫 [CREATION_FAILED] ===========================================');
        
        // Show error notification
        showError('Cannot Create Screen', errorMessage);
      }

    } catch (error) {
      console.error('❌ [ADD_SCREEN_EXCEPTION] Unexpected error during screen creation:', error);
      console.error('❌ [ADD_SCREEN_EXCEPTION] Error stack:', error.stack);
      
      // Close loading alert before showing error
      closeSwal();
      
      console.log('🚫 [CREATION_FAILED] ===========================================');
      
      // Show generic error notification for unexpected errors
      showError(
        'Error Occurred',
        'An unexpected error occurred while creating the screen. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  }, [branchId, newScreenData, fetchScreens, validateScreenName, generateSeatsForScreen, createScreen, bulkCreateSeats, removeScreen]);

  // Status change handler
  const onStatusChange = useCallback(async (rowIndex, newIsHidden) => {
    if (!branchId) return;

    // Convert isHidden to isActive (isActive = !isHidden)
    const newIsActive = !newIsHidden;

    // Adjust index for existing screens when adding screen
    const adjustedRowIndex = isAddingScreen ? rowIndex - 1 : rowIndex;

    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const targetScreen = screensArray[adjustedRowIndex];
    
    if (!targetScreen) return;
    
    try {
      const screenId = targetScreen.id || targetScreen._id;
      
      // Set the specific screen being updated
      setUpdatingScreenId(screenId);
      setIsUpdating(true);
      
      const result = await updateScreen(branchId, screenId, { isActive: newIsActive });
      
      if (result.success) {
        // Only refresh data on successful update
        await fetchScreens();
        
        // Show success notification
        const statusText = newIsActive ? 'activated' : 'deactivated';
        showSuccess(
          'Screen Status Updated',
          `Screen "${targetScreen.screenName || targetScreen.name}" has been ${statusText} successfully.`
        );
      } else {
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
    const filteredScreens = filterScreens(screens || []);
    
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
      
      return row;
    });

    let allScreenRows = [...existingScreenRows];
    
    // Add new screen row if adding
    if (isAddingScreen) {
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
      allScreenRows = [newScreenRow, ...allScreenRows];
    }

    return allScreenRows;
  }, [screens, isAddingScreen, newScreenData, isUpdating, filterScreens, updatingScreenId]);

  // Get processed screen data
  const screenData = getProcessedScreenData();

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
