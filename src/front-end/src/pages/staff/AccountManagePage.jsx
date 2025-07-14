import { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
import SearchButton from '../../components/buttons/Staff/SearchButton.jsx';
import ConfirmationModal from '../../components/display/Modal/Confirmation.jsx';
import ManageTable from '../../components/UI/ManageTable.jsx';
import EditAccountInformationModal from '../../components/display/Modal/EditAccountInformationModal.jsx';
import DeleteButton from '../../components/buttons/Staff/DeleteButton.jsx';
import AddButton from '../../components/buttons/Staff/AddButton.jsx';

const AccountManagePage = () => {
    const [tickedAccounts, setTickedAccounts] = useState(new Set());
    const [accountRows, setAccountRows] = useState(Array.from({ length: 10 }, () => ['TickButton', '001', 'Nguyễn Thiên Nhã Ra', 'TinaLe', '091666666', 'Edit']));
    const [showConfirmDeleteAccount, setShowConfirmDeleteAccount] = useState(false);
    const [editedAccountIndex, setEditedAccountIndex] = useState(null);

    const handleDelete = () => {
        setAccountRows((prev) => prev.filter((_, index) => !tickedAccounts.has(index)));
        setTickedAccounts(new Set());
        setShowConfirmDeleteAccount(false);
    };

    const header = ['TickButton', 'ID', 'Name', 'Email', 'Phone', 'Edit'];

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                {tickedAccounts.size > 0 ? <DeleteButton onClicked={() => setShowConfirmDeleteAccount(true)} /> : <AddButton />}
                {showConfirmDeleteAccount && <ConfirmationModal item={tickedAccounts.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeleteAccount(false)} />}
                {editedAccountIndex !== null && <EditAccountInformationModal onClose={() => setEditedAccountIndex(null)} handleConfirm={() => setEditedAccountIndex(null)} />}
                <ManageTable data={accountRows} anyTicked={tickedAccounts} setTickedRows={setTickedAccounts} onEdit={setEditedAccountIndex} header={header} />
                <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Accounts</div>
                <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
                <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
            </MobileNotSupported>
        </StaffLayout>
    );
};

export default AccountManagePage;
