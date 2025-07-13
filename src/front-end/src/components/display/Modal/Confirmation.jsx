import SeatLayout from '../Seats.jsx';

const CancelButton = (props) => {
    return (
        <button className="relative flex h-8 w-40 items-center justify-center" onClick={props.onClick}>
            <div className="absolute inset-0 rounded-2xl bg-slate-900 shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="font-unbounded relative z-10 text-lg font-bold text-white">CANCEL</span>
        </button>
    );
};

const ConfirmButton = (props) => {
    return (
        <button className="relative flex h-8 w-40 items-center justify-center" onClick={props.onClick}>
            <div className="absolute inset-0 rounded-2xl bg-pink-400 shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="font-unbounded relative z-10 text-lg font-bold text-white">CONFIRM</span>
        </button>
    );
};

const ConfirmationModal = (props) => {
    return (
        <div className="absolute inset-0 z-50 bg-slate-900/10 backdrop-blur-[20px]">
            <div className="fixed inset-[30%] flex flex-col items-center justify-center gap-2 rounded-xl shadow-[8px_8px_20px_0px_rgba(0,0,0,0.25)] backdrop-blur-[20px] lg:bg-slate-900/60 xl:bg-slate-900">
                <div className="font-libre-franklin w-full justify-start text-center text-2xl font-medium text-white">
                    Do you want to delete {props.item} {props.item > 1 ? 'items' : 'item'}?
                </div>
                <div className="h-[10%] w-full" />
                <div className="relative flex items-center gap-4">
                    <CancelButton onClick={props.onClose} />
                    <ConfirmButton onClick={props.handleDelete} />
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
