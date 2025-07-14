const DeleteButton = (props) => {
    return (
        <button
            className="font-unbounded absolute top-1/6 right-1/10 z-20 flex h-7 w-52 items-center justify-center rounded-xl bg-pink-400 text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] hover:cursor-pointer"
            onClick={props.onClicked}
        >
            DELETE
        </button>
    );
};

export default DeleteButton;