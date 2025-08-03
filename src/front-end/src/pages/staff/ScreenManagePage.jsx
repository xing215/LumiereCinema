import { useState } from 'react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import ConfirmationModal from '@components/display/Modal/Confirmation.jsx';
import EditSeatModal from '@components/display/Modal/EditSeatModal.jsx';
import ManageTable from '@components/UI/ManageTable.jsx';
import DeleteButton from '@components/buttons/Staff/DeleteButton.jsx';
import AddButton from '@components/buttons/Staff/AddButton.jsx';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton.jsx';
import CancelButton from '@components/buttons/Staff/CancelButton.jsx';
import SearchButton from '@components/buttons/Staff/SearchButton.jsx';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';
import { useEffect } from 'react'; 
import { useUser } from '@contexts/UserContext';
import { useGetBranchById } from '@hooks/useBranch';
import { useScreenManagement } from '@hooks/useScreenManagement'; 

const AddScreenButtons = ({ onConfirm, onCancel, isLoading = false }) => (
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
const ScreenManagePage = () => {
    const [showConfirmDeleteScreen, setShowConfirmDeleteScreen] = useState(false);
    const [editedScreenIndex, setEditedScreenIndex] = useState(null);

    const { user } = useUser();
    const { getBranchById, branch: userBranch, loading: branchLoading } = useGetBranchById();
    
    // Use the screen management hook
    const {
        screenData,
        header,
        screenColumnConfig,
        editableColumns,
        fieldTypes,
        screenTypeOptions,
        loading,
        tickedScreens,
        setTickedScreens,
        isAddingScreen,
        isUpdating,
        handleStartAddScreen,
        handleCancelAddScreen,
        handleConfirmAddScreen,
        handleDeleteConfirm,
        handleSearch,
        editingCell,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit,
        onStatusChange
    } = useScreenManagement();

    const handleDelete = async () => {
        await handleDeleteConfirm();
        setShowConfirmDeleteScreen(false);
    };

    const Button = () => {
        const handleAddScreenClick = () => {
            console.log('🖱️ [ScreenManagePage] Add Screen button clicked');
            console.log('🖱️ [ScreenManagePage] Current tickedScreens.size:', tickedScreens.size);
            console.log('🖱️ [ScreenManagePage] About to call handleStartAddScreen');
            handleStartAddScreen();
        };

        if (isAddingScreen) {
            return (
                <AddScreenButtons 
                    onConfirm={handleConfirmAddScreen}
                    onCancel={handleCancelAddScreen}
                    isLoading={isUpdating}
                />
            );
        } else if (tickedScreens.size > 0) {
            return (
                <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
                    <DeleteButton onClicked={() => setShowConfirmDeleteScreen(true)} />
                </div>
            );
        } else {
            return (
                <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
                    <AddButton text="Add Screen" onClick={handleAddScreenClick} />
                </div>
            );
        }
    };

    useEffect(() => {
        if (user && user.roles?.includes('branchmanager') && user.branch && !userBranch) {
            getBranchById(user.branch._id);
        }
    }, [user, getBranchById, userBranch]);

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton onSearch={handleSearch} />
                <Button />
                {showConfirmDeleteScreen && (
                    <ConfirmationModal 
                        item={tickedScreens.size} 
                        handleDelete={handleDelete} 
                        onClose={() => setShowConfirmDeleteScreen(false)} 
                    />
                )}
                <ManageTable 
                    data={screenData} 
                    anyTicked={tickedScreens} 
                    setTickedRows={setTickedScreens} 
                    onEditSeat={setEditedScreenIndex} 
                    header={header} 
                    columnConfig={screenColumnConfig}
                    editableFields={editableColumns}
                    editingCell={editingCell}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    fieldTypes={fieldTypes}
                    selectOptions={{ 2: screenTypeOptions }}
                    onStatusChange={onStatusChange}
                    isUpdating={isUpdating}
                    loading={loading}
                />
                {editedScreenIndex !== null && (
                    <EditSeatModal 
                        screenData={screenData[editedScreenIndex]} 
                        onClose={() => setEditedScreenIndex(null)} 
                    />
                )}
                <SelectBranchButton isLoading={branchLoading} branchName={userBranch?.name} />
            </MobileNotSupported>
            <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Screens</div>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default ScreenManagePage