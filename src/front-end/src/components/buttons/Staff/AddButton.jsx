const AddButton = ({ text, onClick, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`font-unbounded relative z-20 flex h-8 w-44 items-center justify-center rounded-md text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all sm:rounded-lg lg:rounded-xl ${
                disabled ? 'cursor-not-allowed bg-gray-400 opacity-50' : 'bg-pink-400 hover:cursor-pointer hover:bg-pink-500'
            }`}
        >
            {text}
        </button>
    );
};

export default AddButton;
