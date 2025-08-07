import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@contexts/UserContext';
import { showError, showSuccess, showLoading, closeSwal } from '@utils/sweetalert';
import { 
  useGetPromotions, 
  useAddPromotion, 
  useUpdatePromotion, 
  useRemovePromotion 
} from '@hooks/useAdmin';

/**
 * Comprehensive hook for managing promotion operations in the admin panel
 * Handles CRUD operations for promotions
 */
export const usePromotionManagement = () => {
  const { user, token } = useUser();

  // Use admin hooks for promotion operations
  const { getPromotions, promotions: adminPromotions, loading: fetchLoading } = useGetPromotions();
  const { addPromotion, loading: createLoading } = useAddPromotion();
  const { updatePromotion, loading: updateLoading } = useUpdatePromotion();
  const { removePromotion, loading: removeLoading } = useRemovePromotion();

  // State management
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // UI state
  const [tickedPromotions, setTickedPromotions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingPromotionCode, setUpdatingPromotionCode] = useState(null);

  // New promotion state
  const [newPromotionData, setNewPromotionData] = useState({
    promotionCode: '',
    name: '',
    discountRate: '',
    maximumDiscount: '',
    appliedProduct: 'All',
    appliedLoyaltyRank: '',
    remainingUse: '',
    minimumSpend: 0,
    bannerImage: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Column configuration
  const editableColumns = isAddingPromotion ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const columnFieldMapping = {
    1: 'promotionCode',
    2: 'name',
    3: 'discountRate',
    4: 'maximumDiscount',
    5: 'appliedProduct',
    6: 'appliedLoyaltyRank',
    7: 'minimumSpend',
    8: 'remainingUse',
    9: 'bannerImage',
    10: 'startDate',
    11: 'endDate'
  };

  const header = ['', 'Code', 'Name', 'Rate (%)', 'Max Discount', 'Product', 'Loyalty', 'Min Spend', 'Remaining', 'Banner Image', 'Start Date', 'End Date', 'Active'];

  // Field types configuration
  const fieldTypes = {
    0: 'text',   // TickButton (not editable)
    1: 'text',   // Code
    2: 'text',   // Name
    3: 'number', // Discount Rate
    4: 'number', // Maximum Discount
    5: 'select', // Applied Product
    6: 'select', // Applied Loyalty Rank
    7: 'number', // Minimum Spend
    8: 'number', // Remaining Use
    9: 'text',   // Banner Image
    10: 'date',  // Start Date
    11: 'date',  // End Date
    12: 'text',  // Active (ActiveButton object)
  };

  // Select options
  const selectOptions = {
    5: ['All', 'Movie', 'Snack'], // Applied Product
    6: ['None', 'SILVER', 'GOLD', 'PLATINUM'] // Applied Loyalty Rank
  };


  const promotionColumnConfig = [
    { width: 'w-12', truncate: false },   // TickButton
    { width: 'w-36', truncate: true },   // Code 
    { width: 'w-36', truncate: true },    // Name 
    { width: 'w-20', truncate: false },   // Rate 
    { width: 'w-32', truncate: false },   // Max Discount 
    { width: 'w-28', truncate: false },   // Product 
    { width: 'w-28', truncate: false },   // Loyalty 
    { width: 'w-32', truncate: false },   // Min Spend 
    { width: 'w-24', truncate: false },   // Remaining 
    { width: 'w-40', truncate: true },    // Banner Image 
    { width: 'w-40', truncate: false },   // Start Date 
    { width: 'w-40', truncate: false },   // End Date 
    { width: 'w-24', truncate: false }    // Active 
  ];

  // Initialize promotions on mount
  useEffect(() => {
    if (user && user.roles?.includes('administrator')) {
      fetchPromotions();
    }
  }, [user]);

  // Update local promotions when adminPromotions changes
  useEffect(() => {
    if (adminPromotions) {
      setPromotions(Array.isArray(adminPromotions) ? adminPromotions : []);
    }
  }, [adminPromotions]);

  const fetchPromotions = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const result = await getPromotions();
      if (!result.success) {
        showError(result.error || 'Failed to fetch promotions');
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      showError('Error fetching promotions');
    } finally {
      setLoading(false);
    }
  }, [token, getPromotions]);

  // Search functionality
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const filterPromotions = useCallback((promotionsList) => {
    if (!searchTerm.trim()) return promotionsList;
    
    return promotionsList.filter(promotion =>
      promotion.promotionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.appliedProduct?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.appliedLoyaltyRank?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // New promotion field change handler
  const handleNewPromotionFieldChange = useCallback((columnIndex, value) => {
    const fieldName = columnFieldMapping[columnIndex];
    if (fieldName) {
      setNewPromotionData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  }, [columnFieldMapping]);

  // Date formatting helper functions
  const formatDateForDisplay = useCallback((dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  }, []);

  const formatDateForAPI = useCallback((dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toISOString();
  }, []);

  // Promotion code validation
  const validatePromotionCode = useCallback((promotionCode) => {
    if (!promotionCode || promotionCode.trim() === '') {
      showError('Promotion code is required');
      return false;
    }

    const existingPromotions = filterPromotions(promotions);
    const isDuplicate = existingPromotions.some(promotion => 
      promotion.promotionCode.toUpperCase() === promotionCode.toUpperCase()
    );

    if (isDuplicate) {
      showError('Promotion code already exists');
      return false;
    }

    return true;
  }, [promotions, filterPromotions]);


  // Validation helper functions
  const validatePromotionData = useCallback((data) => {
    if (!data.promotionCode || data.promotionCode.trim() === '') {
      showError('Promotion code is required');
      return false;
    }

    if (!data.name || data.name.trim() === '') {
      showError('Promotion name is required');
      return false;
    }

    // Improved discountRate validation
    if (!data.discountRate || data.discountRate === '' || data.discountRate === '0') {
      showError('Discount rate is required and must be greater than 0');
      return false;
    }

    const discountRateNum = Number(data.discountRate);
    if (isNaN(discountRateNum) || discountRateNum <= 0 || discountRateNum > 100) {
      showError('Discount rate must be a valid number between 1 and 100');
      return false;
    }

    if (data.minimumSpend < 0) {
      showError('Minimum spend cannot be negative');
      return false;
    }

    if (data.maximumDiscount && data.maximumDiscount < 0) {
      showError('Maximum discount cannot be negative');
      return false;
    }

    if (data.remainingUse && data.remainingUse < 0) {
      showError('Remaining use cannot be negative');
      return false;
    }

    if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
      showError('Start date cannot be after end date');
      return false;
    }

    return true;
  }, []);

  // Inline editing handlers
  const handleStartEdit = useCallback((rowIndex, columnIndex, currentValue) => {
    if (!editableColumns.includes(columnIndex) || isUpdating) return;
    
    setEditingCell({ rowIndex, columnIndex, value: currentValue });
  }, [editableColumns, isUpdating]);

  const handleSaveEdit = useCallback(async (rowIndex, columnIndex, newValue) => {
    if (isAddingPromotion) {
      handleNewPromotionFieldChange(columnIndex, newValue);
      setEditingCell(null);
      return;
    }

    const filteredPromotions = filterPromotions(promotions);
    const promotion = filteredPromotions[rowIndex];
    if (!promotion) return;

    const fieldName = columnFieldMapping[columnIndex];
    if (!fieldName) return;

    // Validation for specific fields
    if (fieldName === 'promotionCode' && !validatePromotionCode(newValue)) {
      setEditingCell(null);
      return;
    }

    if (fieldName === 'name') {
      if (!newValue || newValue.trim() === '') {
        showError('Promotion name is required');
        setEditingCell(null);
        return;
      }
    }

    

    if (fieldName === 'discountRate') {
      const discountRateNum = Number(newValue);
      if (!newValue || newValue === '' || isNaN(discountRateNum) || discountRateNum <= 0 || discountRateNum > 100) {
        showError('Discount rate must be a valid number between 1 and 100');
        setEditingCell(null);
        return;
      }
    }

    if ((fieldName === 'minimumSpend' || fieldName === 'maximumDiscount' || fieldName === 'remainingUse') && newValue < 0) {
      showError(`${fieldName} cannot be negative`);
      setEditingCell(null);
      return;
    }

    setIsUpdating(true);
    setUpdatingPromotionCode(promotion.promotionCode);

    try {
      const updateData = { [fieldName]: newValue };
      
      // Handle date fields
      if (fieldName === 'startDate' || fieldName === 'endDate') {
        updateData[fieldName] = formatDateForAPI(newValue);
      }

      const result = await updatePromotion(promotion.promotionCode, updateData);
      
      if (result.success) {
        showSuccess('Promotion updated successfully');
        await fetchPromotions();
      } else {
        showError(result.error || 'Failed to update promotion');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      showError('Error updating promotion');
    } finally {
      setIsUpdating(false);
      setUpdatingPromotionCode(null);
      setEditingCell(null);
    }
  }, [isAddingPromotion, promotions, columnFieldMapping, filterPromotions, token, validatePromotionCode, fetchPromotions, handleNewPromotionFieldChange, formatDateForAPI, updatePromotion]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  // New promotion management
  const handleStartAddPromotion = useCallback(() => {
    setIsAddingPromotion(true);
    setNewPromotionData({
      promotionCode: '',
      name: '',
      discountRate: '',
      maximumDiscount: '',
      appliedProduct: 'All',
      appliedLoyaltyRank: '',
      remainingUse: '',
      minimumSpend: 0,
      bannerImage: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setTickedPromotions(new Set());
  }, []);

  const handleCancelAddPromotion = useCallback(() => {
    setIsAddingPromotion(false);
    setNewPromotionData({
      promotionCode: '',
      name: '',
      discountRate: '',
      maximumDiscount: '',
      appliedProduct: 'All',
      appliedLoyaltyRank: '',
      remainingUse: '',
      minimumSpend: 0,
      bannerImage: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setEditingCell(null);
  }, []);

  const handleConfirmAddPromotion = useCallback(async () => {
    if (!validatePromotionData(newPromotionData)) {
      return;
    }

    if (!validatePromotionCode(newPromotionData.promotionCode)) {
      return;
    }

    try {
      // Set updating state first for UI loading effect
      setIsUpdating(true);
      
      // Show loading with animation
      showLoading('Creating promotion...', 'Setting up your new promotion in the system');

      const promotionData = {
        ...newPromotionData,
        promotionCode: newPromotionData.promotionCode.toUpperCase(),
        discountRate: Number(newPromotionData.discountRate),
        minimumSpend: Number(newPromotionData.minimumSpend),
        maximumDiscount: newPromotionData.maximumDiscount ? Number(newPromotionData.maximumDiscount) : null,
        remainingUse: newPromotionData.remainingUse ? Number(newPromotionData.remainingUse) : null,
        startDate: formatDateForAPI(newPromotionData.startDate),
        endDate: formatDateForAPI(newPromotionData.endDate),
        appliedLoyaltyRank: newPromotionData.appliedLoyaltyRank || null,
        bannerImage: newPromotionData.bannerImage || null
      };

      const result = await addPromotion(promotionData);
      
      if (result.success) {
        closeSwal(); // Close loading first
        setIsAddingPromotion(false);
        await fetchPromotions();
        
        // Show success notification with delay
        setTimeout(() => {
          showSuccess('Promotion created successfully');
        }, 300);
      } else {
        closeSwal();
        setTimeout(() => {
          showError(result.error || 'Failed to create promotion');
        }, 100);
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      closeSwal();
      setTimeout(() => {
        showError('Error creating promotion');
      }, 100);
    } finally {
      // Always reset updating state
      setIsUpdating(false);
    }
  }, [newPromotionData, validatePromotionData, validatePromotionCode, fetchPromotions, formatDateForAPI, addPromotion]);

  // Status change handler
  const onStatusChange = useCallback(async (rowIndex, newIsHidden) => {
    console.log('🔄 [onStatusChange] Called with rowIndex:', rowIndex, 'newIsHidden:', newIsHidden);
    
    // Convert newIsHidden to newIsActive (RowTemplate passes newIsHidden, but our API expects isActive)
    const newIsActive = !newIsHidden;
    
    // If we're adding a promotion and this is the first row, handle new promotion status
    if (isAddingPromotion && rowIndex === 0) {
      setNewPromotionData(prev => ({
        ...prev,
        isActive: newIsActive
      }));
      return;
    }

    // Adjust index for existing promotions when adding promotion
    const adjustedIndex = isAddingPromotion ? rowIndex - 1 : rowIndex;
    
    // Validate adjusted index
    if (adjustedIndex < 0) {
      console.error('❌ [onStatusChange] Invalid adjusted index:', adjustedIndex);
      return;
    }
    
    const filteredPromotions = filterPromotions(promotions);
    const promotion = filteredPromotions[adjustedIndex];
    
    console.log('🔄 [onStatusChange] promotion found:', promotion);
    console.log('🔄 [onStatusChange] newIsActive (converted):', newIsActive);
    
    if (!promotion) {
      console.error('❌ [onStatusChange] No promotion found at index:', adjustedIndex);
      return;
    }

    setIsUpdating(true);
    setUpdatingPromotionCode(promotion.promotionCode);

    try {
      console.log('📤 [onStatusChange] Updating promotion status:', promotion.promotionCode, { isActive: newIsActive });
      
      const result = await updatePromotion(
        promotion.promotionCode,
        { isActive: newIsActive }
      );
      
      if (result.success) {
        showSuccess(`Promotion ${newIsActive ? 'activated' : 'deactivated'} successfully`);
        await fetchPromotions();
        console.log('✅ [onStatusChange] Promotion status updated successfully');
      } else {
        showError(result.error || 'Failed to update promotion status');
      }
    } catch (error) {
      console.error('❌ [onStatusChange] Error updating promotion status:', error);
      showError('Error updating promotion status');
    } finally {
      setIsUpdating(false);
      setUpdatingPromotionCode(null);
    }
  }, [promotions, filterPromotions, fetchPromotions, updatePromotion, isAddingPromotion]);

  // Delete operations
  const handleDeleteConfirm = useCallback(async () => {
    if (isAddingPromotion) {
      setIsAddingPromotion(false);
      setTickedPromotions(new Set());
      return;
    }

    const filteredPromotions = filterPromotions(promotions);
    const promotionsToDelete = Array.from(tickedPromotions).map(index => {
      // No need to adjust index since we're not adding a promotion row in this case
      return filteredPromotions[index];
    }).filter(Boolean);

    if (promotionsToDelete.length === 0) return;

    showLoading('Deleting promotions...');

    try {
      const deletePromises = promotionsToDelete.map(promotion =>
        removePromotion(promotion.promotionCode)
      );

      const results = await Promise.all(deletePromises);
      const failures = results.filter(result => !result.success);

      closeSwal(); // Close loading first
      setTickedPromotions(new Set());
      await fetchPromotions();

      // Show result notification with delay
      setTimeout(() => {
        if (failures.length === 0) {
          showSuccess(`Successfully deleted ${promotionsToDelete.length} promotion(s)`);
        } else if (failures.length < promotionsToDelete.length) {
          showSuccess(`Successfully deleted ${promotionsToDelete.length - failures.length} promotion(s). ${failures.length} failed.`);
        } else {
          showError('Failed to delete promotions');
        }
      }, 300);

    } catch (error) {
      console.error('Error deleting promotions:', error);
      closeSwal();
      setTickedPromotions(new Set());
      setTimeout(() => {
        showError('Error deleting promotions');
      }, 100);
    }
  }, [tickedPromotions, promotions, isAddingPromotion, filterPromotions, fetchPromotions, removePromotion]);

  // Data processing
  const getProcessedPromotionData = useCallback(() => {
    let processedPromotions = filterPromotions(promotions);

    const promotionRows = processedPromotions.map((promotion, index) => {
      const isCurrentlyUpdating = isUpdating && updatingPromotionCode === promotion.promotionCode;
      
      return [
        'TickButton',
        promotion.promotionCode || '',
        promotion.name || '',
        promotion.discountRate || 0,
        promotion.maximumDiscount || '',
        promotion.appliedProduct || 'All',
        promotion.appliedLoyaltyRank || '',
        promotion.minimumSpend || 0,
        promotion.remainingUse || '',
        promotion.bannerImage || '',
        formatDateForDisplay(promotion.startDate) || '',
        formatDateForDisplay(promotion.endDate) || '',
        {
          type: 'ActiveButton',
          isHidden: !promotion.isActive,
          disabled: isCurrentlyUpdating,
          rowIndex: index,
          isUpdating: isCurrentlyUpdating
        }
      ];
    });

    if (isAddingPromotion) {
        const loadingIndicator = isUpdating ? '...' : '';
        const newRow = [
        { type: 'AddIndicator' }, // ✅ Thay đổi từ 'TickButton' thành AddIndicator
        newPromotionData.promotionCode + loadingIndicator,
        newPromotionData.name + loadingIndicator,
        (newPromotionData.discountRate || '') + loadingIndicator,
        (newPromotionData.maximumDiscount || '') + loadingIndicator,
        newPromotionData.appliedProduct + loadingIndicator,
        (newPromotionData.appliedLoyaltyRank || '') + loadingIndicator,
        (newPromotionData.minimumSpend || 0) + loadingIndicator,
        (newPromotionData.remainingUse || '') + loadingIndicator,
        (newPromotionData.bannerImage || '') + loadingIndicator,
        (newPromotionData.startDate || '') + loadingIndicator,
        (newPromotionData.endDate || '') + loadingIndicator,
        {
            type: 'ActiveButton',
            isHidden: !newPromotionData.isActive,
            disabled: true, // ✅ Disable cho new row
            rowIndex: 0,
            isUpdating: false
        }
        ];
        promotionRows.unshift(newRow);
    }

    return promotionRows;
    }, [promotions, isAddingPromotion, newPromotionData, isUpdating, filterPromotions, updatingPromotionCode, formatDateForDisplay]);


  // Get processed promotion data
  const promotionData = getProcessedPromotionData();

  // Function to get actual promotion object by row index
  const getPromotionByIndex = useCallback((rowIndex) => {
    if (isAddingPromotion && rowIndex === 0) {
      return null; // This is the new promotion row
    }
    
    const adjustedIndex = isAddingPromotion ? rowIndex - 1 : rowIndex;
    const filteredPromotions = filterPromotions(promotions);
    return filteredPromotions[adjustedIndex] || null;
  }, [promotions, isAddingPromotion, filterPromotions]);

  return {
    promotionData,
    header,
    promotionColumnConfig,
    editableColumns,
    fieldTypes,
    selectOptions,
    loading: loading || fetchLoading,
    createLoading,
    updateLoading,
    removeLoading,
    tickedPromotions,
    setTickedPromotions,
    isAddingPromotion,
    editingCell,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    isUpdating,
    handleStartAddPromotion,
    handleCancelAddPromotion,
    handleConfirmAddPromotion,
    handleDeleteConfirm,
    onStatusChange,
    handleSearch,
    fetchPromotions,
    getPromotionByIndex
  };
};
