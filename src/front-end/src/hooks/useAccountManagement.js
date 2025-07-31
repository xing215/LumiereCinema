import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@contexts/UserContext';
import { useGetAccounts, useAddAccount, useUpdateAccount, useRemoveAccount, useGetBranches } from '@hooks/useAdmin';
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
    closeSwal
} from '@utils/sweetalert';

/**
 * Comprehensive hook for managing account operations in the staff panel
 * Handles CRUD operations, validation, and UI state management
 */
export const useAccountManagement = () => {
    // User context
    const { user } = useUser();
    
    // Account data from database
    const { getAccounts, accounts, setAccounts, loading: accountsLoading, error: accountsError } = useGetAccounts();
    const { addAccount, loading: addLoading } = useAddAccount();
    const { updateAccount, loading: updateLoading } = useUpdateAccount();
    const { removeAccount, loading: deleteLoading } = useRemoveAccount();
    const { getBranches, branches, loading: branchesLoading, error: branchesError } = useGetBranches();

    // Data initialization state
    const [accountsFetched, setAccountsFetched] = useState(false);
    const [branchesFetched, setBranchesFetched] = useState(false);

    // UI state
    const [tickedAccounts, setTickedAccounts] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    
    // Add account state
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [newAccountData, setNewAccountData] = useState({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        gender: 'male',
        password: '',
        roles: ['customer'],
        branch: user?.branch?._id || ''
    });

    // Edit account state
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [editingAccountData, setEditingAccountData] = useState(null);
    const [editAccountData, setEditAccountData] = useState({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        gender: 'male',
        roles: ['customer'],
        branch: ''
    });

    // Refresh branches data
    const refreshBranches = useCallback(async () => {
        setBranchesFetched(false);
        console.log('🌲 Fetching branches...');
        const result = await getBranches();
        console.log('🌲 Branches result:', result);
        setBranchesFetched(true);
    }, [getBranches]);

    // Refresh accounts data
    const refreshAccounts = useCallback(async () => {
        setAccountsFetched(false);
        const result = await getAccounts();
        setAccountsFetched(true);
    }, [getAccounts]);

    // Column configuration
    const header = ['TickButton', 'Name', 'Email', 'Phone', 'Birthday', 'Gender', 'Branch', 'Roles', 'Loyalty', 'EditButton'];
    
    const accountColumnConfig = [
        { width: 'w-12', truncate: false }, // TickButton
        { width: 'w-40', truncate: true },  // Name
        { width: 'w-50', truncate: true },  // Email
        { width: 'w-40', truncate: true }, // Phone
        { width: 'w-40', truncate: true }, // Birthday
        { width: 'w-30', truncate: false }, // Gender
        { width: 'w-50', truncate: true },  // Branch
        { width: 'w-50', truncate: true },  // Roles
        { width: 'w-30', truncate: true}, // Loyalty
        { width: 'w-12', truncate: false }  // EditButton
    ];

    // Initialize accounts and branches on component mount
    useEffect(() => {
        if (!accountsFetched && !accountsLoading) {
            refreshAccounts();
        }
    }, [accountsFetched, accountsLoading, refreshAccounts]);

    useEffect(() => {
        if (!branchesFetched && !branchesLoading) {
            refreshBranches();
        }
    }, [branchesFetched, branchesLoading, refreshBranches]);

    // Transform accounts data for table display
    const accountRows = (accounts || []).map((account, index) => {
        // Format birthday
        const formatBirthday = (birthday) => {
            if (!birthday) return '';
            try {
                return new Date(birthday).toLocaleDateString('vi-VN');
            } catch {
                return '';
            }
        };

        // Format branch name
        const formatBranch = (branch) => {
            if (!branch) return 'No Branch';
            if (typeof branch === 'object' && branch.name) {
                return branch.name;
            }
            if (typeof branch === 'string') {
                return branch;
            }
            return 'No Branch';
        };

        // Role display mapping for UI
        const roleDisplayMap = {
            customer: 'Customer',
            cashier: 'Cashier',
            checkincounter: 'Check-in Counter',
            branchmanager: 'Branch Manager',
            administrator: 'Administrator'
        };
        const getRoleDisplay = (role) => roleDisplayMap[role] || role;

        // Format roles for display in table
        const formatRoles = (roles) => {
            if (!roles || !Array.isArray(roles)) return 'Customer';
            return roles.map(getRoleDisplay).join(', ');
        };

        // Format loyalty rank (only show rank, not points)
        const formatLoyalty = (loyaltyRank) => {
            if (!loyaltyRank || !loyaltyRank.rank) return 'Silver';
            const rank = loyaltyRank.rank;
            return rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
        };

        // Format gender with capitalized first letter
        const formatGender = (gender) => {
            if (!gender) return 'Male';
            return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        };

        return [
            'TickButton',
            account.name || '',
            account.email || '',
            account.phone || '',
            formatBirthday(account.birthday),
            formatGender(account.gender),
            formatBranch(account.branch),
            formatRoles(account.roles),
            formatLoyalty(account.loyaltyRank),
            'EditButton'
        ];
    });

    // Filter accounts based on search term
    const filteredAccountRows = accountRows.filter(row => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return row.some(cell => 
            typeof cell === 'string' && 
            cell !== 'TickButton' && 
            cell !== 'EditButton' &&
            cell.toLowerCase().includes(searchLower)
        );
    });

    // Handle adding new account
    const handleAddAccount = async () => {
        try {
            showAddingItems();

            const accountData = {
                ...newAccountData,
                branch: newAccountData.branch || user?.branch?._id
            };

            const result = await addAccount(accountData);
            
            if (result.success) {
                showItemsAdded();
                setNewAccountData({
                    name: '',
                    email: '',
                    phone: '',
                    birthday: '',
                    gender: 'male',
                    password: '',
                    roles: ['customer'],
                    branch: user?.branch?._id || ''
                });
                setIsAddingAccount(false);
                await refreshAccounts();
            } else {
                showOperationError('Failed to add account', result.error);
            }
        } catch (error) {
            console.error('Error adding account:', error);
            showOperationError('Failed to add account', error.message);
        }
    };

    // Handle opening Add Account modal
    const handleOpenAddModal = () => {
        setNewAccountData({
            name: '',
            email: '',
            phone: '',
            birthday: '',
            gender: 'male',
            password: '',
            roles: ['customer'],
            branch: user?.branch?._id || ''
        });
        setIsAddingAccount(true);
    };

    // Handle closing Add Account modal
    const handleCloseAddModal = () => {
        setIsAddingAccount(false);
        setNewAccountData({
            name: '',
            email: '',
            phone: '',
            birthday: '',
            gender: 'male',
            password: '',
            roles: ['customer'],
            branch: user?.branch?._id || ''
        });
    };

    // Handle confirming Add Account from modal
    const handleConfirmAddAccount = async (roles) => {
        try {
            const validationErrors = validateAccountData(newAccountData);
            if (validationErrors.length > 0) {
                showError('Validation Error', validationErrors[0]);
                return;
            }

            const rolesArray = Array.from(roles).map(roleIndex => {
                switch(roleIndex) {
                    case 1: return 'customer';
                    case 2: return 'cashier';
                    case 3: return 'checkincounter';
                    case 4: return 'branchmanager';
                    case 5: return 'administrator';
                    default: return 'customer';
                }
            });

            const accountData = {
                ...newAccountData,
                roles: rolesArray,
                // If customer role only, set branch to null; otherwise use selected branch
                branch: rolesArray.includes('customer') && rolesArray.length === 1 ? null : newAccountData.branch
            };

            showAddingItems();
            const result = await addAccount(accountData);
            
            if (result.success) {
                showItemsAdded();
                handleCloseAddModal();
                await refreshAccounts();
            } else {
                showOperationError('Failed to add account', result.error);
            }
        } catch (error) {
            console.error('Error adding account:', error);
            showOperationError('Failed to add account', error.message);
        }
    };

    // Handle opening Edit Account modal
    const handleOpenEditModal = (accountIndex) => {
        const filteredAccounts = filterAccountsForRows();
        const account = filteredAccounts[accountIndex];
        
        if (account) {
            setEditingAccountData(account);
            // Format birthday for date input (YYYY-MM-DD)
            const birthdayFormatted = account.birthday 
                ? new Date(account.birthday).toISOString().split('T')[0] 
                : '';
                
            setEditAccountData({
                name: account.name || '',
                email: account.email || '',
                phone: account.phone || '',
                birthday: birthdayFormatted,
                gender: account.gender || 'male',
                roles: account.roles || ['customer'],
                branch: account.branch?._id || account.branch || ''
            });
            setIsEditingAccount(true);
        }
    };

    // Handle closing Edit Account modal
    const handleCloseEditModal = () => {
        setIsEditingAccount(false);
        setEditingAccountData(null);
        setEditAccountData({
            name: '',
            email: '',
            phone: '',
            birthday: '',
            gender: 'male',
            roles: ['customer'],
            branch: ''
        });
    };

    // Handle confirming Edit Account from modal
    const handleConfirmEditAccount = async (roles) => {
        try {
            if (!editingAccountData) return;

            const validationErrors = validateAccountData(editAccountData);
            if (validationErrors.length > 0) {
                showError('Validation Error', validationErrors[0]);
                return;
            }

            const rolesArray = Array.from(roles).map(roleIndex => {
                switch(roleIndex) {
                    case 1: return 'customer';
                    case 2: return 'cashier';
                    case 3: return 'checkincounter';
                    case 4: return 'branchmanager';
                    case 5: return 'administrator';
                    default: return 'customer';
                }
            });

            const updateData = {
                ...editAccountData,
                roles: rolesArray,
                // If customer role only, set branch to null; otherwise use selected branch
                branch: rolesArray.includes('customer') && rolesArray.length === 1 ? null : editAccountData.branch
            };

            showLoading('Updating account...');
            const result = await updateAccount(editingAccountData._id || editingAccountData.id, updateData);
            
            if (result.success) {
                showSuccess('Account updated successfully!');
                handleCloseEditModal();
                await refreshAccounts();
            } else {
                showOperationError('Failed to update account', result.error);
            }
        } catch (error) {
            console.error('Error updating account:', error);
            showOperationError('Failed to update account', error.message);
        }
    };

    // Helper function to filter accounts (same logic as accountRows)
    const filterAccountsForRows = () => {
        return (accounts || []);
    };

    // Handle deleting selected accounts
    const handleDeleteAccounts = async () => {
        if (tickedAccounts.size === 0) return;

        try {
            const result = await showDeleteItemsConfirmation(tickedAccounts.size, 'account');
            if (!result.isConfirmed) return;

            showDeletingItems();

            const accountsToDelete = Array.from(tickedAccounts).map(index => (accounts || [])[index]).filter(Boolean);
            const deletePromises = accountsToDelete.map(account => 
                removeAccount(account._id || account.id)
            );

            const results = await Promise.all(deletePromises);
            const failedDeletes = results.filter(result => !result.success);

            if (failedDeletes.length === 0) {
                showItemsDeleted();
                setTickedAccounts(new Set());
                await refreshAccounts();
            } else {
                showOperationError('Some accounts could not be deleted', 
                    `${failedDeletes.length} out of ${accountsToDelete.length} deletions failed`);
            }
        } catch (error) {
            console.error('Error deleting accounts:', error);
            showOperationError('Failed to delete accounts', error.message);
        }
    };

    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // Validation functions
    const validateAccountData = (data) => {
        const errors = [];
        
        if (!data.name?.trim()) {
            errors.push('Name is required');
        }
        
        if (!data.email?.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }
        
        if (!data.phone?.trim()) {
            errors.push('Phone number is required');
        }

        if (!data.password?.trim() && isAddingAccount) {
            errors.push('Password is required for new accounts');
        }

        if (data.birthday && !Date.parse(data.birthday)) {
            errors.push('Invalid birthday format');
        }

        if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
            errors.push('Invalid gender value');
        }
        
        return errors;
    };

    // Check if account data is valid
    const isNewAccountValid = () => {
        return validateAccountData(newAccountData).length === 0;
    };

    return {
        // Data
        accounts,
        accountRows: filteredAccountRows,
        accountsLoading,
        accountsError,
        accountsFetched,
        branches,
        branchesLoading,
        branchesError,
        
        // UI state
        tickedAccounts,
        setTickedAccounts,
        searchTerm,
        
        // Add account state
        isAddingAccount,
        setIsAddingAccount,
        newAccountData,
        setNewAccountData,
        
        // Edit account state
        isEditingAccount,
        setIsEditingAccount,
        editingAccountData,
        editAccountData,
        setEditAccountData,
        
        // Actions
        handleAddAccount,
        handleDeleteAccounts,
        handleSearch,
        refreshAccounts,
        
        // Modal actions
        handleOpenAddModal,
        handleCloseAddModal,
        handleConfirmAddAccount,
        handleOpenEditModal,
        handleCloseEditModal,
        handleConfirmEditAccount,
        
        // Configuration
        header,
        accountColumnConfig,
        
        // Validation
        validateAccountData,
        isNewAccountValid,
        
        // Loading states
        isLoading: accountsLoading || addLoading || updateLoading || deleteLoading || branchesLoading
    };
};
