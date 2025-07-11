import { Square, SquareCheckBig } from 'lucide-react';
import { useState } from 'react';
import SelectBranchButton from '../../components/buttons/staffSelectBranch.jsx';
import StaffLayout from "../../layouts/StaffLayout.jsx";
import MobileNotSupported from "../../components/display/MobileNotSupported.jsx";

const SearchButton = () => {
    return (
        <div className="absolute top-1/20 right-1/15 flex gap-2">
            <p className="font-unbounded text-base font-normal">Search: </p>
            <div className="h-6 w-60 rounded-lg bg-white" />
        </div>
    );
};

const TickButton = (props) => {
    return (
        <button onClick={props.onTick} className="h-5 w-5 cursor-pointer">
            {props.check ? <SquareCheckBig className="h-full w-full" /> : <Square className="h-full w-full" />}
        </button>
    );
};

const ActiveButton = () => {
    const [checked, setChecked] = useState(false);

    const handleClick = () => {
        setChecked((prev) => !prev);
    };

    return (
        <button onClick={handleClick} className="h-5 w-5 cursor-pointer">
            {checked ? <SquareCheckBig className="h-full w-full" /> : <Square className="h-full w-full" />}
        </button>
    );
};

const AddPromotionButton = () => {
    return (
        <button className="font-unbounded absolute top-1/6 right-1/10 z-20 flex h-7 w-52 items-center justify-center rounded-xl bg-pink-400 text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]">
            ADD PROMOTION
        </button>
    );
};

const DeletePromotionButton = (props) => {
    return (
        <button
            className="font-unbounded absolute top-1/6 right-1/10 z-20 flex h-7 w-52 items-center justify-center rounded-xl bg-pink-400 text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]"
            onClick={props.onClicked}
        >
            DELETE
        </button>
    );
};

const RowTemplate = (props) => {
    return (
        <div className="z-10 flex w-full flex-col">
            <div className={`relative flex items-center justify-center gap-1 px-[3%] lg:py-3 xl:gap-2 xl:py-5 ${props.checked ? 'bg-zinc-400' : ''}`}>
                {Array.from({ length: props.data?.length }, (_, index) => {
                    const value = props.data?.[index];
                    return (
                        <p key={index} className={`font-libre-franklin h-full w-full justify-start text-left lg:text-lg xl:text-xl ${props.isHeader ? 'font-bold' : 'font-medium'}`}>
                            {value === 'TickButton' ? (
                                props.isHeader ? (
                                    ''
                                ) : (
                                    <TickButton check={props.checked} onTick={props.onTicked} />
                                )
                            ) : value === 'ActiveButton' ? (
                                props.isHeader ? (
                                    'Active'
                                ) : (
                                    <ActiveButton />
                                )
                            ) : (
                                value
                            )}
                        </p>
                    );
                })}
            </div>
            <div className="relative h-[3px] w-full bg-slate-950" />
        </div>
    );
};

const Header = () => {
    const Data = ['TickButton', 'Code', 'Name', 'Rate', 'Amount', 'Product', 'Royalty', 'Minimum', 'Remainder', 'Usage', 'ActiveButton'];

    return (
        <div className="fixed top-0 z-20 w-full rounded-t-xl lg:bg-zinc-400 xl:bg-zinc-300">
            <RowTemplate data={Data} isHeader={true} />
        </div>
    );
};

const ManageTable = (props) => {
    const handleTick = (rowIndex) => {
        props.setTickedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) {
                newSet.delete(rowIndex);
            } else {
                newSet.add(rowIndex);
            }
            return newSet;
        });
    };

    return (
        <div className="absolute top-1/4 left-1/2 w-[90%] -translate-x-1/2 transform lg:h-[65%] xl:h-[60%]">
            <Header />
            <RowTemplate data={['Null']} />
            <div className="no-scrollbar relative flex h-[90%] w-full flex-col items-center overflow-x-auto">
                {props.data.map((row, index) => (
                    <RowTemplate key={index} data={row} isHeader={false} checked={props.anyTicked.has(index)} onTicked={() => handleTick(index)} />
                ))}
            </div>
        </div>
    );
};

const PromotionManagePage = () => {
    const [tickedRows, setTickedRows] = useState(new Set());
    const [rowList, setRowList] = useState(Array.from({ length: 10 }, () => ['TickButton', 'MHVV', 'Mùa hè vui vẻ', '15', '50000', 'Snack', 'None', '5000', '12', '100', 'ActiveButton']));

    const handleDelete = () => {
        setRowList((prev) => prev.filter((_, index) => !tickedRows.has(index)));
        setTickedRows(new Set());
    };

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                <SearchButton />
                {tickedRows.size > 0 ? <DeletePromotionButton onClicked={handleDelete} /> : <AddPromotionButton />}
                <ManageTable anyTicked={tickedRows} setTickedRows={setTickedRows} data={rowList} />
                <SelectBranchButton />
                <div className="font-unbounded absolute top-5 left-1/6 z-10 justify-start text-5xl font-bold text-black">Promotions</div>
                <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
                <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
            </MobileNotSupported>
        </StaffLayout>
    );
};

export default PromotionManagePage;
