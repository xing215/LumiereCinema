import { useState } from 'react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SearchButton from '@components/buttons/Staff/SearchButton.jsx';
import ManageTable from '@components/UI/ManageTable.jsx';
import EditAccountInformationModal from '@components/display/Modal/EditAccountInformationModal.jsx';
import DeleteButton from '@components/buttons/Staff/DeleteButton.jsx';
import AddButton from '@components/buttons/Staff/AddButton.jsx';
import { useAccountManagement } from '@hooks/useAccountManagement';

const AccountManagePage = () => {
    const {
        // Data
        accountRows,
        accountsLoading,
        accountsError,
        branches,
        branchesLoading,
        branchesError,
        
        // UI state
        tickedAccounts,
        setTickedAccounts,
        
        // Add account state
        isAddingAccount,
        newAccountData,
        setNewAccountData,
        
        // Edit account state
        isEditingAccount,
        editingAccountData,
        editAccountData,
        setEditAccountData,
        
        // Actions
        handleDeleteAccounts,
        handleSearch,
        
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
        
        // Loading state
        isLoading
    } = useAccountManagement();

    const handleAddAccountDataChange = (field, value) => {
        setNewAccountData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditAccountDataChange = (field, value) => {
        setEditAccountData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const Button = () => {
        return (
            <div className="font-unbounded absolute top-1/6 right-1/10 z-20 flex h-7 w-52 items-center justify-center rounded-xl hover:cursor-pointer">
                {tickedAccounts.size > 0 ? (
                    <DeleteButton onClicked={handleDeleteAccounts} />
                ) : (
                    <AddButton text="Add Account" onClick={handleOpenAddModal} />
                )}
            </div>
        )
    }

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton onSearch={handleSearch} />
                <Button/>
                
                {/* Add Account Modal */}
                {isAddingAccount && (
                    <EditAccountInformationModal 
                        onClose={handleCloseAddModal}
                        handleConfirm={handleConfirmAddAccount}
                        isEdit={false}
                        accountData={newAccountData}
                        onDataChange={handleAddAccountDataChange}
                        isLoading={isLoading}
                        branches={branches}
                    />
                )}
                
                {/* Edit Account Modal */}
                {isEditingAccount && (
                    <EditAccountInformationModal 
                        onClose={handleCloseEditModal}
                        handleConfirm={handleConfirmEditAccount}
                        isEdit={true}
                        accountData={editAccountData}
                        onDataChange={handleEditAccountDataChange}
                        isLoading={isLoading}
                        branches={branches}
                    />
                )}
                
                <ManageTable 
                    data={accountRows} 
                    anyTicked={tickedAccounts} 
                    setTickedRows={setTickedAccounts} 
                    onEdit={handleOpenEditModal} 
                    header={header} 
                    columnConfig={accountColumnConfig}
                />
                <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Accounts</div>
            </MobileNotSupported>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default AccountManagePage