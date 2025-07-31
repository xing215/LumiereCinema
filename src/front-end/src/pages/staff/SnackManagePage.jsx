import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import ManageTable from '@components/UI/ManageTable.jsx';
import DeleteButton from '@components/buttons/Staff/DeleteButton.jsx';
import AddButton from '@components/buttons/Staff/AddButton.jsx';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton.jsx';
import CancelButton from '@components/buttons/Staff/CancelButton.jsx';
import SearchButton from '@components/buttons/Staff/SearchButton.jsx';
import BranchButton from '@components/buttons/Staff/SelectBranch.jsx';
import { useUser } from '@contexts/UserContext';
import { useSnackManagement } from '@hooks/useSnackManagement'; 

const AddSnackButtons = ({ onConfirm, onCancel, isLoading = false }) => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
        <ConfirmButton 
            onClick={onConfirm}
            disabled={isLoading}
        />
        <CancelButton 
            onClick={onCancel}
            disabled={isLoading}
        />
    </div>
);

const SnackManagePage = () => {
    const { user } = useUser();
    
    const {
        // Data
        snackData,
        header,
        snackColumnConfig,
        editableColumns,
        fieldTypes,
        
        // State
        loading,
        error,
        tickedSnacks,
        setTickedSnacks,
        isAddingSnack,
        updateLoading,
        deleteLoading,
        
        // Branch info
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
        handleSearch
    } = useSnackManagement();

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton 
                    onSearch={handleSearch}
                    placeholder="Search snacks by name..."
                />
                
                {isAddingSnack ? (
                    <AddSnackButtons 
                        onConfirm={handleConfirmAddSnack}
                        onCancel={handleCancelAddSnack}
                        isLoading={updateLoading}
                    />
                ) : tickedSnacks.size > 0 ? (
                    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
                        <DeleteButton 
                            onClicked={handleDeleteClick} 
                            disabled={deleteLoading}
                        />
                    </div>
                ) : (
                    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
                        <AddButton 
                            text="Add Snack" 
                            onClick={handleStartAddSnack}
                            disabled={loading || updateLoading}
                        />
                    </div>
                )}
                
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-['Unbounded'] text-black">Loading snacks...</div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-['Unbounded'] text-red-600">
                            Error: {error}
                        </div>
                    </div>
                ) : (
                    <ManageTable 
                        data={snackData} 
                        anyTicked={tickedSnacks} 
                        setTickedRows={setTickedSnacks} 
                        header={header} 
                        columnConfig={snackColumnConfig}
                        fieldTypes={fieldTypes}
                        editableFields={editableColumns}
                        editingCell={editingCell}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        isUpdating={updateLoading || isUpdating}
                        onStatusChange={onStatusChange}
                    />
                )}
                
                {/* Branch selector */}
                {user?.roles?.includes('branchmanager') && user?.branch && (
                    <BranchButton 
                        isLoading={branchLoading && !userBranch && !user?.branch?.name} 
                        branchName={userBranch?.name || user?.branch?.name || 'Unknown Branch'} 
                    />
                )}
            </MobileNotSupported>
            
            <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Snacks</div>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default SnackManagePage;