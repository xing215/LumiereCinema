import { useState } from 'react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import ConfirmationModal from '@components/display/Modal/Confirmation.jsx';
import ManageTable from '@components/UI/ManageTable.jsx';
import DeleteButton from '@components/buttons/Staff/DeleteButton.jsx';
import AddButton from '@components/buttons/Staff/AddButton.jsx';
import SearchButton from '@components/buttons/Staff/SearchButton.jsx';
import SelectBranchButton from '@components/buttons/Staff/SelectBranch.jsx';

const SnackManagePage = () => {
    const [tickedSnacks, setTickedSnacks] = useState(new Set());
    const [SnackRows, setSnackRows] = useState(Array.from({ length: 10 }, () => ['TickButton', 'PCN', 'Combo 2 bắp rang bơ và 2 pepsi', 500000, 40000, 'https://www.figma.com/design/ghEUQQJPtkbKDdtraeZDHo/Final-prototype?node-id=883-7172&m=dev', 50, 'ActiveButton']));
    const [showConfirmDeleteSnack, setShowConfirmDeleteSnack] = useState(false);

    const handleDelete = () => {
        setSnackRows((prev) => prev.filter((_, index) => !tickedSnacks.has(index)));
        setTickedSnacks(new Set());
        setShowConfirmDeleteSnack(false);
    };

    const header = ['TickButton', 'ID', 'Name', 'Price', 'DPrice', 'Image', 'Stock', 'ActiveButton'];
    const Button = () => {
        return (
            <div className="font-unbounded absolute top-1/6 right-1/10 z-20 flex h-7 w-52 items-center justify-center rounded-xl hover:cursor-pointer">
                {tickedSnacks.size > 0 ? <DeleteButton onClicked={() => setShowConfirmDeleteSnack(true)}/> : <AddButton text="Add Snack"/>}
            </div>
        )
    }
    const SnackColumnConfig = [
        { width: 'w-15', truncate: false },
        { width: 'w-15', truncate: false },
        { width: 'w-60', truncate: true },
        { width: 'w-20', truncate: false },
        { width: 'w-20', truncate: false },
        { width: 'w-60', truncate: true},
        { width: 'w-15', truncate: false },
        { width: 'w-15', truncate: false }
    ]
    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                <Button/>
                {showConfirmDeleteSnack && <ConfirmationModal item={tickedSnacks.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeleteSnack(false)} />}
                <ManageTable data={SnackRows} anyTicked={tickedSnacks} setTickedRows={setTickedSnacks} header={header} columnConfig={SnackColumnConfig}/>
                <SelectBranchButton />
            </MobileNotSupported>
            <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Snacks</div>
            <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
            <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
            <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
        </StaffLayout>
    );
};

export default SnackManagePage