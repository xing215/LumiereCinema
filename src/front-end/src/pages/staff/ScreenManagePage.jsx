import { SquarePen } from 'lucide-react';
import { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import MobileNotSupported from '../../components/display/MobileNotSupported.jsx';
import EditSeatModal from '../../components/display/Modal/EditSeatModal.jsx';
import TickButton from '../../components/buttons/Staff/TickButton.jsx';
import ActiveButton from '../../components/buttons/Staff/ActiveButton.jsx';
import ConfirmationModal from '../../components/display/Modal/Confirmation.jsx';

const EditSeatButton = ({ onClick }) => {
    return (
        <button onClick={onClick} className="h-5 w-5">
            <SquarePen className="h-full w-full" />
        </button>
    );
};

const AddScreenButton = () => {
    return (
        <button className="font-unbounded absolute top-1/20 right-1/15 z-20 flex h-7 w-52 items-center justify-center rounded-xl bg-pink-400 text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]">
            ADD SCREEN
        </button>
    );
};

const DeleteScreenButton = (props) => {
    return (
        <button
            className="font-unbounded absolute top-1/20 right-1/15 z-20 flex h-7 w-52 items-center justify-center rounded-xl bg-pink-400 text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]"
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
                            ) : value === 'EditSeatButton' ? (
                                props.isHeader ? (
                                    'Seat'
                                ) : (
                                    <EditSeatButton onClick={() => props.onEditSeat?.(props.rowIndex)} />
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
    const Data = ['TickButton', 'ID', 'Name', 'Row', 'Column', 'ActiveButton', 'EditSeatButton'];

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
                    <RowTemplate key={index} data={row} isHeader={false} rowIndex={index} checked={props.anyTicked.has(index)} onTicked={() => handleTick(index)} onEditSeat={props.onEditSeat} />
                ))}
            </div>
        </div>
    );
};

const ScreenManagePage = () => {
    const [tickedRows, setTickedRows] = useState(new Set());
    const [rowList, setRowList] = useState(Array.from({ length: 10 }, () => ['TickButton', 1, 1, 10, 20, 'ActiveButton', 'EditSeatButton']));
    const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    const handleDelete = () => {
        setRowList((prev) => prev.filter((_, index) => !tickedRows.has(index)));
        setTickedRows(new Set());
        setIsOpenConfirmationModal(false);
        setTickedRows(new Set());
    };

    return (
        <StaffLayout backgroundClass="bg-zinc-300/70">
            <MobileNotSupported>
                {tickedRows.size > 0 ? <DeleteScreenButton onClicked={() => setIsOpenConfirmationModal(true)} /> : <AddScreenButton />}
                {isOpenConfirmationModal && <ConfirmationModal item={tickedRows.size} handleDelete={handleDelete} onClose={() => setIsOpenConfirmationModal(false)} />}
                <ManageTable anyTicked={tickedRows} setTickedRows={setTickedRows} data={rowList} onEditSeat={setSelectedRowIndex} />

                {selectedRowIndex !== null && <EditSeatModal screenData={rowList[selectedRowIndex]} onClose={() => setSelectedRowIndex(null)} />}

                <div className="font-unbounded absolute top-5 left-1/6 z-10 justify-start text-5xl font-bold text-black">Screen</div>
                <div className="absolute bottom-1/3 left-0 z-5 h-44 w-44 -translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute top-1/5 right-0 z-5 h-44 w-44 translate-x-1/2 transform rounded-full bg-amber-300 mix-blend-hard-light blur-[100px]" />
                <div className="absolute left-1/3 z-5 h-52 w-52 -translate-y-2/3 transform rounded-full bg-blue-500 mix-blend-hard-light blur-[100px]" />
                <div className="absolute right-0 bottom-0 z-5 h-56 w-56 translate-1/2 transform rounded-full bg-purple-600 mix-blend-hard-light blur-[100px]" />
            </MobileNotSupported>
        </StaffLayout>
    );
};

export default ScreenManagePage;
