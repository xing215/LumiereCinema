import { useState } from 'react';
import StaffLayout from '@layouts/StaffLayout.jsx';
import MobileNotSupported from '@components/display/MobileNotSupported.jsx';
import SearchButton from '@components/buttons/Staff/SearchButton.jsx';
import ConfirmationModal from '@components/display/Modal/Confirmation.jsx';
import ManageTable from '@components/UI/ManageTable.jsx';
import DeleteButton from '@components/buttons/Staff/DeleteButton.jsx';
import AddButton from '@components/buttons/Staff/AddButton.jsx';

const PromotionManagePage = () => {
    const [tickedPromotions, setTickedPromotions] = useState(new Set());
    const [promotionRows, setPromotionRows] = useState(Array.from({ length: 10 }, () => ['TickButton', 'MHVV', 'Mùa hè vui vẻ', '15', '50000', 'Snack, Drink, Ticket', 'None', '5000', '12', '100', 'ActiveButton']));
    const [showConfirmDeletePromotion, setShowConfirmDeletePromotion] = useState(false);

    const handleDelete = () => {
        setPromotionRows((prev) => prev.filter((_, index) => !tickedPromotions.has(index)));
        setTickedPromotions(new Set());
        setShowConfirmDeletePromotion(false);
    };

    const header = ['TickButton', 'Code', 'Name', 'Rate', 'Amount', 'Product', 'Royalty', 'Minimum', 'Remainder', 'Usage', 'ActiveButton'];
    const Button = () => {
        return (
            <div className="font-unbounded absolute top-1/6 right-1/10 z-20 flex h-7 w-52 items-center justify-center rounded-xl hover:cursor-pointer">
                {tickedPromotions.size > 0 ? <DeleteButton onClicked={() => setShowConfirmDeletePromotion(true)}/> : <AddButton text="Add Promotion"/>}
            </div>
        )
    }
    const promotionColumnConfig = [
        { width: 'w-12', truncate: false },
        { width: 'w-20', truncate: false },
        { width: 'w-40', truncate: true },
        { width: 'w-12', truncate: false },
        { width: 'w-20', truncate: false },
        { width: 'w-30', truncate: true },
        { width: 'w-20', truncate: false },
        { width: 'w-20', truncate: false },
        { width: 'w-20', truncate: false },
        { width: 'w-15', truncate: false },
        { width: 'w-12', truncate: false },
    ];

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                <Button/>
                {showConfirmDeletePromotion && <ConfirmationModal item={tickedPromotions.size} handleDelete={handleDelete} onClose={() => setShowConfirmDeletePromotion(false)} />}
                <ManageTable data={promotionRows} anyTicked={tickedPromotions} setTickedRows={setTickedPromotions} header={header} columnConfig={promotionColumnConfig}/>
                <div className="font-unbounded absolute top-5 left-1/6 z-10 text-5xl font-bold text-black">Promotions</div>
                <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
                <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
            </MobileNotSupported>
        </StaffLayout>
    );
};

export default PromotionManagePage