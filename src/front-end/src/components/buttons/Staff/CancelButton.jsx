const CancelButton = (props) => {
    return (
        <button className="relative flex h-8 w-40 items-center justify-center" onClick={props.onClick}>
            <div className="absolute inset-0 rounded-2xl bg-slate-900 shadow-[inset_0px_0px_60.654205322265625px_3.639252185821533px_rgba(155,47,255,1.00)]" />
            <span className="font-unbounded relative z-10 text-lg font-bold text-white">CANCEL</span>
        </button>
    );
};

export default CancelButton;