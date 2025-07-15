import { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
import SearchButton from '../../components/buttons/Staff/SearchButton.jsx';
import ConfirmationModal from '../../components/display/Modal/Confirmation.jsx';
import ManageTable from '../../components/UI/ManageTable.jsx';
import DeleteButton from '../../components/buttons/Staff/DeleteButton.jsx';
import AddButton from '../../components/buttons/Staff/AddButton.jsx';

const BranchManagePage = () => {
    const [tickedBranches, setTickedBranches] = useState(new Set());
    const [branchRows, setBranchRows] = useState(Array.from({ length: 10 }, () => ['TickButton', '1', 'Cao Thắng', '123 Nguyễn Văn Cừ, Phường Chợ Quán', 'ActiveButton']));
    const [showConfirmDeleteBranch, setShowConfirmDeleteBranch] = useState(false);

    const handleDelete = () => {
        setBranchRows((prev) => prev.filter((_, index) => !tickedBranches.has(index)));
        setTickedBranches(new Set());
        setShowConfirmDeleteBranch(false);
    };

    const header = ['TickButton', 'ID', 'Name', 'Address', 'ActiveButton'];

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                {tickedBranches.size > 0 ? <DeleteButton onClicked={() => setShowConfirmDeleteBranch(true)} /> : <AddButton />}
                {showConfirmDeleteBranch && <ConfirmationModal item={tickedBranches.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeleteBranch(false)} />}
                <ManageTable data={branchRows} anyTicked={tickedBranches} setTickedRows={setTickedBranches} header={header} />
            </MobileNotSupported>
            <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Branches</div>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default BranchManagePage;
