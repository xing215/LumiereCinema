import { useState } from 'react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SearchButton from '@components/buttons/Staff/SearchButton.jsx';
import ConfirmationModal from '@components/display/Modal/Confirmation.jsx';
import ManageTable from '@components/UI/ManageTable.jsx';
import DeleteButton from '@components/buttons/Staff/DeleteButton.jsx';
import AddButton from '@components/buttons/Staff/AddButton.jsx';
import ConfirmButton from '@components/buttons/Staff/ConfirmButton.jsx';
import CancelButton from '@components/buttons/Staff/CancelButton.jsx';
import { usePromotionManagement } from '@hooks/usePromotionManagement';

const AddPromotionButtons = ({ onConfirm, onCancel, isLoading = false }) => (
    <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
        <ConfirmButton onClick={onConfirm} disabled={isLoading} />
        <CancelButton onClick={onCancel} disabled={isLoading} />
    </div>
);

const PromotionManagePage = () => {
    const [showConfirmDeletePromotion, setShowConfirmDeletePromotion] = useState(false);

    // Use the promotion management hook
    const {
        promotionData,
        header,
        promotionColumnConfig,
        editableColumns,
        fieldTypes,
        selectOptions,
        loading,
        tickedPromotions,
        setTickedPromotions,
        isAddingPromotion,
        isUpdating,
        handleStartAddPromotion,
        handleCancelAddPromotion,
        handleConfirmAddPromotion,
        handleDeleteConfirm,
        handleSearch,
        editingCell,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit,
        onStatusChange,
    } = usePromotionManagement();

    const handleDelete = async () => {
        await handleDeleteConfirm();
        setShowConfirmDeletePromotion(false);
    };

    const Button = () => {
        const handleAddPromotionClick = () => {
            handleStartAddPromotion();
        };

        if (isAddingPromotion) {
            return <AddPromotionButtons onConfirm={handleConfirmAddPromotion} onCancel={handleCancelAddPromotion} isLoading={isUpdating} />;
        } else if (tickedPromotions.size > 0) {
            return (
                <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
                    <DeleteButton onClicked={() => setShowConfirmDeletePromotion(true)} />
                </div>
            );
        } else {
            return (
                <div className="absolute right-1/12 z-10 flex items-end gap-4 lg:top-1/7 xl:top-[10vh]">
                    <AddButton text="Add Promotion" onClick={handleAddPromotionClick} />
                </div>
            );
        }
    };

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton onSearch={handleSearch} />
                <Button />
                {showConfirmDeletePromotion && <ConfirmationModal item={tickedPromotions.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeletePromotion(false)} />}
                <ManageTable
                    data={promotionData}
                    anyTicked={tickedPromotions}
                    setTickedRows={setTickedPromotions}
                    header={header}
                    columnConfig={promotionColumnConfig}
                    editableFields={editableColumns}
                    editingCell={editingCell}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    fieldTypes={fieldTypes}
                    selectOptions={selectOptions}
                    onStatusChange={onStatusChange}
                    isUpdating={isUpdating}
                    loading={loading}
                />
                <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Promotions</div>
            </MobileNotSupported>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default PromotionManagePage;
