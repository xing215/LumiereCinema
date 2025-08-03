import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@contexts/UserContext';
import { 
  useGetScreens, 
  useCreateScreen,
  useUpdateScreen, 
  useRemoveScreen,
  useGetScreenSeats 
} from '@hooks/useBranch';

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
    
    // Handle existing screen changes
    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const screen = screensArray[rowIndex];
    const fieldName = columnFieldMapping[columnIndex];
    
    if (screen && fieldName && branchId) {
      const screenId = screen.id || screen._id;
      
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
        } else {
          console.error('Failed to update screen:', result.error);
        }
      } catch (error) {
        console.error('Failed to save edit:', error);
      } finally {
        setIsUpdating(false);
        setEditingCell(null);
      }
    }
  }, [isAddingScreen, screens, columnFieldMapping, filterScreens, updateScreen, branchId, fetchScreens]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  // New screen management
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

      const screenToAdd = {
        screenName: newScreenData.screenName.trim(),
        screenType: newScreenData.screenType,
        size: {
          rows: parseInt(newScreenData.rows),
          columns: parseInt(newScreenData.columns)
        },
        isActive: newScreenData.isActive
      };

      // Note: Using createScreen hook
      const result = await createScreen(branchId, screenToAdd);
      
      if (result.success) {
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
      }

    } catch (error) {
      console.error('Failed to add screen:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [branchId, newScreenData, fetchScreens]);

  // Status change handler
  const onStatusChange = useCallback(async (rowIndex, newIsActive) => {
    if (!branchId) return;

    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const targetScreen = screensArray[rowIndex];
    if (!targetScreen) return;
    
    try {
      setIsUpdating(true);
      const screenId = targetScreen.id || targetScreen._id;
      
      const result = await updateScreen(branchId, screenId, { isActive: newIsActive });
      
      if (result.success) {
        await fetchScreens();
      } else {
        console.error('Failed to update screen status:', result.error);
      }
    } catch (error) {
      console.error('Failed to update screen status:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [branchId, screens, filterScreens, updateScreen, fetchScreens]);

  // Delete operations
  const handleDeleteConfirm = useCallback(async () => {
    if (!branchId) return;

    const filteredScreens = filterScreens(screens || []);
    const screensArray = Array.isArray(filteredScreens) ? filteredScreens : [];
    const selectedIndices = Array.from(tickedScreens);
    
    try {
      for (const index of selectedIndices) {
        const screen = screensArray[index];
        if (screen) {
          const screenId = screen.id || screen._id;
          await removeScreen(branchId, screenId);
        }
      }
      
      await fetchScreens();
      setTickedScreens(new Set());
    } catch (error) {
      console.error('Failed to delete screens:', error);
    }
  }, [tickedScreens, branchId, screens, filterScreens, removeScreen, fetchScreens]);

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
          isActive: screen.isActive !== false,
          rowIndex: index + (isAddingScreen ? 1 : 0),
          isUpdating: isUpdating
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
      const newScreenRow = [
        { type: 'AddIndicator' },
        newScreenData.screenName,
        newScreenData.screenType,
        newScreenData.rows,
        newScreenData.columns,
        { 
          type: 'ActiveButton', 
          isActive: newScreenData.isActive,
          rowIndex: 0,
          isUpdating: false,
          disabled: true
        }, 
        { type: 'AddLabel', text: 'NEW' }
      ];
      allScreenRows = [newScreenRow, ...allScreenRows];
    }

    console.log('🎯 [getProcessedScreenData] Final processed data:', allScreenRows);
    console.log('📊 [getProcessedScreenData] Total rows:', allScreenRows.length);
    
    return allScreenRows;
  }, [screens, isAddingScreen, newScreenData, isUpdating, filterScreens]);

  // Debug hook return data
  const screenData = getProcessedScreenData();
  console.log('🚀 [useScreenManagement] Hook returning data:');
  console.log('📊 [useScreenManagement] screenData:', screenData);
  console.log('📈 [useScreenManagement] screenData length:', screenData.length);
  console.log('⏳ [useScreenManagement] loading:', loading);
  console.log('🎯 [useScreenManagement] isAddingScreen:', isAddingScreen);

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
