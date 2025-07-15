import { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
import ConfirmationModal from '../../components/display/Modal/Confirmation.jsx';
import EditSeatModal from '../../components/display/Modal/EditSeatModal.jsx';
import ManageTable from '../../components/UI/ManageTable.jsx';
import DeleteButton from '../../components/buttons/Staff/DeleteButton.jsx';
import AddButton from '../../components/buttons/Staff/AddButton.jsx';
import SearchButton from '../../components/buttons/Staff/SearchButton.jsx';
import SelectBranchButton from '../../components/buttons/Staff/SelectBranch.jsx';

const ScreenManagePage = () => {
    const [tickedScreens, setTickedScreens] = useState(new Set());
    const [screenRows, setScreenRows] = useState(Array.from({ length: 10 }, () => ['TickButton', 1, 1, 10, 20, 'ActiveButton', 'EditSeatButton']));
    const [showConfirmDeleteScreen, setShowConfirmDeleteScreen] = useState(false);
    const [editedScreenIndex, setEditedScreenIndex] = useState(null);

    const handleDelete = () => {
        setScreenRows((prev) => prev.filter((_, index) => !tickedScreens.has(index)));
        setTickedScreens(new Set());
        setShowConfirmDeleteScreen(false);
    };

    const header = ['TickButton', 'ID', 'Name', 'Row', 'Column', 'ActiveButton', 'EditSeatButton'];

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                {tickedScreens.size > 0 ? <DeleteButton onClicked={() => setShowConfirmDeleteScreen(true)} /> : <AddButton />}
                {showConfirmDeleteScreen && <ConfirmationModal item={tickedScreens.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeleteScreen(false)} />}
                <ManageTable data={screenRows} anyTicked={tickedScreens} setTickedRows={setTickedScreens} onEditSeat={setEditedScreenIndex} header={header} />
                {editedScreenIndex !== null && <EditSeatModal screenData={screenRows[editedScreenIndex]} onClose={() => setEditedScreenIndex(null)} />}
                <SelectBranchButton />
            </MobileNotSupported>
            <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Screens</div>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default ScreenManagePage;
